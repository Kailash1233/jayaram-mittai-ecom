// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — SAVED ADDRESSES
// Wraps GET/POST /api/addresses and PATCH/DELETE /api/addresses/{id}.
// Login required for all of these.
// =============================================================================

import { apiFetch } from './client';
import type { ShopApiAddress } from './shopTypes';

export interface AddressInput {
  label?: string;
  address_line: string;
  landmark?: string;
  city: string;
  pincode: string;
  contact_number: string; // 10 digits, no +91
}

export async function listAddresses(): Promise<ShopApiAddress[]> {
  return apiFetch<ShopApiAddress[]>('/api/addresses');
}

export async function createAddress(input: AddressInput): Promise<ShopApiAddress> {
  return apiFetch<ShopApiAddress>('/api/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateAddress(id: string, input: Partial<AddressInput>): Promise<ShopApiAddress> {
  return apiFetch<ShopApiAddress>(`/api/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteAddress(id: string): Promise<void> {
  await apiFetch<{ deleted: boolean }>(`/api/addresses/${id}`, { method: 'DELETE' });
}
