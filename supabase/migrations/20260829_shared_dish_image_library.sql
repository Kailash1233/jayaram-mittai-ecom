-- =============================================================================
-- SHARED DISH IMAGE LIBRARY (Cross-Tenant)
-- Migration File: supabase/migrations/20260829_shared_dish_image_library.sql
-- Description: Cross-tenant canonical image library mapping normalized dish names
--              to stock/AI images, with seed entries for 45+ common restaurant dishes.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.shared_dish_image_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_name_normalized text NOT NULL UNIQUE,
  image_url text NOT NULL,
  source text NOT NULL DEFAULT 'stock',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.shared_dish_image_library IS 'Cross-tenant canonical image library mapping normalized dish names to images.';
COMMENT ON COLUMN public.shared_dish_image_library.dish_name_normalized IS 'Lowercase, trimmed, punctuation-stripped matching key (e.g. "gulab jamun").';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shared_dish_image_library_name
  ON public.shared_dish_image_library(dish_name_normalized);

-- Updated-at Trigger
DROP TRIGGER IF EXISTS trg_shared_dish_image_library_updated_at ON public.shared_dish_image_library;
CREATE TRIGGER trg_shared_dish_image_library_updated_at
  BEFORE UPDATE ON public.shared_dish_image_library
  FOR EACH ROW EXECUTE FUNCTION public.jayaram_mittai_update_updated_at_column();

-- Row Level Security
ALTER TABLE public.shared_dish_image_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shared_dish_image_library_select" ON public.shared_dish_image_library;
CREATE POLICY "shared_dish_image_library_select"
  ON public.shared_dish_image_library
  FOR SELECT
  USING (true); -- Publicly readable across all tenants

DROP POLICY IF EXISTS "shared_dish_image_library_admin_insert" ON public.shared_dish_image_library;
CREATE POLICY "shared_dish_image_library_admin_insert"
  ON public.shared_dish_image_library
  FOR INSERT
  WITH CHECK (
    current_user = 'service_role' OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "shared_dish_image_library_admin_update" ON public.shared_dish_image_library;
CREATE POLICY "shared_dish_image_library_admin_update"
  ON public.shared_dish_image_library
  FOR UPDATE
  USING (
    current_user = 'service_role' OR public.jayaram_mittai_is_admin()
  )
  WITH CHECK (
    current_user = 'service_role' OR public.jayaram_mittai_is_admin()
  );

DROP POLICY IF EXISTS "shared_dish_image_library_admin_delete" ON public.shared_dish_image_library;
CREATE POLICY "shared_dish_image_library_admin_delete"
  ON public.shared_dish_image_library
  FOR DELETE
  USING (
    current_user = 'service_role' OR public.jayaram_mittai_is_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED CANONICAL DISH IMAGES
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.shared_dish_image_library (dish_name_normalized, image_url, source)
VALUES
  ('rasamalai', '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg', 'stock'),
  ('royal rasamalai', '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg', 'stock'),
  ('basundi', '/images/food/Basundi_plated_on_white_dish_202608251905.jpeg', 'stock'),
  ('badam basundi', '/images/food/Basundi_plated_on_white_dish_202608251905.jpeg', 'stock'),
  ('rich badam basundi', '/images/food/Basundi_plated_on_white_dish_202608251905.jpeg', 'stock'),
  ('black forest cake', '/images/food/Black_Forest_Cake_plated_202608251905.jpeg', 'stock'),
  ('black forest slice', '/images/food/Black_Forest_Cake_plated_202608251905.jpeg', 'stock'),
  ('badam milk', '/images/food/Badam_milk_in_glass_202608251905.jpeg', 'stock'),
  ('kesari badam milk', '/images/food/Badam_milk_in_glass_202608251905.jpeg', 'stock'),
  ('rose milk', '/images/food/Rose_milk_in_glass_202608251905.jpeg', 'stock'),
  ('signature rose milk', '/images/food/Rose_milk_in_glass_202608251905.jpeg', 'stock'),
  ('pomegranate juice', '/images/food/Pomegranate_juice_in_glass_202608251905.jpeg', 'stock'),
  ('fresh pomegranate juice', '/images/food/Pomegranate_juice_in_glass_202608251905.jpeg', 'stock'),
  ('orange juice', '/images/food/Orange_juice_in_glass_202608251905.jpeg', 'stock'),
  ('sweet lime juice', '/images/food/Sweet_lime_juice_in_glass_202608251905.jpeg', 'stock'),
  ('apple juice', '/images/food/Fresh_apple_juice_in_glass_202608251905.jpeg', 'stock'),
  ('grape juice', '/images/food/Grape_juice_in_glass_202608251905.jpeg', 'stock'),
  ('carrot juice', '/images/food/Carrot_juice_in_glass_202608251905.jpeg', 'stock'),
  ('papaya juice', '/images/food/Papaya_juice_in_glass_202608251905.jpeg', 'stock'),
  ('pineapple juice', '/images/food/Pineapple_juice_in_glass_202608251905.jpeg', 'stock'),
  ('butter fruit juice', '/images/food/Kirni_butter_fruit_juice_in_202608251905.jpeg', 'stock'),
  ('milkshake', '/images/food/Milkshake_served_in_glass_202608251905.jpeg', 'stock'),
  ('paneer tikka', '/images/food/Paneer_tikka_on_white_dish_202608251905.jpeg', 'stock'),
  ('tandoori paneer tikka', '/images/food/Paneer_tikka_on_white_dish_202608251905.jpeg', 'stock'),
  ('hariyali paneer tikka', '/images/food/Hariyali_Paneer_Tikka_on_plate_202608251905.jpeg', 'stock'),
  ('mushroom tikka', '/images/food/Mushroom_tikka_on_white_dish_202608251905.jpeg', 'stock'),
  ('gobi tikka', '/images/food/Gobi_Tikka_plated_on_dish_202608251905.jpeg', 'stock'),
  ('aloo tandoori tikka', '/images/food/Aloo_Tandoori_Tikka_on_plate_202608251905.jpeg', 'stock'),
  ('veg seekh kebab', '/images/food/Veg_Seekh_Kebab_on_dish_202608251905.jpeg', 'stock'),
  ('paneer fried rice', '/images/food/Paneer_fried_rice_in_bowl_202608251905.jpeg', 'stock'),
  ('veg fried rice', '/images/food/Veg_fried_rice_in_bowl_202608251905.jpeg', 'stock'),
  ('vegetable fried rice', '/images/food/Vegetable_fried_rice_in_bowl_202608251905.jpeg', 'stock'),
  ('schezwan fried rice', '/images/food/Veg_Schezwan_Fried_Rice_bowl_202608251905.jpeg', 'stock'),
  ('paneer schezwan fried rice', '/images/food/Paneer_Schezwan_Fried_Rice_in_202608251905.jpeg', 'stock'),
  ('mushroom fried rice', '/images/food/Mushroom_fried_rice_in_bowl_202608251905.jpeg', 'stock'),
  ('gobi fried rice', '/images/food/Gobi_Fried_Rice_in_bowl_202608251905.jpeg', 'stock'),
  ('shanghai fried rice', '/images/food/Shanghai_Fried_Rice_in_bowl_202608251905.jpeg', 'stock'),
  ('butter naan', '/images/food/Butter_Naan_on_dish_202608251905.jpeg', 'stock'),
  ('plain naan', '/images/food/Plain_Naan_plated_on_dish_202608251905.jpeg', 'stock'),
  ('garlic naan', '/images/food/Garlic_Naan_plated_on_dish_202608251905.jpeg', 'stock'),
  ('butter phulka', '/images/food/Butter_phulka_on_plate_202608251905.jpeg', 'stock'),
  ('plain phulka', '/images/food/Plain_phulka_on_plate_202608251905.jpeg', 'stock'),
  ('chapathi with gravy', '/images/food/Chapathi_with_gravy_plated_202608251905.jpeg', 'stock'),
  ('paneer paratha', '/images/food/Paneer_paratha_on_a_plate_202608251905.jpeg', 'stock'),
  ('aloo paratha', '/images/food/Aloo_Paratha_on_plate_202608251905.jpeg', 'stock'),
  ('gobi paratha', '/images/food/Gobi_Paratha_on_plate_202608251905.jpeg', 'stock'),
  ('chilli paratha', '/images/food/Chilli_Paratha_on_plate_202608251905.jpeg', 'stock'),
  ('kulcha paratha', '/images/food/Kulcha_Paratha_on_plate_202608251905.jpeg', 'stock'),
  ('tandoori paratha', '/images/food/Tandoori_Paratha_on_plate_202608251905.jpeg', 'stock'),
  ('stuffed paratha', '/images/food/Stuffed_paratha_on_plate_202608251905.jpeg', 'stock'),
  ('steamed rice', '/images/food/Steamed_rice_on_plate_202608251905.jpeg', 'stock'),
  ('festive combo', '/images/ecommerce/Festive Combo.jpeg', 'stock'),
  ('festive gift box', '/images/ecommerce/Festive Combo.jpeg', 'stock'),
  ('chai snack platter', '/images/ecommerce/snacks.jpeg', 'stock'),
  ('savouries platter', '/images/ecommerce/snacks.jpeg', 'stock')
ON CONFLICT (dish_name_normalized) DO UPDATE
SET
  image_url = EXCLUDED.image_url,
  source = EXCLUDED.source,
  updated_at = now();

COMMIT;
