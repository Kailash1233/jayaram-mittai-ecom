// =============================================================================
// JAYARAM MITTAI ADMIN DASHBOARD — SESSION STORAGE
// Separate from the customer session (tokenStore.ts): different storage key,
// different backend auth system (/admin/auth/* email+password, not phone OTP).
// =============================================================================

import { useEffect, useState } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export interface AdminSession {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

const STORAGE_KEY = 'jm_admin_session_v1';

type Listener = (session: AdminSession | null) => void;
const listeners = new Set<Listener>();

function readRaw(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

let cached: AdminSession | null = readRaw();

export function getAdminSession(): AdminSession | null {
  return cached;
}

export function setAdminSession(session: AdminSession | null) {
  cached = session;
  if (typeof window !== 'undefined') {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // storage unavailable — session still works for this tab via `cached`
    }
  }
  listeners.forEach((listener) => listener(cached));
}

export function subscribeAdmin(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAdminSession(): AdminSession | null {
  const [session, setSessionState] = useState(cached);
  useEffect(() => subscribeAdmin(setSessionState), []);
  return session;
}
