// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — DATA ACCESS LAYER
// Supabase Client Queries with Safe Fallbacks
// Reference: Section 12, 14, 20 of "e commerce - master.md"
// =============================================================================

import { supabase, isSupabaseConfigured } from '../supabase/client';
import {
  JayaramMittaiCategory,
  JayaramMittaiProduct,
  JayaramMittaiDeliveryZone,
  JayaramMittaiDeliveryRule,
  JayaramMittaiOperationalHours,
  JayaramMittaiOrder,
  JayaramMittaiProfile,
  JayaramMittaiAddress,
} from './types';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_DELIVERY_ZONES,
  SEED_DELIVERY_RULES,
  SEED_OPERATIONAL_HOURS,
} from './catalog-seed';
import { resolveProductImage, getSharedImageLibraryMap } from './image-resolver';

/**
 * Fetch all active categories
 */
export async function getActiveCategories(): Promise<JayaramMittaiCategory[]> {
  if (!isSupabaseConfigured()) {
    return SEED_CATEGORIES;
  }

  try {
    const { data, error } = await supabase
      .from('jayaram_mittai_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return SEED_CATEGORIES;
    }
    return data as JayaramMittaiCategory[];
  } catch {
    return SEED_CATEGORIES;
  }
}

/**
 * Fetch products with availability, optional category filter and search query
 */
export async function getActiveProducts(
  categoryId?: string,
  searchQuery?: string
): Promise<JayaramMittaiProduct[]> {
  if (!isSupabaseConfigured()) {
    let list = SEED_PRODUCTS;
    if (categoryId && categoryId !== 'all') {
      list = list.filter((p) => p.category_id === categoryId);
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return list;
  }

  try {
    let query = supabase
      .from('jayaram_mittai_products')
      .select(`
        *,
        category:jayaram_mittai_categories(*),
        availability:jayaram_mittai_product_availability(*),
        out_of_stock:jayaram_mittai_product_out_of_stock(*)
      `)
      .eq('is_active', true);

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }
    if (searchQuery && searchQuery.trim()) {
      query = query.ilike('name', `%${searchQuery.trim()}%`);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback to seed
      let list = SEED_PRODUCTS;
      if (categoryId && categoryId !== 'all') {
        list = list.filter((p) => p.category_id === categoryId);
      }
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
      }
      return list.map((p) => ({
        ...p,
        image_url: resolveProductImage(p.name, p.image_url),
      }));
    }

    const sharedMap = await getSharedImageLibraryMap();

    return (data as any[]).map((item) => ({
      ...item,
      image_url: resolveProductImage(item.name, item.image_url, sharedMap),
      availability: Array.isArray(item.availability)
        ? item.availability[0]
        : item.availability,
      out_of_stock: Array.isArray(item.out_of_stock)
        ? item.out_of_stock[0]
        : item.out_of_stock,
    })) as JayaramMittaiProduct[];
  } catch {
    return SEED_PRODUCTS.map((p) => ({
      ...p,
      image_url: resolveProductImage(p.name, p.image_url),
    }));
  }
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(
  id: string
): Promise<JayaramMittaiProduct | null> {
  if (!isSupabaseConfigured()) {
    const p = SEED_PRODUCTS.find((item) => item.id === id) || null;
    return p ? { ...p, image_url: resolveProductImage(p.name, p.image_url) } : null;
  }

  try {
    const { data, error } = await supabase
      .from('jayaram_mittai_products')
      .select(`
        *,
        category:jayaram_mittai_categories(*),
        availability:jayaram_mittai_product_availability(*),
        out_of_stock:jayaram_mittai_product_out_of_stock(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      const p = SEED_PRODUCTS.find((item) => item.id === id) || null;
      return p ? { ...p, image_url: resolveProductImage(p.name, p.image_url) } : null;
    }

    const item = data as any;
    const sharedMap = await getSharedImageLibraryMap();
    return {
      ...item,
      image_url: resolveProductImage(item.name, item.image_url, sharedMap),
      availability: Array.isArray(item.availability)
        ? item.availability[0]
        : item.availability,
      out_of_stock: Array.isArray(item.out_of_stock)
        ? item.out_of_stock[0]
        : item.out_of_stock,
    } as JayaramMittaiProduct;
  } catch {
    const p = SEED_PRODUCTS.find((item) => item.id === id) || null;
    return p ? { ...p, image_url: resolveProductImage(p.name, p.image_url) } : null;
  }
}

/**
 * Fetch delivery zones and distance rules
 */
export async function getDeliveryConfig(): Promise<{
  zones: JayaramMittaiDeliveryZone[];
  rules: JayaramMittaiDeliveryRule[];
  operationalHours: JayaramMittaiOperationalHours[];
}> {
  if (!isSupabaseConfigured()) {
    return {
      zones: SEED_DELIVERY_ZONES,
      rules: SEED_DELIVERY_RULES,
      operationalHours: SEED_OPERATIONAL_HOURS,
    };
  }

  try {
    const [zonesRes, rulesRes, hoursRes] = await Promise.all([
      supabase.from('jayaram_mittai_delivery_zones').select('*').eq('is_enabled', true),
      supabase.from('jayaram_mittai_delivery_rules').select('*').eq('is_active', true),
      supabase.from('jayaram_mittai_operational_hours').select('*'),
    ]);

    return {
      zones: zonesRes.data?.length ? (zonesRes.data as JayaramMittaiDeliveryZone[]) : SEED_DELIVERY_ZONES,
      rules: rulesRes.data?.length ? (rulesRes.data as JayaramMittaiDeliveryRule[]) : SEED_DELIVERY_RULES,
      operationalHours: hoursRes.data?.length
        ? (hoursRes.data as JayaramMittaiOperationalHours[])
        : SEED_OPERATIONAL_HOURS,
    };
  } catch {
    return {
      zones: SEED_DELIVERY_ZONES,
      rules: SEED_DELIVERY_RULES,
      operationalHours: SEED_OPERATIONAL_HOURS,
    };
  }
}

/**
 * Fetch order details by ID
 */
export async function getOrderById(orderId: string): Promise<JayaramMittaiOrder | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('jayaram_mittai_orders')
      .select(`
        *,
        items:jayaram_mittai_order_items(*),
        address:jayaram_mittai_addresses(*),
        customer:jayaram_mittai_profiles(*)
      `)
      .eq('id', orderId)
      .single();

    if (error || !data) return null;
    return data as JayaramMittaiOrder;
  } catch {
    return null;
  }
}
