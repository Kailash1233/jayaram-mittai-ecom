// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — CATALOG
// Wraps GET /api/catalog/products and /api/catalog/products/search, adapting
// the Shop API's category-grouped shape into the app's existing
// JayaramMittaiCategory / JayaramMittaiProduct types so components
// (ProductGrid, ProductCard, CartContext, ...) don't need to change.
// =============================================================================

import { apiFetch } from './client';
import type { ShopApiCategoryGroup } from './shopTypes';
import type { JayaramMittaiCategory, JayaramMittaiProduct } from '../ecommerce/types';

function toCategory(group: ShopApiCategoryGroup, sortOrder: number): JayaramMittaiCategory {
  const now = new Date().toISOString();
  return {
    id: group.category_slug,
    name: group.category_name,
    sort_order: sortOrder,
    is_active: true,
    created_at: now,
    updated_at: now,
  };
}

function toProducts(group: ShopApiCategoryGroup): JayaramMittaiProduct[] {
  const now = new Date().toISOString();
  return group.products.map((p) => ({
    id: p.product_id,
    category_id: group.category_slug,
    name: p.name,
    description: p.description || null,
    price: p.price,
    unit: '', // not returned by the Shop API
    image_url: p.image_url || null,
    is_active: true,
    created_at: now,
    updated_at: now,
    // availability / out_of_stock: the Shop API's product shape has no stock
    // fields yet, so these stay undefined and evaluateProductAvailability()
    // treats the item as always available. Revisit once the backend adds
    // stock data to this response.
  }));
}

export interface CatalogData {
  categories: JayaramMittaiCategory[];
  products: JayaramMittaiProduct[];
}

let cachedCatalog: CatalogData | null = null;
let inflightCatalog: Promise<CatalogData> | null = null;

async function fetchCatalog(): Promise<CatalogData> {
  const groups = await apiFetch<ShopApiCategoryGroup[]>('/api/catalog/products', { auth: false });
  const categories = groups.map(toCategory);
  const products = groups.flatMap(toProducts);
  return { categories, products };
}

/** Fetches once and caches for the session — categories/products rarely change mid-visit. */
async function getCatalog(): Promise<CatalogData> {
  if (cachedCatalog) return cachedCatalog;
  if (!inflightCatalog) {
    inflightCatalog = fetchCatalog().then((data) => {
      cachedCatalog = data;
      return data;
    });
  }
  return inflightCatalog;
}

export function invalidateCatalogCache() {
  cachedCatalog = null;
  inflightCatalog = null;
}

export async function getActiveCategories(): Promise<JayaramMittaiCategory[]> {
  const { categories } = await getCatalog();
  return categories;
}

export async function getActiveProducts(
  categoryId?: string,
  searchQuery?: string
): Promise<JayaramMittaiProduct[]> {
  const { products } = await getCatalog();
  let list = products;
  if (categoryId && categoryId !== 'all') {
    list = list.filter((p) => p.category_id === categoryId);
  }
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    );
  }
  return list;
}

export async function getProductById(id: string): Promise<JayaramMittaiProduct | null> {
  const { products } = await getCatalog();
  return products.find((p) => p.id === id) || null;
}
