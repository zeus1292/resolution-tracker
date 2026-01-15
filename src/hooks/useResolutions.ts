import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { resolutionService } from '../services/resolution.service';
import { badgeService } from '../services/badge.service';
import {
  Resolution,
  ResolutionCreateInput,
  ResolutionUpdateInput,
} from '../types';
import { Badge } from '../types/gamification.types';

export function useResolutions() {
  const { user } = useAuth();
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to resolutions
  useEffect(() => {
    if (!user?.id) {
      setResolutions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = resolutionService.subscribeToResolutions(
      user.id,
      (newResolutions) => {
        setResolutions(newResolutions);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Failed to load resolutions:', err.message, err.code);
        setError(`Failed to load goals: ${err.message}`);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.id]);

  // Create resolution
  const createResolution = useCallback(
    async (input: ResolutionCreateInput): Promise<string | null> => {
      if (!user?.id) return null;

      try {
        setError(null);
        const id = await resolutionService.createResolution(user.id, input);
        return id;
      } catch (err: any) {
        setError(err.message || 'Failed to create resolution');
        return null;
      }
    },
    [user?.id]
  );

  // Update resolution
  const updateResolution = useCallback(
    async (resolutionId: string, input: ResolutionUpdateInput): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        setError(null);
        await resolutionService.updateResolution(user.id, resolutionId, input);
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to update resolution');
        return false;
      }
    },
    [user?.id]
  );

  // Delete resolution
  const deleteResolution = useCallback(
    async (resolutionId: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        setError(null);
        await resolutionService.deleteResolution(user.id, resolutionId);
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to delete resolution');
        return false;
      }
    },
    [user?.id]
  );

  // Complete resolution
  const completeResolution = useCallback(
    async (
      resolutionId: string
    ): Promise<{ pointsEarned: number; newStreak: number; newBadges?: Badge[] } | null> => {
      if (!user?.id || !user) return null;

      try {
        setError(null);
        const result = await resolutionService.completeResolution(
          user.id,
          resolutionId
        );

        if (result) {
          // Check for new badges after completion
          const newBadges = await badgeService.checkAndAwardBadges(user);
          return { ...result, newBadges };
        }

        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to complete resolution');
        return null;
      }
    },
    [user]
  );

  // Uncomplete resolution
  const uncompleteResolution = useCallback(
    async (resolutionId: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        setError(null);
        return await resolutionService.uncompleteResolution(user.id, resolutionId);
      } catch (err: any) {
        setError(err.message || 'Failed to uncomplete resolution');
        return false;
      }
    },
    [user?.id]
  );

  // Check if completed for period
  const isCompletedForPeriod = useCallback(
    async (resolution: Resolution): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        return await resolutionService.isCompletedForPeriod(
          user.id,
          resolution.id,
          resolution.deadlineType,
          resolution.customDeadline?.toDate()
        );
      } catch {
        return false;
      }
    },
    [user?.id]
  );

  return {
    resolutions,
    isLoading,
    error,
    createResolution,
    updateResolution,
    deleteResolution,
    completeResolution,
    uncompleteResolution,
    isCompletedForPeriod,
  };
}
