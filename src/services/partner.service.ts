import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, PartnerStatus } from '../types/user.types';
import { PartnerInvite, PartnerInfo, PartnerChallenge } from '../types/partner.types';
import { Resolution } from '../types/resolution.types';

// Generate a 6-character invite code
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars like 0/O, 1/I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

class PartnerService {
  // Create a partner invite with a unique code
  async createInvite(userId: string, userName: string, userPhotoURL: string | null): Promise<PartnerInvite> {
    // Generate a unique code
    let inviteCode = generateInviteCode();
    let codeExists = true;

    while (codeExists) {
      const existingInvite = await this.getInviteByCode(inviteCode);
      if (!existingInvite || existingInvite.status !== 'pending') {
        codeExists = false;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    const inviteRef = doc(collection(db, 'partnerInvites'));
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days

    const invite: PartnerInvite = {
      id: inviteRef.id,
      senderId: userId,
      senderName: userName,
      senderPhotoURL: userPhotoURL,
      recipientEmail: '',
      recipientId: null,
      status: 'pending',
      createdAt: now,
      expiresAt,
      inviteCode,
    };

    await setDoc(inviteRef, invite);

    // Update user's partner status
    await updateDoc(doc(db, 'users', userId), {
      partnerStatus: 'pending_sent' as PartnerStatus,
    });

    return invite;
  }

  // Get invite by code
  async getInviteByCode(code: string): Promise<PartnerInvite | null> {
    const q = query(
      collection(db, 'partnerInvites'),
      where('inviteCode', '==', code.toUpperCase())
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data() as PartnerInvite;
  }

  // Get user's pending invite (sent)
  async getPendingInvite(userId: string): Promise<PartnerInvite | null> {
    const q = query(
      collection(db, 'partnerInvites'),
      where('senderId', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data() as PartnerInvite;
  }

  // Accept an invite using a code
  async acceptInvite(code: string, recipientId: string, recipientName: string): Promise<boolean> {
    try {
      const invite = await this.getInviteByCode(code);

      if (!invite) {
        throw new Error('Invite not found');
      }

      if (invite.status !== 'pending') {
        throw new Error('This invite is no longer valid');
      }

      if (invite.expiresAt.toDate() < new Date()) {
        throw new Error('This invite has expired');
      }

      if (invite.senderId === recipientId) {
        throw new Error('You cannot accept your own invite');
      }

      const now = Timestamp.now();

      // Update the invite
      await updateDoc(doc(db, 'partnerInvites', invite.id), {
        recipientId,
        status: 'accepted',
      });

      // Update both users to be partners
      const senderRef = doc(db, 'users', invite.senderId);
      const recipientRef = doc(db, 'users', recipientId);

      await updateDoc(senderRef, {
        partnerId: recipientId,
        partnerStatus: 'active' as PartnerStatus,
        partnerSince: now,
      });

      await updateDoc(recipientRef, {
        partnerId: invite.senderId,
        partnerStatus: 'active' as PartnerStatus,
        partnerSince: now,
      });

      return true;
    } catch (error) {
      console.error('Error accepting invite:', error);
      throw error;
    }
  }

  // Cancel a pending invite
  async cancelInvite(inviteId: string, userId: string): Promise<void> {
    await deleteDoc(doc(db, 'partnerInvites', inviteId));

    await updateDoc(doc(db, 'users', userId), {
      partnerStatus: 'none' as PartnerStatus,
    });
  }

  // Unlink from partner
  async unlinkPartner(userId: string, partnerId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const partnerRef = doc(db, 'users', partnerId);

    await updateDoc(userRef, {
      partnerId: null,
      partnerStatus: 'none' as PartnerStatus,
      partnerSince: null,
    });

    await updateDoc(partnerRef, {
      partnerId: null,
      partnerStatus: 'none' as PartnerStatus,
      partnerSince: null,
    });
  }

  // Get partner's info
  async getPartnerInfo(partnerId: string): Promise<PartnerInfo | null> {
    const partnerDoc = await getDoc(doc(db, 'users', partnerId));

    if (!partnerDoc.exists()) return null;

    const partner = partnerDoc.data() as User;

    return {
      id: partner.id,
      displayName: partner.displayName,
      photoURL: partner.photoURL,
      points: partner.points,
      level: partner.level,
      currentStreak: partner.currentStreak,
      totalCompletions: partner.totalCompletions,
    };
  }

  // Subscribe to partner's info updates
  subscribeToPartner(partnerId: string, callback: (partner: PartnerInfo | null) => void): Unsubscribe {
    return onSnapshot(
      doc(db, 'users', partnerId),
      (snapshot) => {
        if (!snapshot.exists()) {
          callback(null);
          return;
        }

        const partner = snapshot.data() as User;
        callback({
          id: partner.id,
          displayName: partner.displayName,
          photoURL: partner.photoURL,
          points: partner.points,
          level: partner.level,
          currentStreak: partner.currentStreak,
          totalCompletions: partner.totalCompletions,
        });
      },
      (error) => {
        console.error('Error subscribing to partner:', error);
        callback(null);
      }
    );
  }

  // Get partner's shared resolutions
  async getPartnerResolutions(partnerId: string): Promise<Resolution[]> {
    const q = query(
      collection(db, 'users', partnerId, 'resolutions'),
      where('sharedWithPartner', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Resolution[];
  }

  // Subscribe to partner's shared resolutions
  subscribeToPartnerResolutions(
    partnerId: string,
    callback: (resolutions: Resolution[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'users', partnerId, 'resolutions'),
      where('sharedWithPartner', '==', true)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const resolutions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Resolution[];
        callback(resolutions);
      },
      (error) => {
        console.error('Error subscribing to partner resolutions:', error);
        callback([]);
      }
    );
  }

  // Create a weekly challenge
  async createChallenge(
    userId: string,
    userName: string,
    userPhotoURL: string | null,
    partnerId: string,
    partnerName: string,
    partnerPhotoURL: string | null
  ): Promise<PartnerChallenge> {
    const challengeRef = doc(collection(db, 'partnerChallenges'));
    const now = new Date();
    const startDate = Timestamp.fromDate(now);

    // End date is next Sunday at midnight
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + (7 - now.getDay()));
    endDate.setHours(23, 59, 59, 999);

    const challenge: PartnerChallenge = {
      id: challengeRef.id,
      participants: {
        [userId]: {
          displayName: userName,
          photoURL: userPhotoURL,
          score: 0,
          completions: 0,
        },
        [partnerId]: {
          displayName: partnerName,
          photoURL: partnerPhotoURL,
          score: 0,
          completions: 0,
        },
      },
      type: 'weekly_points',
      title: 'Weekly Points Challenge',
      startDate,
      endDate: Timestamp.fromDate(endDate),
      status: 'active',
      winnerId: null,
      winnerDeclaredAt: null,
    };

    await setDoc(challengeRef, challenge);
    return challenge;
  }

  // Get active challenge between two users
  async getActiveChallenge(userId: string, partnerId: string): Promise<PartnerChallenge | null> {
    const q = query(
      collection(db, 'partnerChallenges'),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);

    for (const doc of snapshot.docs) {
      const challenge = doc.data() as PartnerChallenge;
      if (challenge.participants[userId] && challenge.participants[partnerId]) {
        return challenge;
      }
    }

    return null;
  }

  // Subscribe to active challenge
  subscribeToActiveChallenge(
    userId: string,
    partnerId: string,
    callback: (challenge: PartnerChallenge | null) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'partnerChallenges'),
      where('status', '==', 'active')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        for (const doc of snapshot.docs) {
          const challenge = doc.data() as PartnerChallenge;
          if (challenge.participants[userId] && challenge.participants[partnerId]) {
            callback(challenge);
            return;
          }
        }
        callback(null);
      },
      (error) => {
        console.error('Error subscribing to challenge:', error);
        callback(null);
      }
    );
  }

  // Update challenge score for a user
  async updateChallengeScore(challengeId: string, oduserId: string, pointsToAdd: number): Promise<void> {
    const challengeRef = doc(db, 'partnerChallenges', challengeId);
    const challengeDoc = await getDoc(challengeRef);

    if (!challengeDoc.exists()) return;

    const challenge = challengeDoc.data() as PartnerChallenge;
    const participant = challenge.participants[oduserId];

    if (!participant) return;

    await updateDoc(challengeRef, {
      [`participants.${oduserId}.score`]: participant.score + pointsToAdd,
      [`participants.${oduserId}.completions`]: participant.completions + 1,
    });
  }
}

export const partnerService = new PartnerService();
