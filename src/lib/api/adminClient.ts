// =============================================================================
// JAYARAM MITTAI ADMIN DASHBOARD — API CLIENT
// Same /api/proxy passthrough as the customer client, but authenticated with
// the admin email+password session (adminTokenStore.ts) instead of the
// customer phone-OTP session.
// =============================================================================

import { rawRequest, ApiError } from './client';
import { getAdminSession, setAdminSession, type AdminSession } from './adminTokenStore';

interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminSession['user'];
}

interface AdminTokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function adminLogin(email: string, password: string): Promise<AdminSession> {
  const data = await rawRequest<AdminLoginResponse>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const session: AdminSession = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  };
  setAdminSession(session);
  return session;
}

export async function adminLogout(): Promise<void> {
  const session = getAdminSession();
  if (session) {
    try {
      await rawRequest('/admin/auth/logout', { method: 'POST' }, session.accessToken);
    } catch {
      // clear locally even if the server call fails (expired/offline)
    }
  }
  setAdminSession(null);
}

/** Swaps the stored refresh token for a new access token. Returns false if the refresh itself failed. */
async function refreshAdminSession(): Promise<boolean> {
  const session = getAdminSession();
  if (!session) return false;

  try {
    const data = await rawRequest<AdminTokenPair>(
      '/admin/auth/refresh',
      { method: 'POST' },
      session.refreshToken,
    );
    setAdminSession({ ...session, accessToken: data.accessToken, refreshToken: data.refreshToken });
    return true;
  } catch {
    setAdminSession(null);
    return false;
  }
}

interface AdminFetchOptions extends RequestInit {
  /** Set false for /admin/auth/login itself. */
  auth?: boolean;
}

/** Calls the admin API; refreshes once and retries on a 401 before giving up. */
export async function adminFetch<T>(path: string, options: AdminFetchOptions = {}): Promise<T> {
  const { auth = true, ...init } = options;
  const session = getAdminSession();

  try {
    return await rawRequest<T>(path, init, auth ? session?.accessToken : undefined);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 401 && auth && session) {
      const refreshed = await refreshAdminSession();
      if (refreshed) {
        const newSession = getAdminSession();
        return await rawRequest<T>(path, init, newSession?.accessToken);
      }
    }
    throw err;
  }
}

export { ApiError };
