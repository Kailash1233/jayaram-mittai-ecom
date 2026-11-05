'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — AUTH CONTEXT
// Reactive view over the token store (src/lib/api/tokenStore.ts) for phone
// + WhatsApp OTP login. No password, no name required to sign up.
// =============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSession, subscribe, type AuthSession } from '@/lib/api/tokenStore';
import { requestOtp as apiRequestOtp, verifyOtp as apiVerifyOtp, logout as apiLogout } from '@/lib/api/auth';

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isReady: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Shared sign-in modal, open from anywhere (nav, checkout gate, ...). */
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setSessionState(getSession());
    setIsReady(true);
    return subscribe(setSessionState);
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    await apiRequestOtp(phone);
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    await apiVerifyOtp(phone, token);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        isReady,
        requestOtp,
        verifyOtp,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
