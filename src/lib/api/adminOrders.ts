// =============================================================================
// JAYARAM MITTAI ADMIN DASHBOARD — ORDER QUEUE
// Mirrors the backend's /admin/orders routes exactly (see
// jayaram_mittai_backend/src/admin/orders/*).
// =============================================================================

import { adminFetch } from './adminClient';

export type AdminOrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface AdminOrderItem {
  name: string;
  price: number;
  unit?: string;
  quantity: number;
  line_total: number;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  status: AdminOrderStatus;
  payment_status: 'pending' | 'failed' | 'paid';
  payment_method: string | null;
  subtotal: number;
  delivery_charge: number;
  total: number;
  estimated_hours: number;
  items: AdminOrderItem[];
  customer: { fullName: string; phone: string };
  delivery_address: { line1: string; city: string; pincode: string; zoneName: string };
  customer_notes?: string | null;
  customer_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  paid_at?: string | null;
  created_at: string;
}

/** Statuses staff can move an order to from the queue. */
export const SETTABLE_STATUSES: AdminOrderStatus[] = [
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export async function listAdminOrders(status?: AdminOrderStatus): Promise<AdminOrder[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return adminFetch<AdminOrder[]>(`/admin/orders${qs}`);
}

export async function getAdminOrder(id: string): Promise<AdminOrder> {
  return adminFetch<AdminOrder>(`/admin/orders/${encodeURIComponent(id)}`);
}

export async function updateAdminOrderStatus(
  id: string,
  status: AdminOrderStatus,
): Promise<AdminOrder> {
  return adminFetch<AdminOrder>(`/admin/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
