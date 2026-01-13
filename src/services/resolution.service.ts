import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Resolution,
  ResolutionCreateInput,
  ResolutionUpdateInput,
  Completion,
  DeadlineType,
} from '../types';
import { COLLECTIONS } from '../config/constants';
import { BASE_POINTS } from '../config/gamification';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  isWithinInterval,
} from 'date-fns';

export const resolutionService = {
  /**
   * Get the resolutions collection reference for a user
   */
  getResolutionsRef(userId: string) {
    return collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.RESOLUTIONS);
  },

  /**
   * Get the completions collection reference for a resolution
   */
  getCompletionsRef(userId: string, resolutionId: string) {
    return collection(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.RESOLUTIONS,
      resolutionId,
      COLLECTIONS.COMPLETIONS
    );
  },

  /**
   * Create a new resolution
   */
  async createResolution(
    userId: string,
    input: ResolutionCreateInput
  ): Promise<string> {
    const resolutionsRef = this.getResolutionsRef(userId);

    const resolution = {
      userId,
      title: input.title,
      description: input.description || null,
      themeId: input.themeId,
      deadlineType: input.deadlineType,
      customDeadline: input.customDeadline
        ? Timestamp.fromDate(input.customDeadline)
        : null,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      lastCompletedAt: null,
      pointsPerCompletion: BASE_POINTS[input.deadlineType],
      sharedWithPartner: input.sharedWithPartner ?? true,
    };

    const docRef = await addDoc(resolutionsRef, resolution);
    return docRef.id;
  },

  /**
   * Get a single resolution by ID
   */
  async getResolution(
    userId: string,
    resolutionId: string
  ): Promise<Resolution | null> {
    const docRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.RESOLUTIONS,
      resolutionId
    );
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return { id: docSnap.id, ...docSnap.data() } as Resolution;
  },

  /**
   * Get all active resolutions for a user
   */
  async getResolutions(userId: string): Promise<Resolution[]> {
    const resolutionsRef = this.getResolutionsRef(userId);
    const q = query(
      resolutionsRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Resolution)
    );
  },

  /**
   * Subscribe to resolutions changes (real-time)
   */
  subscribeToResolutions(
    userId: string,
    callback: (resolutions: Resolution[]) => void
  ): () => void {
    const resolutionsRef = this.getResolutionsRef(userId);
    const q = query(
      resolutionsRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const resolutions = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Resolution)
      );
      callback(resolutions);
    });
  },

  /**
   * Update a resolution
   */
  async updateResolution(
    userId: string,
    resolutionId: string,
    input: ResolutionUpdateInput
  ): Promise<void> {
    const docRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.RESOLUTIONS,
      resolutionId
    );

    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.themeId !== undefined) updateData.themeId = input.themeId;
    if (input.deadlineType !== undefined) {
      updateData.deadlineType = input.deadlineType;
      updateData.pointsPerCompletion = BASE_POINTS[input.deadlineType];
    }
    if (input.customDeadline !== undefined) {
      updateData.customDeadline = input.customDeadline
        ? Timestamp.fromDate(input.customDeadline)
        : null;
    }
    if (input.sharedWithPartner !== undefined)
      updateData.sharedWithPartner = input.sharedWithPartner;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    await updateDoc(docRef, updateData);
  },

  /**
   * Delete a resolution (soft delete)
   */
  async deleteResolution(userId: string, resolutionId: string): Promise<void> {
    await this.updateResolution(userId, resolutionId, { isActive: false });
  },

  /**
   * Hard delete a resolution
   */
  async hardDeleteResolution(
    userId: string,
    resolutionId: string
  ): Promise<void> {
    const docRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.RESOLUTIONS,
      resolutionId
    );
    await deleteDoc(docRef);
  },

  /**
   * Get the current period for a deadline type
   */
  getCurrentPeriod(deadlineType: DeadlineType, customDeadline?: Date | null): {
    start: Date;
    end: Date;
  } {
    const now = new Date();

    switch (deadlineType) {
      case 'daily':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'weekly':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'monthly':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarterly':
        return { start: startOfQuarter(now), end: endOfQuarter(now) };
      case 'custom':
        if (customDeadline) {
          return { start: startOfDay(now), end: endOfDay(customDeadline) };
        }
        return { start: startOfDay(now), end: endOfDay(now) };
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
    }
  },

  /**
   * Check if resolution is already completed for current period
   */
  async isCompletedForPeriod(
    userId: string,
    resolutionId: string,
    deadlineType: DeadlineType,
    customDeadline?: Date | null
  ): Promise<boolean> {
    const { start, end } = this.getCurrentPeriod(deadlineType, customDeadline);
    const completionsRef = this.getCompletionsRef(userId, resolutionId);

    const q = query(
      completionsRef,
      where('periodStart', '>=', Timestamp.fromDate(start)),
      where('periodStart', '<=', Timestamp.fromDate(end))
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  /**
   * Complete a resolution for the current period
   */
  async completeResolution(
    userId: string,
    resolutionId: string
  ): Promise<{ pointsEarned: number; newStreak: number } | null> {
    const resolution = await this.getResolution(userId, resolutionId);
    if (!resolution) return null;

    // Check if already completed for this period
    const alreadyCompleted = await this.isCompletedForPeriod(
      userId,
      resolutionId,
      resolution.deadlineType,
      resolution.customDeadline?.toDate()
    );

    if (alreadyCompleted) return null;

    const { start, end } = this.getCurrentPeriod(
      resolution.deadlineType,
      resolution.customDeadline?.toDate()
    );

    // Calculate new streak
    const newStreak = resolution.currentStreak + 1;
    const pointsEarned = resolution.pointsPerCompletion;

    const batch = writeBatch(db);

    // Add completion record
    const completionsRef = this.getCompletionsRef(userId, resolutionId);
    const completionDoc = doc(completionsRef);
    batch.set(completionDoc, {
      resolutionId,
      completedAt: serverTimestamp(),
      periodStart: Timestamp.fromDate(start),
      periodEnd: Timestamp.fromDate(end),
      pointsEarned,
      streakAtCompletion: newStreak,
    });

    // Update resolution stats
    const resolutionRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.RESOLUTIONS,
      resolutionId
    );
    batch.update(resolutionRef, {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, resolution.longestStreak),
      totalCompletions: resolution.totalCompletions + 1,
      lastCompletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update user stats
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (userData) {
      batch.update(userRef, {
        points: (userData.points || 0) + pointsEarned,
        totalCompletions: (userData.totalCompletions || 0) + 1,
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();

    return { pointsEarned, newStreak };
  },

  /**
   * Uncomplete a resolution (remove last completion for current period)
   */
  async uncompleteResolution(
    userId: string,
    resolutionId: string
  ): Promise<boolean> {
    const resolution = await this.getResolution(userId, resolutionId);
    if (!resolution) return false;

    const { start, end } = this.getCurrentPeriod(
      resolution.deadlineType,
      resolution.customDeadline?.toDate()
    );

    const completionsRef = this.getCompletionsRef(userId, resolutionId);
    const q = query(
      completionsRef,
      where('periodStart', '>=', Timestamp.fromDate(start)),
      where('periodStart', '<=', Timestamp.fromDate(end))
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;

    const completionDoc = snapshot.docs[0];
    const completionData = completionDoc.data() as Completion;

    const batch = writeBatch(db);

    // Delete completion
    batch.delete(completionDoc.ref);

    // Update resolution stats
    const resolutionRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.RESOLUTIONS,
      resolutionId
    );
    batch.update(resolutionRef, {
      currentStreak: Math.max(0, resolution.currentStreak - 1),
      totalCompletions: Math.max(0, resolution.totalCompletions - 1),
      updatedAt: serverTimestamp(),
    });

    // Update user stats
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (userData) {
      batch.update(userRef, {
        points: Math.max(0, (userData.points || 0) - completionData.pointsEarned),
        totalCompletions: Math.max(0, (userData.totalCompletions || 0) - 1),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
    return true;
  },

  /**
   * Get today's resolutions (daily goals due today)
   */
  async getTodaysResolutions(userId: string): Promise<Resolution[]> {
    const allResolutions = await this.getResolutions(userId);

    return allResolutions.filter((resolution) => {
      if (resolution.deadlineType === 'daily') return true;
      // For other types, check if we're within the current period
      const { start, end } = this.getCurrentPeriod(
        resolution.deadlineType,
        resolution.customDeadline?.toDate()
      );
      return isWithinInterval(new Date(), { start, end });
    });
  },
};
