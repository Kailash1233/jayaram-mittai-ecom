// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — TYPESCRIPT TYPE DEFINITIONS
// Database Schema & Business Logic Types
// Reference: Section 20 & Sections 0-19 of "e commerce - master.md"
// =============================================================================

export type JayaramMittaiUserRole = 'customer' | 'admin';

export type JayaramMittaiOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type JayaramMittaiPaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded';

export type JayaramMittaiPaymentMethod =
  | 'debit_card'
  | 'credit_card'
  | 'upi'
  | 'net_banking'
  | 'sodexo';

// ─── Database Tables ─────────────────────────────────────────────────────────

export interface JayaramMittaiProfile {
  id: string; // matches auth.users.id
  full_name: string | null;
  phone: string | null;
  role: JayaramMittaiUserRole;
  created_at: string;
  updated_at: string;
}

export interface JayaramMittaiAddress {
  id: string;
  profile_id: string;
  label: string; // 'Home', 'Work', 'Other'
  line1: string;
  line2?: string | null;
  city: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface JayaramMittaiCategory {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JayaramMittaiProduct {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  unit: string; // e.g. "250g", "500g", "1 kg", "1 pc"
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: JayaramMittaiCategory;
  availability?: JayaramMittaiProductAvailability;
  out_of_stock?: JayaramMittaiProductOutOfStock;
}

export interface JayaramMittaiProductAvailability {
  id: string;
  product_id: string;
  is_available: boolean;
  available_start_time: string | null; // HH:mm:ss
  available_end_time: string | null;   // HH:mm:ss
  created_at: string;
  updated_at: string;
}

export interface JayaramMittaiProductOutOfStock {
  id: string;
  product_id: string;
  is_out_of_stock: boolean;
  out_of_stock_until: string | null;
  custom_message: string | null;
  set_by_admin_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface JayaramMittaiDeliveryZone {
  id: string;
  name: string; // e.g. 'Nanganallur', 'Chromepet'
  center_lat: number;
  center_lng: number;
  radius_km: number;
  is_enabled: boolean;
  delivery_charge_override?: number | null;
  created_at: string;
  updated_at: string;
}

export interface SharedDishImage {
  id: string;
  dish_name_normalized: string;
  image_url: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface JayaramMittaiDeliveryRule {
  id: string;
  max_distance_km: number;
  delivery_charge: number;
  estimated_hours: number;
  free_delivery_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JayaramMittaiOperationalHours {
  id: string;
  day_of_week: number | null; // 0=Sun, 1=Mon, ..., 6=Sat
  open_time: string;          // '09:00:00'
  close_time: string;         // '17:00:00'
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface JayaramMittaiOrder {
  id: string;
  order_number: string;
  customer_id: string;
  address_id: string | null;
  status: JayaramMittaiOrderStatus;
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_status: JayaramMittaiPaymentStatus;
  payment_method: JayaramMittaiPaymentMethod | null;
  idempotency_key: string;
  customer_notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: JayaramMittaiOrderItem[];
  customer?: JayaramMittaiProfile;
  address?: JayaramMittaiAddress;
  payment?: JayaramMittaiPayment;
}

export interface JayaramMittaiOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
  created_at: string;
  product?: JayaramMittaiProduct;
}

export interface JayaramMittaiPayment {
  id: string;
  order_id: string;
  provider: string;
  provider_reference: string | null;
  status: JayaramMittaiPaymentStatus;
  amount: number;
  payment_method: JayaramMittaiPaymentMethod | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface JayaramMittaiNotification {
  id: string;
  customer_id: string | null;
  type: string;
  title: string | null;
  message: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface JayaramMittaiAuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// ─── Frontend DTOs & State ───────────────────────────────────────────────────

export interface CartItem {
  product: JayaramMittaiProduct;
  quantity: number;
}

export interface CalculationResult {
  subtotal: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  isFreeDelivery: boolean;
  distanceKm: number;
  estimatedHours: number;
  total: number;
  operationalStatus: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    message?: string;
  };
}

export interface ProductAvailabilityStatus {
  isAvailable: boolean;
  isOutOfStock: boolean;
  outOfStockUntil: string | null;
  unavailableReason: string | null;
  customMessage: string | null;
}
