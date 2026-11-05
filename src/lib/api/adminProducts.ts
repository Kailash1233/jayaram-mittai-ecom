// =============================================================================
// JAYARAM MITTAI ADMIN DASHBOARD — PRODUCTS & STOCK
// Mirrors the backend's /admin/products routes exactly (see
// jayaram_mittai_backend/src/admin/products/*).
// =============================================================================

import { adminFetch } from './adminClient';

export type StockState =
  | 'in_stock'
  | 'temporary_hold'
  | 'needs_review'
  | 'scheduled_hold'
  | 'permanent_out_of_stock';

export interface AdminProduct {
  productId: string;
  categorySlug: string;
  categoryName: string | null;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
  stock: number | null;
  images: string[];
  stockState: StockState;
  outOfStockUntil: string | null;
  customMessage: string | null;
  reviewFlaggedAt: string | null;
}

export interface CreateAdminProductInput {
  categorySlug: string;
  categoryName?: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  stock?: number;
  images?: string[];
}

export interface UpdateAdminProductInput {
  name?: string;
  description?: string;
  price?: number;
  unit?: string;
  stock?: number;
  images?: string[];
}

export type StockAction = 'mark_temporary' | 'mark_scheduled' | 'mark_permanent' | 'restock';

export interface UpdateStockInput {
  action: StockAction;
  outOfStockUntil?: string;
  customMessage?: string;
  stock?: number;
}

export async function listAdminProducts(): Promise<AdminProduct[]> {
  return adminFetch<AdminProduct[]>('/admin/products');
}

export async function getAdminProduct(productId: string): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/admin/products/${encodeURIComponent(productId)}`);
}

export async function createAdminProduct(input: CreateAdminProductInput): Promise<AdminProduct> {
  return adminFetch<AdminProduct>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateAdminProduct(
  productId: string,
  input: UpdateAdminProductInput,
): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/admin/products/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function updateAdminProductStock(
  productId: string,
  input: UpdateStockInput,
): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/admin/products/${encodeURIComponent(productId)}/stock`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export const STOCK_STATE_LABELS: Record<StockState, string> = {
  in_stock: 'In stock',
  temporary_hold: 'Temporary hold',
  needs_review: 'Needs review',
  scheduled_hold: 'Scheduled hold',
  permanent_out_of_stock: 'Discontinued',
};
