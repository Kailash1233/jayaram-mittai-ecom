// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — BUSINESS CALCULATIONS ENGINE
// Client-side PREVIEW only — the backend is the sole authority on final
// price and delivery charge (POST /api/orders/create re-prices everything).
// Pricing here mirrors the real delivery-zone model: each zone carries its
// own delivery_charge / free_delivery / estimated_hours — there is no
// distance-km tier system and no separate delivery-rules table.
// =============================================================================

import { CartItem, ProductAvailabilityStatus, JayaramMittaiProduct } from './types';
import type { ShopApiDeliveryZone } from '../api/shopTypes';

export interface CalculationResult {
  subtotal: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  isFreeDelivery: boolean;
  estimatedHours: number | null;
  total: number;
  zoneMatched: boolean;
}

/**
 * Calculates line totals and a preview delivery charge for the given zone.
 * Pass `zone: null` when the customer hasn't entered/matched a pincode yet.
 */
export function calculateCartTotals(
  items: CartItem[],
  zone: ShopApiDeliveryZone | null
): CalculationResult {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * Math.max(1, item.quantity), 0);

  const zoneMatched = !!zone;
  const freeDeliveryThreshold = zone?.free_delivery ?? 0;
  // Delivery is free when the subtotal is strictly ABOVE the threshold; equal still charges.
  const isFreeDelivery = zoneMatched && subtotal > freeDeliveryThreshold;
  const deliveryCharge = !zoneMatched ? 0 : isFreeDelivery ? 0 : zone!.delivery_charge;
  const estimatedHours = zone?.estimated_hours ?? null;
  const total = subtotal + deliveryCharge;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryCharge,
    freeDeliveryThreshold,
    isFreeDelivery,
    estimatedHours,
    total: Math.round(total * 100) / 100,
    zoneMatched,
  };
}

/**
 * Validates product availability (active, time window, and manual out-of-stock state).
 * The Shop API's catalog response currently carries no stock fields, so
 * `availability`/`out_of_stock` are undefined for live products and this
 * resolves to "available" — this only does real work once the backend adds
 * stock data to GET /api/catalog/products.
 */
export function evaluateProductAvailability(
  product: JayaramMittaiProduct
): ProductAvailabilityStatus {
  if (!product.is_active) {
    return {
      isAvailable: false,
      isOutOfStock: true,
      outOfStockUntil: null,
      unavailableReason: 'Product is currently unlisted.',
      customMessage: 'Item currently unavailable',
    };
  }

  if (product.out_of_stock && product.out_of_stock.is_out_of_stock) {
    const until = product.out_of_stock.out_of_stock_until
      ? new Date(product.out_of_stock.out_of_stock_until)
      : null;
    const now = new Date();

    if (!(until && now > until)) {
      return {
        isAvailable: false,
        isOutOfStock: true,
        outOfStockUntil: product.out_of_stock.out_of_stock_until,
        unavailableReason: product.out_of_stock.custom_message || 'Fresh batch in preparation.',
        customMessage: product.out_of_stock.custom_message || 'Temporarily Out of Stock',
      };
    }
  }

  if (product.availability) {
    if (!product.availability.is_available) {
      return {
        isAvailable: false,
        isOutOfStock: false,
        outOfStockUntil: null,
        unavailableReason: 'Unavailable at this time.',
        customMessage: 'Unavailable Today',
      };
    }

    const { available_start_time, available_end_time } = product.availability;
    if (available_start_time && available_end_time) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      if (currentTime < available_start_time || currentTime > available_end_time) {
        return {
          isAvailable: false,
          isOutOfStock: false,
          outOfStockUntil: null,
          unavailableReason: `Available daily between ${available_start_time.slice(0, 5)} and ${available_end_time.slice(0, 5)}.`,
          customMessage: `Available from ${available_start_time.slice(0, 5)}`,
        };
      }
    }
  }

  return {
    isAvailable: true,
    isOutOfStock: false,
    outOfStockUntil: null,
    unavailableReason: null,
    customMessage: null,
  };
}
