// =============================================================================
// JAYARAM MITTAI ADMIN DASHBOARD — LIVE ORDER ALERTS
// Connects directly to the backend's Socket.IO server (NOT through
// /api/proxy — that's an HTTP-only passthrough and can't carry a websocket
// upgrade). This is the one place the admin dashboard needs the backend's
// own address in the browser; it's safe here because the connection itself
// requires a valid admin JWT (checked server-side in AdminRealtimeGateway)
// and nothing customer-facing ever loads this module.
// =============================================================================

import { io, type Socket } from 'socket.io-client';
import { getAdminSession } from './adminTokenStore';

const WS_BASE = process.env.NEXT_PUBLIC_ADMIN_WS_URL;

let socket: Socket | null = null;

/** True once NEXT_PUBLIC_ADMIN_WS_URL is set — otherwise live alerts are simply off. */
export function isRealtimeConfigured(): boolean {
  return Boolean(WS_BASE);
}

/** Opens (or reuses) the admin realtime connection. Returns null if not configured or not signed in. */
export function connectAdminRealtime(): Socket | null {
  const session = getAdminSession();
  if (!WS_BASE || !session) return null;

  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
  }

  socket = io(`${WS_BASE}/admin/realtime`, {
    auth: { token: session.accessToken },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });
  return socket;
}

export function disconnectAdminRealtime() {
  socket?.disconnect();
  socket = null;
}
