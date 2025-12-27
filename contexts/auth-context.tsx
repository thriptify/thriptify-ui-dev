import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  // State
  isGuest: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string | null;
  } | null;
  firebaseUser: User | null;

  // Referral code from deep link (for applying on signup)
  pendingReferralCode: string | null;
  setPendingReferralCode: (code: string | null) => void;
  clearPendingReferralCode: () => void;

  // Actions
  continueAsGuest: () => void;
  exitGuestMode: () => void;
  signOut: () => Promise<void>;

  // Token for API calls
  getToken: () => Promise<string | null>;

  // For showing login prompt when guest tries to access protected features
  requireAuth: (feature?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Guest mode is session-only (not persisted) - login shows on every app open
  const [isGuest, setIsGuest] = useState(false);
  // Referral code from deep link - will be applied on signup
  const [pendingReferralCode, setPendingReferralCode] = useState<string | null>(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsLoading(false);

      // Clear guest mode when user signs in
      if (user && isGuest) {
        setIsGuest(false);
      }

      console.log('[Auth] Firebase auth state changed:', user ? user.email : 'signed out');
    });

    return () => unsubscribe();
  }, [isGuest]);

  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    console.log('[Auth] Continuing as guest (session only)');
  }, []);

  const exitGuestMode = useCallback(() => {
    setIsGuest(false);
    console.log('[Auth] Exited guest mode');
  }, []);

  const clearPendingReferralCode = useCallback(() => {
    setPendingReferralCode(null);
    console.log('[Auth] Cleared pending referral code');
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (firebaseUser) {
        await firebaseSignOut(auth);
      }
      setIsGuest(false);
      console.log('[Auth] Signed out');
    } catch (error) {
      console.error('[Auth] Error signing out:', error);
      throw error;
    }
  }, [firebaseUser]);

  // Get Firebase ID token for API calls
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      const token = await firebaseUser.getIdToken();
      return token;
    } catch (error) {
      console.error('[Auth] Error getting token:', error);
      return null;
    }
  }, [firebaseUser]);

  // Check if user can access a feature, returns false if guest (for showing login prompt)
  const requireAuth = useCallback((feature?: string): boolean => {
    if (firebaseUser) return true;
    if (isGuest) {
      console.log(`[Auth] Guest tried to access protected feature: ${feature || 'unknown'}`);
      return false;
    }
    return false;
  }, [firebaseUser, isGuest]);

  // Build user object from Firebase user
  const user = firebaseUser ? {
    id: firebaseUser.uid,
    firstName: firebaseUser.displayName?.split(' ')[0] || null,
    lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || null,
    email: firebaseUser.email,
    imageUrl: firebaseUser.photoURL,
  } : null;

  const value: AuthContextType = {
    isGuest,
    isAuthenticated: !!firebaseUser,
    isLoading,
    user,
    firebaseUser,
    pendingReferralCode,
    setPendingReferralCode,
    clearPendingReferralCode,
    continueAsGuest,
    exitGuestMode,
    signOut,
    getToken,
    requireAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAppAuth must be used within an AuthProvider');
  }
  return context;
}
