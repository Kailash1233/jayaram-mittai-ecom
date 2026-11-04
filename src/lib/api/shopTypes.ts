// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — SHOP API RESPONSE SHAPES
// Types mirror the "Jayaram Mittai Shop API" reference doc exactly (field
// names and casing as documented, even where the real API mixes snake_case
// and camelCase across objects).
// =============================================================================

export interface ShopApiProduct {
  product_id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
}

export interface ShopApiCategoryGroup {
  id: number;
  category_name: string;
  category_slug: string;
  products: ShopApiProduct[];
}

export interface ShopApiDeliveryZone {
  id: number;
  location_name: string;
  pincodes: string[];
  delivery_charge: number;
  estimated_hours: number;
  free_delivery: number;
}

export interface ShopApiAddress {
  id: string;
  label: string;
  address_line: string;
  landmark: string | null;
  city: string;
  pincode: string;
  contact_number: string;
  customer_id: string;
  created_at: string;
}

export interface ShopApiOrderItem {
  name: string;
  price: number;
  unit?: string;
  quantity: number;
  line_total: number;
}

export interface ShopApiOrder {
  id: string;
  order_number: string;
  status: 'pending_payment' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'failed' | 'paid';
  payment_method: string | null;
  subtotal: number;
  delivery_charge: number;
  total: number;
  estimated_hours: number;
  items: ShopApiOrderItem[];
  customer: { fullName: string; phone: string };
  delivery_address: { line1: string; city: string; pincode: string; zoneName: string };
  customer_notes?: string | null;
  customer_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  paid_at?: string | null;
  created_at: string;
}

export interface ShopApiPaymentBlock {
  provider: 'razorpay';
  keyId: string;
  razorpayOrderId: string;
  amount: number; // paise
  currency: string;
}

export interface ShopApiOrderCreateResponse {
  success: true;
  isDuplicate: boolean;
  order: ShopApiOrder;
  payment: ShopApiPaymentBlock | null;
}

export interface ShopApiAuthSessionResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: 'bearer';
  user: { id: string; phone: string };
}

export interface RazorpayCheckoutSuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
