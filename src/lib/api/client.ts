// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — API CLIENT
// Thin fetch wrapper for the Shop API (/api/*), proxied through
// /api/proxy/* (see src/app/api/proxy/[...path]/route.ts). Attaches the
// bearer token, refreshes once on 401, and throws a typed ApiError that
// matches the backend's documented error shape.
// =============================================================================

import { getSession, setSession, isAccessTokenStale, type AuthSession } from './tokenStore';
import type { ShopApiAuthSessionResponse } from './shopTypes';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorName: string;

  constructor(message: string, statusCode: number, errorName: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorName = errorName;
  }
}

function joinMessage(message: unknown): string {
  if (Array.isArray(message)) return message.join(' ');
  if (typeof message === 'string') return message;
  return 'Something went wrong. Please try again.';
}

/** Low-level proxy call, shared with the admin client (adminClient.ts) which attaches its own token. */
export async function rawRequest<T>(path: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const res = await fetch(`/api/proxy${path}`, { ...options, headers });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // no/invalid JSON body (e.g. a 502 from the proxy, or a 204)
  }

  if (!res.ok) {
    throw new ApiError(joinMessage(body?.message), body?.statusCode ?? res.status, body?.error ?? 'Error');
  }

  return body as T;
}

/** Swaps the stored refresh token for a new session. Returns false if the refresh itself failed. */
export async function refreshSession(): Promise<boolean> {
  const session = getSession();
  if (!session) return false;

  try {
    const data = await rawRequest<ShopApiAuthSessionResponse>('/api/auth/otp/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });
    setSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      user: data.user,
    });
    return true;
  } catch {
    setSession(null);
    return false;
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Set false for endpoints marked "No login" in the docs — skips attaching/requiring a token. */
  auth?: boolean;
}

/**
 * Calls the Shop API. Attaches the bearer token for endpoints marked "Login
 * required"; refreshes once and retries on a 401 before giving up.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, ...init } = options;

  let session = getSession();
  if (auth && session && isAccessTokenStale(session)) {
    await refreshSession();
    session = getSession();
  }

  try {
    return await rawRequest<T>(path, init, auth ? session?.accessToken : undefined);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 401 && auth && session) {
      const refreshed = await refreshSession();
      if (refreshed) {
        const newSession = getSession();
        return await rawRequest<T>(path, init, newSession?.accessToken);
      }
    }
    throw err;
  }
}
