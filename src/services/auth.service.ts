import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserCreateInput } from '../types';
import { COLLECTIONS } from '../config/constants';

export const authService = {
  /**
   * Register a new user with email and password
   */
  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<FirebaseUser> {
    // Create Firebase Auth user
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name
    await updateProfile(credential.user, { displayName });

    // Create user document in Firestore
    await this.createUserDocument({
      email,
      displayName,
      photoURL: null,
    }, credential.user.uid);

    return credential.user;
  },

  /**
   * Create user document in Firestore
   */
  async createUserDocument(input: UserCreateInput, uid: string): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    const userData: Omit<User, 'createdAt' | 'updatedAt'> & {
      createdAt: ReturnType<typeof serverTimestamp>;
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      id: uid,
      email: input.email,
      displayName: input.displayName,
      photoURL: input.photoURL ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      partnerId: null,
      partnerStatus: 'none',
      partnerSince: null,
      points: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      notifications: {
        dailyReminder: true,
        reminderTime: '09:00',
        partnerActivity: true,
        achievements: true,
      },
      expoPushToken: null,
    };

    await setDoc(userRef, userData);
  },

  /**
   * Sign in with email and password
   */
  async login(email: string, password: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Sign in with Google (using ID token from expo-auth-session)
   */
  async signInWithGoogle(idToken: string): Promise<FirebaseUser> {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);

    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, result.user.uid));
    if (!userDoc.exists()) {
      await this.createUserDocument({
        email: result.user.email ?? '',
        displayName: result.user.displayName ?? 'User',
        photoURL: result.user.photoURL,
      }, result.user.uid);
    }

    return result.user;
  },

  /**
   * Sign in with Apple (using identity token from expo-apple-authentication)
   */
  async signInWithApple(
    identityToken: string,
    nonce: string
  ): Promise<FirebaseUser> {
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: identityToken,
      rawNonce: nonce,
    });
    const result = await signInWithCredential(auth, credential);

    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, result.user.uid));
    if (!userDoc.exists()) {
      await this.createUserDocument({
        email: result.user.email ?? '',
        displayName: result.user.displayName ?? 'User',
        photoURL: result.user.photoURL,
      }, result.user.uid);
    }

    return result.user;
  },

  /**
   * Get current Firebase user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(
    callback: (user: FirebaseUser | null) => void
  ): () => void {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Get user document from Firestore
   */
  async getUserDocument(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (!userDoc.exists()) return null;
    return { id: userDoc.id, ...userDoc.data() } as User;
  },
};
