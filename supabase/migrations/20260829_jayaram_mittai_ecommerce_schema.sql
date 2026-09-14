-- =============================================================================
-- JAYARAM MITTAI ECOMMERCE PLATFORM — DATABASE DDL MIGRATION
-- Migration File: supabase/migrations/20260829_jayaram_mittai_ecommerce_schema.sql
-- Reference: Section 20 (Database Schema) & Sections 0-19 of "e commerce - master.md"
-- Target Database: Supabase (PostgreSQL)
--
-- All entities in this migration are prefixed with "jayaram_mittai_" to guarantee
-- 100% namespace isolation from existing Mandapam booking & operations schemas.
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS & PREREQUISITES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CUSTOM TYPES & ENUMS (Prefix: jayaram_mittai_)
-- Implements: Section 11 (RBAC), Section 14 (Order Status), Section 7 (Payments)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jayaram_mittai_user_role') THEN
    CREATE TYPE public.jayaram_mittai_user_role AS ENUM (
      'customer',
      'admin'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jayaram_mittai_order_status') THEN
    CREATE TYPE public.jayaram_mittai_order_status AS ENUM (
      'pending',
      'confirmed',
      'preparing',
      'out_for_delivery',
      'delivered',
      'cancelled'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jayaram_mittai_payment_status') THEN
    CREATE TYPE public.jayaram_mittai_payment_status AS ENUM (
      'pending',
      'authorized',
      'captured',
      'failed',
      'refunded'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jayaram_mittai_payment_method') THEN
    CREATE TYPE public.jayaram_mittai_payment_method AS ENUM (
      'debit_card',
      'credit_card',
      'upi',
      'net_banking',
      'sodexo'
    );
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABLES DEFINITION (Prefix: jayaram_mittai_)
-- ─────────────────────────────────────────────────────────────────────────────

-- 2.1 PROFILES (1:1 Extension of auth.users)
-- Implements: Section 8 (Customer Data & Privacy), Section 11 (RBAC), Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role public.jayaram_mittai_user_role NOT NULL DEFAULT 'customer'::public.jayaram_mittai_user_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_profiles IS 'Section 20: Extends auth.users 1:1 with ecommerce customer/admin roles and metadata.';
COMMENT ON COLUMN public.jayaram_mittai_profiles.role IS 'User role (customer | admin). Must never be client-writable at signup or update.';


-- 2.2 ADDRESSES
-- Implements: Section 8 (Customer Data), Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.jayaram_mittai_profiles(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL DEFAULT 'Chennai',
  pincode text NOT NULL,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_addresses IS 'Section 20: Saved customer delivery addresses.';


-- 2.3 CATEGORIES
-- Implements: Section 1, Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_categories IS 'Section 20: Product categories for browsing & filtering.';


-- 2.4 PRODUCTS
-- Implements: Section 0 (Design Reference/Images), Section 6 (Availability), Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.jayaram_mittai_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  unit text NOT NULL DEFAULT '250g',
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_products IS 'Section 20: Product catalogue with prices, units, and images.';
COMMENT ON COLUMN public.jayaram_mittai_products.image_url IS 'Section 0: Distinct image URL per item; safe fallback handled if null.';


-- 2.5 PRODUCT AVAILABILITY
-- Implements: Section 6 (Product Availability Model), Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_product_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL UNIQUE REFERENCES public.jayaram_mittai_products(id) ON DELETE CASCADE,
  is_available boolean NOT NULL DEFAULT true,
  available_start_time time without time zone,
  available_end_time time without time zone,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_product_availability IS 'Section 6/20: Daily operating time windows and availability toggle.';


-- 2.6 PRODUCT OUT OF STOCK
-- Implements: Section 5 (Inventory Limitation), Section 6 (Availability Model), Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_product_out_of_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.jayaram_mittai_products(id) ON DELETE CASCADE,
  is_out_of_stock boolean NOT NULL DEFAULT true,
  out_of_stock_until timestamptz,
  custom_message text,
  set_by_admin_id uuid REFERENCES public.jayaram_mittai_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_product_out_of_stock IS 'Section 5/6/20: Staff manual out-of-stock marking with duration & auto-reopen.';


-- 2.7 DELIVERY ZONES
-- Implements: Section 3 (Delivery Areas), Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  center_lat numeric(10, 7) NOT NULL,
  center_lng numeric(10, 7) NOT NULL,
  radius_km numeric(6, 2) NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  delivery_charge_override numeric(10, 2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_delivery_zones IS 'Section 3/20: Configurable delivery zones (e.g. Nanganallur, Chromepet).';


-- 2.8 DELIVERY RULES
-- Implements: Section 2 (Delivery Business Req), Section 4 (Delivery Charges), Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_delivery_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  max_distance_km numeric(6, 2) NOT NULL,
  delivery_charge numeric(10, 2) NOT NULL CHECK (delivery_charge >= 0),
  estimated_hours numeric(4, 2) NOT NULL,
  free_delivery_threshold numeric(10, 2) NOT NULL DEFAULT 1000.00 CHECK (free_delivery_threshold >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_delivery_rules IS 'Section 2/4/20: Distance-based delivery charge rules and free delivery threshold.';


-- 2.9 OPERATIONAL HOURS
-- Implements: Section 2 (Standard Delivery Operational Hours), Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_operational_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week smallint CHECK (day_of_week BETWEEN 0 AND 6),
  open_time time without time zone NOT NULL DEFAULT '09:00:00',
  close_time time without time zone NOT NULL DEFAULT '17:00:00',
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_operational_hours IS 'Section 2/20: Daily opening & closing hours for delivery operations.';


-- 2.10 ORDERS
-- Implements: Section 4 (Delivery Charges), Section 14 (Order Security), Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE,
  customer_id uuid NOT NULL REFERENCES public.jayaram_mittai_profiles(id) ON DELETE RESTRICT,
  address_id uuid REFERENCES public.jayaram_mittai_addresses(id) ON DELETE SET NULL,
  status public.jayaram_mittai_order_status NOT NULL DEFAULT 'pending'::public.jayaram_mittai_order_status,
  subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_charge numeric(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_charge >= 0),
  total numeric(10, 2) NOT NULL CHECK (total >= 0),
  payment_status public.jayaram_mittai_payment_status NOT NULL DEFAULT 'pending'::public.jayaram_mittai_payment_status,
  payment_method public.jayaram_mittai_payment_method,
  idempotency_key text NOT NULL UNIQUE,
  customer_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_orders IS 'Section 14/20: Customer orders created inside server-side transaction with idempotency.';
COMMENT ON COLUMN public.jayaram_mittai_orders.idempotency_key IS 'Section 14/20: Unique idempotency key preventing duplicate submissions.';


-- 2.11 ORDER ITEMS
-- Implements: Section 14 (Order Security), Section 20 (Database Schema Snapshots)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.jayaram_mittai_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.jayaram_mittai_products(id) ON DELETE SET NULL,
  product_name_snapshot text NOT NULL,
  unit_price_snapshot numeric(10, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total numeric(10, 2) NOT NULL CHECK (line_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_order_items IS 'Section 20: Order line items with price/name snapshots preserving historical data.';


-- 2.12 PAYMENTS
-- Implements: Section 7 (Payment Methods & PCI Compliance), Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.jayaram_mittai_orders(id) ON DELETE RESTRICT,
  provider text NOT NULL,
  provider_reference text,
  status public.jayaram_mittai_payment_status NOT NULL DEFAULT 'pending'::public.jayaram_mittai_payment_status,
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  payment_method public.jayaram_mittai_payment_method,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_payments IS 'Section 7/20: Payment records. RAW CREDENTIALS/CARD NUMBERS/CVV MUST NEVER BE STORED.';


-- 2.13 NOTIFICATIONS
-- Implements: Section 1, Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.jayaram_mittai_profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'order_status',
  title text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_notifications IS 'Section 20: Customer notifications for order updates & out-of-stock communication.';


-- 2.14 AUDIT LOGS
-- Implements: Section 19 (Management Audit), Section 20 (Database Schema)
CREATE TABLE IF NOT EXISTS public.jayaram_mittai_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jayaram_mittai_audit_logs IS 'Section 20: System & admin action logs (order status changes, price edits, etc.).';


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. HELPER FUNCTIONS & TRIGGERS LOGIC (Prefix: jayaram_mittai_)
-- Implements: Section 8 (Auth Extension), Section 11, 12, 20 (RBAC & RLS Helpers)
-- ─────────────────────────────────────────────────────────────────────────────

-- 3.1 Generic timestamp updater
CREATE OR REPLACE FUNCTION public.jayaram_mittai_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.2 Check if current authenticated user is an ecommerce admin
CREATE OR REPLACE FUNCTION public.jayaram_mittai_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.jayaram_mittai_profiles
    WHERE id = auth.uid()
      AND role = 'admin'::public.jayaram_mittai_user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3.3 Helper to retrieve current user's ecommerce role
CREATE OR REPLACE FUNCTION public.jayaram_mittai_get_role()
RETURNS public.jayaram_mittai_user_role AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.jayaram_mittai_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3.4 Auto-create customer profile on Supabase Auth Signup
-- Implements: Section 8, Section 20 ("profiles as a 1:1 extension of auth.users")
CREATE OR REPLACE FUNCTION public.jayaram_mittai_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.jayaram_mittai_profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
    'customer'::public.jayaram_mittai_user_role -- Role is strictly customer by default
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.5 Protect role column from client-side privilege escalation
-- Implements: Section 11, Section 20 ("role column must never be writable by the client")
CREATE OR REPLACE FUNCTION public.jayaram_mittai_protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT (current_user = 'service_role' OR public.jayaram_mittai_is_admin()) THEN
      RAISE EXCEPTION 'Unauthorized: Only administrators or service role can modify user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. AUTOMATIC TRIGGERS (Prefix: trg_jayaram_mittai_)
-- Implements: Section 8 (Auth Extension), Section 11 (Role Protection), Timestamps
-- ─────────────────────────────────────────────────────────────────────────────

-- 4.1 Updated-At Triggers
DROP TRIGGER IF EXISTS trg_jayaram_mittai_profiles_updated_at ON public.jayaram_mittai_profiles;
CREATE TRIGGER trg_jayaram_mittai_profiles_updated_at
  BEFORE UPDATE ON public.jayaram_mittai_profiles
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jayaram_mittai_addresses_updated_at ON public.jayaram_mittai_addresses;
CREATE TRIGGER trg_jayaram_mittai_addresses_updated_at
  BEFORE UPDATE ON public.jayaram_mittai_addresses
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jayaram_mittai_categories_updated_at ON public.jayaram_mittai_categories;
CREATE TRIGGER trg_jayaram_mittai_categories_updated_at
  BEFORE UPDATE ON public.jayaram_mittai_categories
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jayaram_mittai_products_updated_at ON public.jayaram_mittai_products;
CREATE TRIGGER trg_jayaram_mittai_products_updated_at
  BEFORE UPDATE ON public.jayaram_mittai_products
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jayaram_mittai_product_availability_updated_at ON public.jayaram_mittai_product_availability;
CREATE TRIGGER trg_jayaram_mittai_product_availability_updated_at
  BEFORE UPDATE ON public.jayaram_mittai_product_availability
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jayaram_mittai_product_out_of_stock_updated_at ON public.jayaram_mittai_product_out_of_stock;
CREATE TRIGGER trg_jayaram_mittai_product_out_of_stock_updated_at
  BEFORE UPDATE ON public.jayaram_mittai_product_out_of_stock
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jayaram_mittai_delivery_zones_updated_at ON public.jayaram_mittai_delivery_zones;
CREATE TRIGGER trg_jayaram_mittai_delivery_zones_updated_at
  BEFORE UPDATE ON public.jayaram_mittai_delivery_zones
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jayaram_mittai_delivery_rules_updated_at ON public.jayaram_mittai_delivery_rules;
CREATE TRIGGER trg_jayaram_mittai_delivery_rules_updated_at
  BEFORE UPDATE ON public.jayaram_mittai_delivery_rules
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jayaram_mittai_operational_hours_updated_at ON public.jayaram_mittai_operational_hours;
CREATE TRIGGER trg_jayaram_mittai_operational_hours_updated_at
  BEFORE UPDATE ON public.jayaram_mittai_operational_hours
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jayaram_mittai_orders_updated_at ON public.jayaram_mittai_orders;
CREATE TRIGGER trg_jayaram_mittai_orders_updated_at
  BEFORE UPDATE ON public.jayaram_mittai_orders
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jayaram_mittai_payments_updated_at ON public.jayaram_mittai_payments;
CREATE TRIGGER trg_jayaram_mittai_payments_updated_at
  BEFORE UPDATE ON public.jayaram_mittai_payments
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

-- 4.2 User Signup Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_jayaram_mittai ON auth.users;
CREATE TRIGGER on_auth_user_created_jayaram_mittai
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_handle_new_user();

-- 4.3 Profile Role Protection Trigger
DROP TRIGGER IF EXISTS trg_jayaram_mittai_protect_profile_role ON public.jayaram_mittai_profiles;
CREATE TRIGGER trg_jayaram_mittai_protect_profile_role
  BEFORE UPDATE ON public.jayaram_mittai_profiles
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_protect_profile_role();


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. PERFORMANCE & INTEGRITY INDEXES (Prefix: idx_jayaram_mittai_)
-- Implements: Section 15 (Reliability & Scaling), Section 20 (Database Schema)
-- ─────────────────────────────────────────────────────────────────────────────

-- Addresses
CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_addresses_profile_id
  ON public.jayaram_mittai_addresses(profile_id);

-- Categories
CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_categories_is_active
  ON public.jayaram_mittai_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_categories_sort_order
  ON public.jayaram_mittai_categories(sort_order);

-- Products
CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_products_category_id
  ON public.jayaram_mittai_products(category_id);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_products_is_active
  ON public.jayaram_mittai_products(is_active);

-- Product Availability & Out of Stock
CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_product_availability_product_id
  ON public.jayaram_mittai_product_availability(product_id);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_product_out_of_stock_product_id
  ON public.jayaram_mittai_product_out_of_stock(product_id);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_product_out_of_stock_active
  ON public.jayaram_mittai_product_out_of_stock(product_id, is_out_of_stock);

-- Delivery Zones & Rules
CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_delivery_zones_is_enabled
  ON public.jayaram_mittai_delivery_zones(is_enabled);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_delivery_rules_is_active
  ON public.jayaram_mittai_delivery_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_delivery_rules_max_distance
  ON public.jayaram_mittai_delivery_rules(max_distance_km);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_operational_hours_day
  ON public.jayaram_mittai_operational_hours(day_of_week);

-- Orders
CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_orders_customer_id
  ON public.jayaram_mittai_orders(customer_id);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_orders_status
  ON public.jayaram_mittai_orders(status);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_orders_created_at
  ON public.jayaram_mittai_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_orders_idempotency_key
  ON public.jayaram_mittai_orders(idempotency_key);

-- Order Items
CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_order_items_order_id
  ON public.jayaram_mittai_order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_order_items_product_id
  ON public.jayaram_mittai_order_items(product_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_payments_order_id
  ON public.jayaram_mittai_payments(order_id);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_payments_provider_ref
  ON public.jayaram_mittai_payments(provider, provider_reference);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_notifications_customer_id
  ON public.jayaram_mittai_notifications(customer_id);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_notifications_unread
  ON public.jayaram_mittai_notifications(customer_id, is_read)
  WHERE is_read = false;

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_audit_logs_actor_id
  ON public.jayaram_mittai_audit_logs(actor_id);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_audit_logs_entity
  ON public.jayaram_mittai_audit_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_jayaram_mittai_audit_logs_created_at
  ON public.jayaram_mittai_audit_logs(created_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Implements: Section 11 (Auth), Section 12 (DB Security), Section 14 (Order Security), Section 20
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS across all ecommerce tables
ALTER TABLE public.jayaram_mittai_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_product_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_product_out_of_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_delivery_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_operational_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jayaram_mittai_audit_logs ENABLE ROW LEVEL SECURITY;


-- 6.1 PROFILES POLICIES
-- Section 12/20: User sees/edits own profile; Admins see all profiles.
DROP POLICY IF EXISTS "jayaram_mittai_profiles_select_policy" ON public.jayaram_mittai_profiles;
CREATE POLICY "jayaram_mittai_profiles_select_policy"
  ON public.jayaram_mittai_profiles
  FOR SELECT
  USING (
    id = auth.uid() OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "jayaram_mittai_profiles_update_policy" ON public.jayaram_mittai_profiles;
CREATE POLICY "jayaram_mittai_profiles_update_policy"
  ON public.jayaram_mittai_profiles
  FOR UPDATE
  USING (
    id = auth.uid() OR public.jayaram_mittai_is_admin()
  )
  WITH CHECK (
    id = auth.uid() OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "jayaram_mittai_profiles_insert_policy" ON public.jayaram_mittai_profiles;
CREATE POLICY "jayaram_mittai_profiles_insert_policy"
  ON public.jayaram_mittai_profiles
  FOR INSERT
  WITH CHECK (
    id = auth.uid() OR public.jayaram_mittai_is_admin()
  );


-- 6.2 ADDRESSES POLICIES
-- Section 12/20: Owner-only access; Admin can select.
DROP POLICY IF EXISTS "jayaram_mittai_addresses_select_policy" ON public.jayaram_mittai_addresses;
CREATE POLICY "jayaram_mittai_addresses_select_policy"
  ON public.jayaram_mittai_addresses
  FOR SELECT
  USING (
    profile_id = auth.uid() OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "jayaram_mittai_addresses_insert_policy" ON public.jayaram_mittai_addresses;
CREATE POLICY "jayaram_mittai_addresses_insert_policy"
  ON public.jayaram_mittai_addresses
  FOR INSERT
  WITH CHECK (
    profile_id = auth.uid() OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "jayaram_mittai_addresses_update_policy" ON public.jayaram_mittai_addresses;
CREATE POLICY "jayaram_mittai_addresses_update_policy"
  ON public.jayaram_mittai_addresses
  FOR UPDATE
  USING (
    profile_id = auth.uid() OR public.jayaram_mittai_is_admin()
  )
  WITH CHECK (
    profile_id = auth.uid() OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "jayaram_mittai_addresses_delete_policy" ON public.jayaram_mittai_addresses;
CREATE POLICY "jayaram_mittai_addresses_delete_policy"
  ON public.jayaram_mittai_addresses
  FOR DELETE
  USING (
    profile_id = auth.uid() OR public.jayaram_mittai_is_admin()
  );


-- 6.3 CATEGORIES POLICIES
-- Section 20: Public can read active; Admins have full access.
DROP POLICY IF EXISTS "jayaram_mittai_categories_select_policy" ON public.jayaram_mittai_categories;
CREATE POLICY "jayaram_mittai_categories_select_policy"
  ON public.jayaram_mittai_categories
  FOR SELECT
  USING (
    is_active = true OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "jayaram_mittai_categories_admin_insert" ON public.jayaram_mittai_categories;
CREATE POLICY "jayaram_mittai_categories_admin_insert"
  ON public.jayaram_mittai_categories
  FOR INSERT
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_categories_admin_update" ON public.jayaram_mittai_categories;
CREATE POLICY "jayaram_mittai_categories_admin_update"
  ON public.jayaram_mittai_categories
  FOR UPDATE
  USING (public.jayaram_mittai_is_admin())
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_categories_admin_delete" ON public.jayaram_mittai_categories;
CREATE POLICY "jayaram_mittai_categories_admin_delete"
  ON public.jayaram_mittai_categories
  FOR DELETE
  USING (public.jayaram_mittai_is_admin());


-- 6.4 PRODUCTS POLICIES
-- Section 20: Public can read active products; Admins have full access.
DROP POLICY IF EXISTS "jayaram_mittai_products_select_policy" ON public.jayaram_mittai_products;
CREATE POLICY "jayaram_mittai_products_select_policy"
  ON public.jayaram_mittai_products
  FOR SELECT
  USING (
    is_active = true OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "jayaram_mittai_products_admin_insert" ON public.jayaram_mittai_products;
CREATE POLICY "jayaram_mittai_products_admin_insert"
  ON public.jayaram_mittai_products
  FOR INSERT
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_products_admin_update" ON public.jayaram_mittai_products;
CREATE POLICY "jayaram_mittai_products_admin_update"
  ON public.jayaram_mittai_products
  FOR UPDATE
  USING (public.jayaram_mittai_is_admin())
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_products_admin_delete" ON public.jayaram_mittai_products;
CREATE POLICY "jayaram_mittai_products_admin_delete"
  ON public.jayaram_mittai_products
  FOR DELETE
  USING (public.jayaram_mittai_is_admin());


-- 6.5 PRODUCT AVAILABILITY POLICIES
-- Section 6/20: Publicly readable; Admin-only writes.
DROP POLICY IF EXISTS "jayaram_mittai_product_availability_select_policy" ON public.jayaram_mittai_product_availability;
CREATE POLICY "jayaram_mittai_product_availability_select_policy"
  ON public.jayaram_mittai_product_availability
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "jayaram_mittai_product_availability_admin_insert" ON public.jayaram_mittai_product_availability;
CREATE POLICY "jayaram_mittai_product_availability_admin_insert"
  ON public.jayaram_mittai_product_availability
  FOR INSERT
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_product_availability_admin_update" ON public.jayaram_mittai_product_availability;
CREATE POLICY "jayaram_mittai_product_availability_admin_update"
  ON public.jayaram_mittai_product_availability
  FOR UPDATE
  USING (public.jayaram_mittai_is_admin())
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_product_availability_admin_delete" ON public.jayaram_mittai_product_availability;
CREATE POLICY "jayaram_mittai_product_availability_admin_delete"
  ON public.jayaram_mittai_product_availability
  FOR DELETE
  USING (public.jayaram_mittai_is_admin());


-- 6.6 PRODUCT OUT OF STOCK POLICIES
-- Section 5/6/20: Publicly readable (customers see message); Admin-only writes.
DROP POLICY IF EXISTS "jayaram_mittai_product_out_of_stock_select_policy" ON public.jayaram_mittai_product_out_of_stock;
CREATE POLICY "jayaram_mittai_product_out_of_stock_select_policy"
  ON public.jayaram_mittai_product_out_of_stock
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "jayaram_mittai_product_out_of_stock_admin_insert" ON public.jayaram_mittai_product_out_of_stock;
CREATE POLICY "jayaram_mittai_product_out_of_stock_admin_insert"
  ON public.jayaram_mittai_product_out_of_stock
  FOR INSERT
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_product_out_of_stock_admin_update" ON public.jayaram_mittai_product_out_of_stock;
CREATE POLICY "jayaram_mittai_product_out_of_stock_admin_update"
  ON public.jayaram_mittai_product_out_of_stock
  FOR UPDATE
  USING (public.jayaram_mittai_is_admin())
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_product_out_of_stock_admin_delete" ON public.jayaram_mittai_product_out_of_stock;
CREATE POLICY "jayaram_mittai_product_out_of_stock_admin_delete"
  ON public.jayaram_mittai_product_out_of_stock
  FOR DELETE
  USING (public.jayaram_mittai_is_admin());


-- 6.7 DELIVERY ZONES POLICIES
-- Section 3/20: Public read enabled zones; Admin full control.
DROP POLICY IF EXISTS "jayaram_mittai_delivery_zones_select_policy" ON public.jayaram_mittai_delivery_zones;
CREATE POLICY "jayaram_mittai_delivery_zones_select_policy"
  ON public.jayaram_mittai_delivery_zones
  FOR SELECT
  USING (
    is_enabled = true OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "jayaram_mittai_delivery_zones_admin_insert" ON public.jayaram_mittai_delivery_zones;
CREATE POLICY "jayaram_mittai_delivery_zones_admin_insert"
  ON public.jayaram_mittai_delivery_zones
  FOR INSERT
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_delivery_zones_admin_update" ON public.jayaram_mittai_delivery_zones;
CREATE POLICY "jayaram_mittai_delivery_zones_admin_update"
  ON public.jayaram_mittai_delivery_zones
  FOR UPDATE
  USING (public.jayaram_mittai_is_admin())
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_delivery_zones_admin_delete" ON public.jayaram_mittai_delivery_zones;
CREATE POLICY "jayaram_mittai_delivery_zones_admin_delete"
  ON public.jayaram_mittai_delivery_zones
  FOR DELETE
  USING (public.jayaram_mittai_is_admin());


-- 6.8 DELIVERY RULES POLICIES
-- Section 2/4/20: Public read active rules; Admin full control.
DROP POLICY IF EXISTS "jayaram_mittai_delivery_rules_select_policy" ON public.jayaram_mittai_delivery_rules;
CREATE POLICY "jayaram_mittai_delivery_rules_select_policy"
  ON public.jayaram_mittai_delivery_rules
  FOR SELECT
  USING (
    is_active = true OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "jayaram_mittai_delivery_rules_admin_insert" ON public.jayaram_mittai_delivery_rules;
CREATE POLICY "jayaram_mittai_delivery_rules_admin_insert"
  ON public.jayaram_mittai_delivery_rules
  FOR INSERT
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_delivery_rules_admin_update" ON public.jayaram_mittai_delivery_rules;
CREATE POLICY "jayaram_mittai_delivery_rules_admin_update"
  ON public.jayaram_mittai_delivery_rules
  FOR UPDATE
  USING (public.jayaram_mittai_is_admin())
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_delivery_rules_admin_delete" ON public.jayaram_mittai_delivery_rules;
CREATE POLICY "jayaram_mittai_delivery_rules_admin_delete"
  ON public.jayaram_mittai_delivery_rules
  FOR DELETE
  USING (public.jayaram_mittai_is_admin());


-- 6.9 OPERATIONAL HOURS POLICIES
-- Section 2/20: Public read; Admin full control.
DROP POLICY IF EXISTS "jayaram_mittai_operational_hours_select_policy" ON public.jayaram_mittai_operational_hours;
CREATE POLICY "jayaram_mittai_operational_hours_select_policy"
  ON public.jayaram_mittai_operational_hours
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "jayaram_mittai_operational_hours_admin_insert" ON public.jayaram_mittai_operational_hours;
CREATE POLICY "jayaram_mittai_operational_hours_admin_insert"
  ON public.jayaram_mittai_operational_hours
  FOR INSERT
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_operational_hours_admin_update" ON public.jayaram_mittai_operational_hours;
CREATE POLICY "jayaram_mittai_operational_hours_admin_update"
  ON public.jayaram_mittai_operational_hours
  FOR UPDATE
  USING (public.jayaram_mittai_is_admin())
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_operational_hours_admin_delete" ON public.jayaram_mittai_operational_hours;
CREATE POLICY "jayaram_mittai_operational_hours_admin_delete"
  ON public.jayaram_mittai_operational_hours
  FOR DELETE
  USING (public.jayaram_mittai_is_admin());


-- 6.10 ORDERS POLICIES
-- Section 12/14/20: Customer sees only their own orders; Admin sees all.
-- CRITICAL SECURITY RULE: No direct client INSERT/UPDATE/DELETE policies exist.
-- Order writes are strictly NestJS backend service-role mediated.
DROP POLICY IF EXISTS "jayaram_mittai_orders_select_policy" ON public.jayaram_mittai_orders;
CREATE POLICY "jayaram_mittai_orders_select_policy"
  ON public.jayaram_mittai_orders
  FOR SELECT
  USING (
    customer_id = auth.uid() OR public.jayaram_mittai_is_admin()
  );


-- 6.11 ORDER ITEMS POLICIES
-- Section 12/14/20: Customer sees items only for their own orders; Admin sees all.
-- Direct client INSERT/UPDATE/DELETE forbidden (Backend service-role mediated only).
DROP POLICY IF EXISTS "jayaram_mittai_order_items_select_policy" ON public.jayaram_mittai_order_items;
CREATE POLICY "jayaram_mittai_order_items_select_policy"
  ON public.jayaram_mittai_order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.jayaram_mittai_orders o
      WHERE o.id = jayaram_mittai_order_items.order_id
        AND (o.customer_id = auth.uid() OR public.jayaram_mittai_is_admin())
    )
  );


-- 6.12 PAYMENTS POLICIES
-- Section 7/12/20: Customer can view payment record for their own orders; Admin sees all.
-- Direct client INSERT/UPDATE/DELETE forbidden (Backend payment provider webhook/service-role mediated only).
DROP POLICY IF EXISTS "jayaram_mittai_payments_select_policy" ON public.jayaram_mittai_payments;
CREATE POLICY "jayaram_mittai_payments_select_policy"
  ON public.jayaram_mittai_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.jayaram_mittai_orders o
      WHERE o.id = jayaram_mittai_payments.order_id
        AND (o.customer_id = auth.uid() OR public.jayaram_mittai_is_admin())
    )
  );


-- 6.13 NOTIFICATIONS POLICIES
-- Section 20: Customer reads own notifications or broadcasts; can update is_read status.
DROP POLICY IF EXISTS "jayaram_mittai_notifications_select_policy" ON public.jayaram_mittai_notifications;
CREATE POLICY "jayaram_mittai_notifications_select_policy"
  ON public.jayaram_mittai_notifications
  FOR SELECT
  USING (
    customer_id = auth.uid() OR customer_id IS NULL OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "jayaram_mittai_notifications_update_policy" ON public.jayaram_mittai_notifications;
CREATE POLICY "jayaram_mittai_notifications_update_policy"
  ON public.jayaram_mittai_notifications
  FOR UPDATE
  USING (
    customer_id = auth.uid() OR public.jayaram_mittai_is_admin()
  )
  WITH CHECK (
    customer_id = auth.uid() OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "jayaram_mittai_notifications_admin_insert" ON public.jayaram_mittai_notifications;
CREATE POLICY "jayaram_mittai_notifications_admin_insert"
  ON public.jayaram_mittai_notifications
  FOR INSERT
  WITH CHECK (public.jayaram_mittai_is_admin());

DROP POLICY IF EXISTS "jayaram_mittai_notifications_admin_delete" ON public.jayaram_mittai_notifications;
CREATE POLICY "jayaram_mittai_notifications_admin_delete"
  ON public.jayaram_mittai_notifications
  FOR DELETE
  USING (public.jayaram_mittai_is_admin());


-- 6.14 AUDIT LOGS POLICIES
-- Section 19/20: Admin-only readable; Client write forbidden (service-role write-only).
DROP POLICY IF EXISTS "jayaram_mittai_audit_logs_select_policy" ON public.jayaram_mittai_audit_logs;
CREATE POLICY "jayaram_mittai_audit_logs_select_policy"
  ON public.jayaram_mittai_audit_logs
  FOR SELECT
  USING (
    public.jayaram_mittai_is_admin()
  );

COMMIT;
