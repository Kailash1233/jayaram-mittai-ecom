// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — IMAGE RESOLUTION SERVICE
// Reference: Section 2 (Image Resolution Logic)
//
// Resolution Priority:
// 1. Per-tenant / per-product override (product.image_url) if set.
// 2. Shared Dish Image Library lookup by normalized dish name.
// 3. Keyword / partial category fallback in shared library.
// 4. Safe generic fallback placeholder.
// =============================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const SAFE_FALLBACK_IMAGE =
  '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg';

export const SHARED_IMAGE_DICTIONARY: Record<string, string> = {
  rasamalai: '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg',
  'royal rasamalai': '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg',
  basundi: '/images/food/Basundi_plated_on_white_dish_202608251905.jpeg',
  'badam basundi': '/images/food/Basundi_plated_on_white_dish_202608251905.jpeg',
  'rich badam basundi': '/images/food/Basundi_plated_on_white_dish_202608251905.jpeg',
  'black forest cake': '/images/food/Black_Forest_Cake_plated_202608251905.jpeg',
  'black forest slice': '/images/food/Black_Forest_Cake_plated_202608251905.jpeg',
  'badam milk': '/images/food/Badam_milk_in_glass_202608251905.jpeg',
  'kesari badam milk': '/images/food/Badam_milk_in_glass_202608251905.jpeg',
  'rose milk': '/images/food/Rose_milk_in_glass_202608251905.jpeg',
  'signature rose milk': '/images/food/Rose_milk_in_glass_202608251905.jpeg',
  'pomegranate juice': '/images/food/Pomegranate_juice_in_glass_202608251905.jpeg',
  'fresh pomegranate juice': '/images/food/Pomegranate_juice_in_glass_202608251905.jpeg',
  'orange juice': '/images/food/Orange_juice_in_glass_202608251905.jpeg',
  'sweet lime juice': '/images/food/Sweet_lime_juice_in_glass_202608251905.jpeg',
  'apple juice': '/images/food/Fresh_apple_juice_in_glass_202608251905.jpeg',
  'fresh apple juice': '/images/food/Fresh_apple_juice_in_glass_202608251905.jpeg',
  'grape juice': '/images/food/Grape_juice_in_glass_202608251905.jpeg',
  'carrot juice': '/images/food/Carrot_juice_in_glass_202608251905.jpeg',
  'papaya juice': '/images/food/Papaya_juice_in_glass_202608251905.jpeg',
  'pineapple juice': '/images/food/Pineapple_juice_in_glass_202608251905.jpeg',
  'butter fruit juice': '/images/food/Kirni_butter_fruit_juice_in_202608251905.jpeg',
  milkshake: '/images/food/Milkshake_served_in_glass_202608251905.jpeg',
  'paneer tikka': '/images/food/Paneer_tikka_on_white_dish_202608251905.jpeg',
  'tandoori paneer tikka': '/images/food/Paneer_tikka_on_white_dish_202608251905.jpeg',
  'hariyali paneer tikka': '/images/food/Hariyali_Paneer_Tikka_on_plate_202608251905.jpeg',
  'mushroom tikka': '/images/food/Mushroom_tikka_on_white_dish_202608251905.jpeg',
  'gobi tikka': '/images/food/Gobi_Tikka_plated_on_dish_202608251905.jpeg',
  'aloo tandoori tikka': '/images/food/Aloo_Tandoori_Tikka_on_plate_202608251905.jpeg',
  'veg seekh kebab': '/images/food/Veg_Seekh_Kebab_on_dish_202608251905.jpeg',
  'paneer fried rice': '/images/food/Paneer_fried_rice_in_bowl_202608251905.jpeg',
  'veg fried rice': '/images/food/Veg_fried_rice_in_bowl_202608251905.jpeg',
  'vegetable fried rice': '/images/food/Vegetable_fried_rice_in_bowl_202608251905.jpeg',
  'schezwan fried rice': '/images/food/Veg_Schezwan_Fried_Rice_bowl_202608251905.jpeg',
  'paneer schezwan fried rice': '/images/food/Paneer_Schezwan_Fried_Rice_in_202608251905.jpeg',
  'mushroom fried rice': '/images/food/Mushroom_fried_rice_in_bowl_202608251905.jpeg',
  'gobi fried rice': '/images/food/Gobi_Fried_Rice_in_bowl_202608251905.jpeg',
  'shanghai fried rice': '/images/food/Shanghai_Fried_Rice_in_bowl_202608251905.jpeg',
  'butter naan': '/images/food/Butter_Naan_on_dish_202608251905.jpeg',
  'tandoori butter naan': '/images/food/Butter_Naan_on_dish_202608251905.jpeg',
  'plain naan': '/images/food/Plain_Naan_plated_on_dish_202608251905.jpeg',
  'garlic naan': '/images/food/Garlic_Naan_plated_on_dish_202608251905.jpeg',
  'garlic butter naan': '/images/food/Garlic_Naan_plated_on_dish_202608251905.jpeg',
  'butter phulka': '/images/food/Butter_phulka_on_plate_202608251905.jpeg',
  'plain phulka': '/images/food/Plain_phulka_on_plate_202608251905.jpeg',
  'chapathi with gravy': '/images/food/Chapathi_with_gravy_plated_202608251905.jpeg',
  'paneer paratha': '/images/food/Paneer_paratha_on_a_plate_202608251905.jpeg',
  'amritsari paneer paratha': '/images/food/Paneer_paratha_on_a_plate_202608251905.jpeg',
  'aloo paratha': '/images/food/Aloo_Paratha_on_plate_202608251905.jpeg',
  'classic aloo paratha': '/images/food/Aloo_Paratha_on_plate_202608251905.jpeg',
  'gobi paratha': '/images/food/Gobi_Paratha_on_plate_202608251905.jpeg',
  'chilli paratha': '/images/food/Chilli_Paratha_on_plate_202608251905.jpeg',
  'kulcha paratha': '/images/food/Kulcha_Paratha_on_plate_202608251905.jpeg',
  'tandoori paratha': '/images/food/Tandoori_Paratha_on_plate_202608251905.jpeg',
  'stuffed paratha': '/images/food/Stuffed_paratha_on_plate_202608251905.jpeg',
  'steamed rice': '/images/food/Steamed_rice_on_plate_202608251905.jpeg',
  'festive celebration box': '/images/ecommerce/Festive Combo.jpeg',
  'grand festive celebration box': '/images/ecommerce/Festive Combo.jpeg',
  'evening chai snack platter': '/images/ecommerce/snacks.jpeg',
  'chai snack platter': '/images/ecommerce/snacks.jpeg',
  'snack platter': '/images/ecommerce/snacks.jpeg',
};

/**
 * Normalizes dish name: lowercase, trimmed, punctuation & parenthesized weights stripped.
 * E.g. "Royal Rasamalai (2 pcs)!" -> "royal rasamalai"
 */
export function normalizeDishName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // remove parenthesized content like (250g), (2 pcs)
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ') // strip punctuation
    .replace(/\s+/g, ' ') // collapse multi spaces
    .trim();
}

/**
 * Resolves canonical image URL for a given product or dish name.
 * Implements Section 2 resolution order:
 * 1. Per-product/tenant override (`product.image_url`)
 * 2. Shared dish image library lookup
 * 3. Keyword / partial matching
 * 4. Safe fallback
 */
export function resolveProductImage(
  dishName: string,
  tenantOverrideUrl?: string | null,
  sharedMap?: Record<string, string>
): string {
  // Step 1: Per-product/tenant override
  if (tenantOverrideUrl && tenantOverrideUrl.trim().length > 0) {
    return tenantOverrideUrl.trim();
  }

  // Step 2: Shared library exact normalized match
  const normalized = normalizeDishName(dishName);
  const dict = sharedMap || SHARED_IMAGE_DICTIONARY;

  if (dict[normalized]) {
    return dict[normalized];
  }

  // Step 3: Partial / keyword matching
  const keys = Object.keys(dict);
  for (const key of keys) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return dict[key];
    }
  }

  // Category keyword fallbacks
  if (normalized.includes('paratha')) return dict['aloo paratha'] || SAFE_FALLBACK_IMAGE;
  if (normalized.includes('naan') || normalized.includes('phulka') || normalized.includes('roti'))
    return dict['butter naan'] || SAFE_FALLBACK_IMAGE;
  if (normalized.includes('tikka') || normalized.includes('paneer'))
    return dict['paneer tikka'] || SAFE_FALLBACK_IMAGE;
  if (normalized.includes('rice') || normalized.includes('biryani'))
    return dict['veg fried rice'] || SAFE_FALLBACK_IMAGE;
  if (normalized.includes('juice') || normalized.includes('shake') || normalized.includes('milk'))
    return dict['badam milk'] || SAFE_FALLBACK_IMAGE;
  if (normalized.includes('sweet') || normalized.includes('halwa') || normalized.includes('jamun') || normalized.includes('mithai'))
    return dict['rasamalai'] || SAFE_FALLBACK_IMAGE;

  // Step 4: Safe generic fallback
  return SAFE_FALLBACK_IMAGE;
}

/**
 * Asynchronously fetch shared image library mapping from Supabase (with fallback).
 */
export async function getSharedImageLibraryMap(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured()) {
    return SHARED_IMAGE_DICTIONARY;
  }

  try {
    const { data, error } = await (supabase as any)
      .from('shared_dish_image_library')
      .select('dish_name_normalized, image_url');

    if (error || !data || data.length === 0) {
      return SHARED_IMAGE_DICTIONARY;
    }

    const map: Record<string, string> = { ...SHARED_IMAGE_DICTIONARY };
    data.forEach((row: any) => {
      map[row.dish_name_normalized] = row.image_url;
    });

    return map;
  } catch {
    return SHARED_IMAGE_DICTIONARY;
  }
}
