'use client';

// Mounts the shared sign-in modal once, driven by AuthContext's modal state
// so any page/component can open it via useAuth().openAuthModal().

import { useAuth } from '@/context/AuthContext';
import { CustomerAuthModal } from './CustomerAuthModal';

export function AuthModalMount() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  return <CustomerAuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />;
}
