import { Timestamp } from 'firebase/firestore';

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type ChallengeType = 'weekly_points' | 'streak_battle' | 'completion_race';
export type ChallengeStatus = 'active' | 'completed';

export interface PartnerInvite {
  id: string;
  senderId: string;
  senderName: string;
  senderPhotoURL: string | null;
  recipientEmail: string;
  recipientId: string | null;
  status: InviteStatus;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  inviteCode: string;
}

export interface ChallengeParticipant {
  displayName: string;
  photoURL: string | null;
  score: number;
  completions: number;
}

export interface PartnerChallenge {
  id: string;
  participants: Record<string, ChallengeParticipant>;
  type: ChallengeType;
  title: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: ChallengeStatus;
  winnerId: string | null;
  winnerDeclaredAt: Timestamp | null;
}

export interface PartnerInfo {
  id: string;
  displayName: string;
  photoURL: string | null;
  points: number;
  level: number;
  currentStreak: number;
  totalCompletions: number;
}
