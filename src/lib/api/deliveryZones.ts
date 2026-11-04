// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — DELIVERY ZONES
// Wraps GET /api/deliveryzones. Zones are pincode-list based (not radius/lat-
// lng), so matching happens by exact pincode membership, not distance.
// =============================================================================

import { apiFetch } from './client';
import type { ShopApiDeliveryZone } from './shopTypes';

let cachedZones: ShopApiDeliveryZone[] | null = null;
let inflightZones: Promise<ShopApiDeliveryZone[]> | null = null;

export async function getDeliveryZones(): Promise<ShopApiDeliveryZone[]> {
  if (cachedZones) return cachedZones;
  if (!inflightZones) {
    inflightZones = apiFetch<ShopApiDeliveryZone[]>('/api/deliveryzones', { auth: false }).then((zones) => {
      cachedZones = zones;
      return zones;
    });
  }
  return inflightZones;
}

/** Returns the zone serving this pincode, or null if nobody delivers there yet. */
export function matchZoneByPincode(
  zones: ShopApiDeliveryZone[],
  pincode: string
): ShopApiDeliveryZone | null {
  return zones.find((zone) => zone.pincodes.includes(pincode)) ?? null;
}
