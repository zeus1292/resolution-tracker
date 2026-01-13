import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Badge, UserBadge } from '../types/gamification.types';
import { User } from '../types/user.types';
import { BADGES, getBadgeById } from '../config/gamification';

class BadgeService {
  // Get all earned badges for a user
  async getEarnedBadges(userId: string): Promise<UserBadge[]> {
    const badgesRef = collection(db, 'users', userId, 'badges');
    const snapshot = await getDocs(badgesRef);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      badgeId: doc.id,
    })) as UserBadge[];
  }

  // Subscribe to earned badges
  subscribeToEarnedBadges(userId: string, callback: (badges: UserBadge[]) => void): Unsubscribe {
    const badgesRef = collection(db, 'users', userId, 'badges');

    return onSnapshot(
      badgesRef,
      (snapshot) => {
        const badges = snapshot.docs.map((doc) => ({
          ...doc.data(),
          badgeId: doc.id,
        })) as UserBadge[];
        callback(badges);
      },
      (error) => {
        console.error('Error subscribing to badges:', error);
        callback([]);
      }
    );
  }

  // Check if user has earned a specific badge
  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const badgeRef = doc(db, 'users', userId, 'badges', badgeId);
    const badgeDoc = await getDoc(badgeRef);
    return badgeDoc.exists();
  }

  // Award a badge to user
  async awardBadge(userId: string, badgeId: string): Promise<UserBadge | null> {
    const badge = getBadgeById(badgeId);
    if (!badge) return null;

    // Check if already earned
    const alreadyEarned = await this.hasBadge(userId, badgeId);
    if (alreadyEarned) return null;

    const userBadge: UserBadge = {
      badgeId,
      earnedAt: Timestamp.now(),
      notified: false,
    };

    const badgeRef = doc(db, 'users', userId, 'badges', badgeId);
    await setDoc(badgeRef, userBadge);

    return userBadge;
  }

  // Check and award eligible badges based on user stats
  async checkAndAwardBadges(user: User): Promise<Badge[]> {
    const newBadges: Badge[] = [];

    for (const badge of BADGES) {
      // Skip if already earned
      const alreadyEarned = await this.hasBadge(user.id, badge.id);
      if (alreadyEarned) continue;

      let earned = false;

      switch (badge.criteria.type) {
        case 'streak':
          earned = user.currentStreak >= badge.criteria.threshold ||
                   user.longestStreak >= badge.criteria.threshold;
          break;

        case 'total_completions':
          earned = user.totalCompletions >= badge.criteria.threshold;
          break;

        case 'points':
          earned = user.points >= badge.criteria.threshold;
          break;

        case 'level':
          earned = user.level >= badge.criteria.threshold;
          break;

        case 'partner_challenge':
          // This would need additional tracking - skip for now
          earned = false;
          break;

        case 'theme_mastery':
          // This would need theme-specific completion tracking - skip for now
          earned = false;
          break;

        default:
          earned = false;
      }

      if (earned) {
        const userBadge = await this.awardBadge(user.id, badge.id);
        if (userBadge) {
          newBadges.push(badge);
        }
      }
    }

    return newBadges;
  }

  // Get all badges with earned status
  getAllBadgesWithStatus(earnedBadgeIds: string[]): Array<Badge & { earned: boolean; earnedAt?: Timestamp }> {
    return BADGES.map((badge) => ({
      ...badge,
      earned: earnedBadgeIds.includes(badge.id),
    })).sort((a, b) => {
      // Sort: earned first, then by sort order
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });
  }

  // Mark badge as notified (user has seen the notification)
  async markBadgeNotified(userId: string, badgeId: string): Promise<void> {
    const badgeRef = doc(db, 'users', userId, 'badges', badgeId);
    await setDoc(badgeRef, { notified: true }, { merge: true });
  }

  // Get unnotified badges
  async getUnnotifiedBadges(userId: string): Promise<UserBadge[]> {
    const q = query(
      collection(db, 'users', userId, 'badges'),
      where('notified', '==', false)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as UserBadge[];
  }
}

export const badgeService = new BadgeService();
