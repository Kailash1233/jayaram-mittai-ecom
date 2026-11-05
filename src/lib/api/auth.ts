// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — AUTH (PHONE OTP)
// Matches /api/auth/otp/request, /otp/verify, /otp/refresh, /auth/logout
// exactly as documented. New phone numbers are signed up automatically on
// their first verify — there is no separate sign-up call.
// =============================================================================

import { apiFetch, refreshSession as refreshSessionInternal } from './client';
import { setSession, getSession } from './tokenStore';
import type { ShopApiAuthSessionResponse } from './shopTypes';

/** Converts a 10-digit Indian mobile number to the +91XXXXXXXXXX format the backend requires. */
export function toE164(phoneDigitsOrRaw: string): string {
  const digits = phoneDigitsOrRaw.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  return `+91${last10}`;
}

export async function requestOtp(phone: string): Promise<void> {
  await apiFetch<{ message: string }>('/api/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phone: toE164(phone) }),
    auth: false,
  });
}

export async function verifyOtp(phone: string, token: string): Promise<ShopApiAuthSessionResponse> {
  const data = await apiFetch<ShopApiAuthSessionResponse>('/api/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone: toE164(phone), token }),
    auth: false,
  });

  setSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    user: data.user,
  });

  return data;
}

export async function logout(): Promise<void> {
  const session = getSession();
  if (session) {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Even if the server call fails (expired/offline), clear the local session below.
    }
  }
  setSession(null);
}

export const refreshSession = refreshSessionInternal;
