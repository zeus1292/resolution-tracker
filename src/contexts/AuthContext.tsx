import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/auth.service';
import { User } from '../types';

interface AuthContextType {
  // State
  firebaseUser: FirebaseUser | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithApple: (identityToken: string, nonce: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user document when Firebase user changes
  const loadUserDocument = useCallback(async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      setUser(null);
      return;
    }

    try {
      const userDoc = await authService.getUserDocument(fbUser.uid);
      setUser(userDoc);
    } catch (error) {
      console.error('Error loading user document:', error);
      setUser(null);
    }
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      await loadUserDocument(fbUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [loadUserDocument]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login(email, password);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      setIsLoading(true);
      try {
        await authService.register(email, password, displayName);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  // Google sign in
  const signInWithGoogle = useCallback(async (idToken: string) => {
    setIsLoading(true);
    try {
      await authService.signInWithGoogle(idToken);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apple sign in
  const signInWithApple = useCallback(
    async (identityToken: string, nonce: string) => {
      setIsLoading(true);
      try {
        await authService.signInWithApple(identityToken, nonce);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Refresh user document
  const refreshUser = useCallback(async () => {
    if (firebaseUser) {
      await loadUserDocument(firebaseUser);
    }
  }, [firebaseUser, loadUserDocument]);

  const value: AuthContextType = {
    firebaseUser,
    user,
    isLoading,
    isAuthenticated: !!firebaseUser,
    login,
    register,
    logout,
    resetPassword,
    signInWithGoogle,
    signInWithApple,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
