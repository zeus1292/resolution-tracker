import { useState, useEffect, useCallback } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { badgeService } from '../services/badge.service';
import { Badge, UserBadge } from '../types/gamification.types';
import { BADGES, getBadgeById } from '../config/gamification';

export interface BadgeWithStatus extends Badge {
  earned: boolean;
  earnedAt?: Date;
}

export function useBadges() {
  const { user } = useAuth();

  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to earned badges
  useEffect(() => {
    if (!user?.id) {
      setEarnedBadges([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = badgeService.subscribeToEarnedBadges(user.id, (badges) => {
      setEarnedBadges(badges);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Get all badges with earned status
  const allBadgesWithStatus: BadgeWithStatus[] = BADGES.map((badge) => {
    const earned = earnedBadges.find((eb) => eb.badgeId === badge.id);
    return {
      ...badge,
      earned: !!earned,
      earnedAt: earned?.earnedAt?.toDate(),
    };
  }).sort((a, b) => {
    // Sort: earned first, then by sort order
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  // Get earned badge details
  const earnedBadgeDetails: BadgeWithStatus[] = earnedBadges
    .map((userBadge) => {
      const badge = getBadgeById(userBadge.badgeId);
      if (!badge) return null;
      return {
        ...badge,
        earned: true,
        earnedAt: userBadge.earnedAt?.toDate(),
      };
    })
    .filter((b): b is BadgeWithStatus => b !== null)
    .sort((a, b) => {
      // Sort by earned date, most recent first
      if (a.earnedAt && b.earnedAt) {
        return b.earnedAt.getTime() - a.earnedAt.getTime();
      }
      return 0;
    });

  // Get badges by category with earned status
  const getBadgesByCategory = useCallback(
    (category: Badge['category']): BadgeWithStatus[] => {
      return allBadgesWithStatus
        .filter((b) => b.category === category)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },
    [allBadgesWithStatus]
  );

  // Check and award new badges
  const checkForNewBadges = useCallback(async (): Promise<Badge[]> => {
    if (!user) return [];

    try {
      const newBadges = await badgeService.checkAndAwardBadges(user);
      return newBadges;
    } catch (error) {
      console.error('Error checking for new badges:', error);
      return [];
    }
  }, [user]);

  return {
    earnedBadges,
    earnedBadgeDetails,
    allBadgesWithStatus,
    earnedCount: earnedBadges.length,
    totalCount: BADGES.length,
    isLoading,
    getBadgesByCategory,
    checkForNewBadges,
  };
}
