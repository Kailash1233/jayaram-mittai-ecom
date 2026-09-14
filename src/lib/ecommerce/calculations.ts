// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — BUSINESS CALCULATIONS ENGINE
// Reference: Sections 2, 4, 6 of "e commerce - master.md"
//
// Rules:
// 1. Backend is the sole authority for final charges & prices.
// 2. Distance < 5 km → ₹50
// 3. Distance ≥ 5 km → ₹100
// 4. Subtotal > ₹1,000 → Free delivery (overrides distance charge)
// 5. Delivery Time by Distance:
//      < 5 km  → 2 hours
//      < 8 km  → 3 hours
//      < 11 km → 4 hours
// =============================================================================

import {
  CartItem,
  CalculationResult,
  ProductAvailabilityStatus,
  JayaramMittaiProduct,
  JayaramMittaiDeliveryRule,
  JayaramMittaiOperationalHours,
} from './types';
import { SEED_DELIVERY_RULES, SEED_OPERATIONAL_HOURS } from './catalog-seed';

/**
 * Calculates line totals and server-verified cart pricing and delivery charges.
 */
export function calculateCartTotals(
  items: CartItem[],
  distanceKm = 3.5,
  deliveryRules: JayaramMittaiDeliveryRule[] = SEED_DELIVERY_RULES,
  operationalHours: JayaramMittaiOperationalHours[] = SEED_OPERATIONAL_HOURS
): CalculationResult {
  // 1. Calculate subtotal strictly from item prices
  const subtotal = items.reduce((sum, item) => {
    return sum + item.product.price * Math.max(1, item.quantity);
  }, 0);

  // 2. Default free delivery threshold
  const freeDeliveryThreshold = deliveryRules[0]?.free_delivery_threshold ?? 1000;
  const isFreeDelivery = subtotal > freeDeliveryThreshold;

  // 3. Match distance-based rule
  // Sort rules ascending by max_distance_km
  const sortedRules = [...deliveryRules].sort(
    (a, b) => a.max_distance_km - b.max_distance_km
  );

  let matchedRule = sortedRules.find((rule) => distanceKm <= rule.max_distance_km);
  if (!matchedRule && sortedRules.length > 0) {
    // If beyond max configured distance rule, use the furthest rule or default
    matchedRule = sortedRules[sortedRules.length - 1];
  }

  const baseDeliveryCharge = matchedRule ? matchedRule.delivery_charge : distanceKm < 5 ? 50 : 100;
  const estimatedHours = matchedRule ? matchedRule.estimated_hours : distanceKm < 5 ? 2 : distanceKm < 8 ? 3 : 4;

  const finalDeliveryCharge = isFreeDelivery ? 0 : baseDeliveryCharge;
  const total = subtotal + finalDeliveryCharge;

  // 4. Check operational hours
  const operationalStatus = checkOperationalHours(operationalHours);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryCharge: finalDeliveryCharge,
    freeDeliveryThreshold,
    isFreeDelivery,
    distanceKm,
    estimatedHours,
    total: Math.round(total * 100) / 100,
    operationalStatus,
  };
}

/**
 * Checks if store is currently operating based on Section 2 (9 AM - 5 PM default).
 */
export function checkOperationalHours(
  operationalHours: JayaramMittaiOperationalHours[] = SEED_OPERATIONAL_HOURS
): {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  message?: string;
} {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday...
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  // Find day-specific rule, or default fallback (day_of_week === null)
  const rule =
    operationalHours.find((h) => h.day_of_week === currentDay) ||
    operationalHours.find((h) => h.day_of_week === null) || {
      open_time: '09:00:00',
      close_time: '17:00:00',
      is_closed: false,
    };

  if (rule.is_closed) {
    return {
      isOpen: false,
      openTime: rule.open_time,
      closeTime: rule.close_time,
      message: 'Store is closed today for online orders.',
    };
  }

  const isOpen = currentTime >= rule.open_time && currentTime <= rule.close_time;

  return {
    isOpen,
    openTime: rule.open_time,
    closeTime: rule.close_time,
    message: isOpen
      ? 'Standard Delivery Active'
      : `Orders placed outside operating hours (${rule.open_time.slice(0, 5)} - ${rule.close_time.slice(0, 5)}) will be dispatched next morning.`,
  };
}

/**
 * Validates product availability (active, time window, and manual out-of-stock state).
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

  // Check out of stock record
  if (product.out_of_stock && product.out_of_stock.is_out_of_stock) {
    const until = product.out_of_stock.out_of_stock_until
      ? new Date(product.out_of_stock.out_of_stock_until)
      : null;
    const now = new Date();

    // If out_of_stock_until has expired, auto-reopen
    if (until && now > until) {
      // Auto-reopened
    } else {
      return {
        isAvailable: false,
        isOutOfStock: true,
        outOfStockUntil: product.out_of_stock.out_of_stock_until,
        unavailableReason:
          product.out_of_stock.custom_message || 'Fresh batch in preparation.',
        customMessage:
          product.out_of_stock.custom_message || 'Temporarily Out of Stock',
      };
    }
  }

  // Check daily availability time window
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
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      if (currentTime < available_start_time || currentTime > available_end_time) {
        return {
          isAvailable: false,
          isOutOfStock: false,
          outOfStockUntil: null,
          unavailableReason: `Available daily between ${available_start_time.slice(
            0,
            5
          )} and ${available_end_time.slice(0, 5)}.`,
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
