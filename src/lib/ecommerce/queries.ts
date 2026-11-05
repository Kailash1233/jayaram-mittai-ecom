// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — DATA ACCESS LAYER
// Thin re-export of the real Shop API catalog client (src/lib/api/catalog.ts).
// Kept as its own module so existing imports (shop/page.tsx, admin/page.tsx)
// don't need to change.
// =============================================================================

export { getActiveCategories, getActiveProducts, getProductById } from '../api/catalog';
