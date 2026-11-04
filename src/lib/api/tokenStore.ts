// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — AUTH SESSION STORAGE
// Plain localStorage-backed store (not React state) so the fetch client can
// read/attach the access token without needing to live inside a component.
// AuthContext subscribes to this for the reactive, component-facing view.
// =============================================================================

export interface AuthUser {
  id: string;
  phone: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
  user: AuthUser;
}

const STORAGE_KEY = 'jm_shop_session_v1';

type Listener = (session: AuthSession | null) => void;
const listeners = new Set<Listener>();

function readRaw(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

let cached: AuthSession | null = readRaw();

export function getSession(): AuthSession | null {
  return cached;
}

export function setSession(session: AuthSession | null) {
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

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True once the access token is within 30s of expiring (or already expired). */
export function isAccessTokenStale(session: AuthSession): boolean {
  return Math.floor(Date.now() / 1000) >= session.expiresAt - 30;
}
