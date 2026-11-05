// =============================================================================
// JAYARAM MITTAI ADMIN DASHBOARD — "NEW ORDER, UNACCEPTED" SET
// Plain store (not React state) so the alarm tone, the bell badge, and the
// orders queue page can all react to the same live set without prop-drilling.
// Written to by AdminLayout (seeded from GET /admin/orders?status=confirmed
// on load, then kept live by the order:new / order:acknowledged socket events).
// =============================================================================

import { useEffect, useState } from 'react';

type Listener = (ids: string[]) => void;

let ids: string[] = [];
const listeners = new Set<Listener>();

export function getRingingIds(): string[] {
  return ids;
}

export function setRingingIds(next: string[]) {
  ids = next;
  listeners.forEach((l) => l(ids));
}

export function addRinging(id: string) {
  if (!ids.includes(id)) setRingingIds([...ids, id]);
}

export function removeRinging(id: string) {
  if (ids.includes(id)) setRingingIds(ids.filter((x) => x !== id));
}

export function subscribeRinging(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRingingIds(): string[] {
  const [value, setValue] = useState(ids);
  useEffect(() => subscribeRinging(setValue), []);
  return value;
}
