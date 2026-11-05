// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — ORDERS & PAYMENT
// Wraps POST /api/orders/create, GET /api/orders, GET /api/orders/search,
// and POST /api/payments/razorpay/verify. Login required for all of these.
// =============================================================================

import { apiFetch } from './client';
import type { ShopApiOrder, ShopApiOrderCreateResponse, RazorpayCheckoutSuccessResponse } from './shopTypes';

export interface CreateOrderInput {
  customer: { fullName: string; phone: string; email?: string };
  address: { line1: string; line2?: string; city: string; pincode: string };
  items: Array<{ productId: string; quantity: number }>;
  idempotencyKey: string;
  customerNotes?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<ShopApiOrderCreateResponse> {
  return apiFetch<ShopApiOrderCreateResponse>('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function verifyRazorpayPayment(
  payload: RazorpayCheckoutSuccessResponse
): Promise<ShopApiOrder> {
  return apiFetch<ShopApiOrder>('/api/payments/razorpay/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOrders(): Promise<ShopApiOrder[]> {
  return apiFetch<ShopApiOrder[]>('/api/orders');
}

export async function searchOrderByNumber(orderNumber: string): Promise<ShopApiOrder> {
  return apiFetch<ShopApiOrder>(`/api/orders/search?orderNumber=${encodeURIComponent(orderNumber)}`);
}
