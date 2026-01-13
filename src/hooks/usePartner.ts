import { useState, useEffect, useCallback } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { partnerService } from '../services/partner.service';
import { PartnerInfo, PartnerInvite, PartnerChallenge } from '../types/partner.types';
import { Resolution } from '../types/resolution.types';

export function usePartner() {
  const { user, refreshUser } = useAuth();

  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [partnerResolutions, setPartnerResolutions] = useState<Resolution[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<PartnerChallenge | null>(null);
  const [pendingInvite, setPendingInvite] = useState<PartnerInvite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for pending invite when no partner
  useEffect(() => {
    if (!user?.id || user.partnerStatus === 'active') {
      setPendingInvite(null);
      return;
    }

    const checkPendingInvite = async () => {
      try {
        const invite = await partnerService.getPendingInvite(user.id);
        setPendingInvite(invite);
      } catch (err) {
        console.error('Error checking pending invite:', err);
      }
    };

    checkPendingInvite();
  }, [user?.id, user?.partnerStatus]);

  // Subscribe to partner info and resolutions when connected
  useEffect(() => {
    if (!user?.partnerId || user.partnerStatus !== 'active') {
      setPartnerInfo(null);
      setPartnerResolutions([]);
      setActiveChallenge(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribers: Unsubscribe[] = [];

    // Subscribe to partner info
    const unsubPartner = partnerService.subscribeToPartner(
      user.partnerId,
      (info) => {
        setPartnerInfo(info);
        setIsLoading(false);
      }
    );
    unsubscribers.push(unsubPartner);

    // Subscribe to partner's shared resolutions
    const unsubResolutions = partnerService.subscribeToPartnerResolutions(
      user.partnerId,
      (resolutions) => {
        setPartnerResolutions(resolutions);
      }
    );
    unsubscribers.push(unsubResolutions);

    // Subscribe to active challenge
    const unsubChallenge = partnerService.subscribeToActiveChallenge(
      user.id,
      user.partnerId,
      (challenge) => {
        setActiveChallenge(challenge);
      }
    );
    unsubscribers.push(unsubChallenge);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [user?.id, user?.partnerId, user?.partnerStatus]);

  // Create an invite
  const createInvite = useCallback(async (): Promise<PartnerInvite | null> => {
    if (!user?.id) return null;

    setError(null);
    try {
      const invite = await partnerService.createInvite(
        user.id,
        user.displayName,
        user.photoURL
      );
      setPendingInvite(invite);
      await refreshUser();
      return invite;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create invite';
      setError(message);
      return null;
    }
  }, [user, refreshUser]);

  // Accept an invite using a code
  const acceptInvite = useCallback(async (code: string): Promise<boolean> => {
    if (!user?.id) return false;

    setError(null);
    try {
      await partnerService.acceptInvite(code, user.id, user.displayName);
      await refreshUser();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept invite';
      setError(message);
      return false;
    }
  }, [user, refreshUser]);

  // Cancel a pending invite
  const cancelInvite = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !pendingInvite) return false;

    setError(null);
    try {
      await partnerService.cancelInvite(pendingInvite.id, user.id);
      setPendingInvite(null);
      await refreshUser();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel invite';
      setError(message);
      return false;
    }
  }, [user?.id, pendingInvite, refreshUser]);

  // Unlink from partner
  const unlinkPartner = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !user?.partnerId) return false;

    setError(null);
    try {
      await partnerService.unlinkPartner(user.id, user.partnerId);
      await refreshUser();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unlink partner';
      setError(message);
      return false;
    }
  }, [user?.id, user?.partnerId, refreshUser]);

  // Start a weekly challenge
  const startChallenge = useCallback(async (): Promise<PartnerChallenge | null> => {
    if (!user?.id || !user?.partnerId || !partnerInfo) return null;

    setError(null);
    try {
      const challenge = await partnerService.createChallenge(
        user.id,
        user.displayName,
        user.photoURL,
        user.partnerId,
        partnerInfo.displayName,
        partnerInfo.photoURL
      );
      setActiveChallenge(challenge);
      return challenge;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start challenge';
      setError(message);
      return null;
    }
  }, [user, partnerInfo]);

  return {
    // State
    partnerInfo,
    partnerResolutions,
    activeChallenge,
    pendingInvite,
    isLoading,
    error,

    // Actions
    createInvite,
    acceptInvite,
    cancelInvite,
    unlinkPartner,
    startChallenge,
  };
}
