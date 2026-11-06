'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — PRODUCT DETAIL PAGE
// =============================================================================

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Minus, Plus, ShieldCheck } from 'lucide-react';
import { EcommerceNav } from '@/components/ecommerce/layout/EcommerceNav';
import { ProductGrid } from '@/components/ecommerce/catalog/ProductGrid';
import { getActiveCategories, getActiveProducts, getProductById } from '@/lib/ecommerce/queries';
import { JayaramMittaiProduct } from '@/lib/ecommerce/types';
import { evaluateProductAvailability } from '@/lib/ecommerce/calculations';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const FALLBACK_IMAGE = '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { items, addItem, updateQuantity } = useCart();
  const { openAuthModal } = useAuth();

  const [product, setProduct] = useState<JayaramMittaiProduct | null | undefined>(undefined);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [related, setRelated] = useState<JayaramMittaiProduct[]>([]);
  const [others, setOthers] = useState<JayaramMittaiProduct[]>([]);
  const [imgSrc, setImgSrc] = useState(FALLBACK_IMAGE);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const found = await getProductById(params.id);
      if (cancelled) return;
      setProduct(found);
      if (!found) return;
      setImgSrc(found.image_url || FALLBACK_IMAGE);

      const [categories, sameCategory, everything] = await Promise.all([
        getActiveCategories(),
        getActiveProducts(found.category_id ?? undefined),
        getActiveProducts(),
      ]);
      if (cancelled) return;

      setCategoryName(categories.find((c) => c.id === found.category_id)?.name ?? null);
      setRelated(sameCategory.filter((p) => p.id !== found.id).slice(0, 8));
      setOthers(
        everything
          .filter((p) => p.category_id !== found.category_id && p.id !== found.id)
          .slice(0, 8),
      );
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (product === undefined) {
    return (
      <div className="min-h-screen pt-[96px] md:pt-[104px] flex items-center justify-center text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen pt-[96px] md:pt-[104px] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="font-serif font-bold text-2xl text-gray-900 dark:text-white">Item not found</h1>
        <p className="text-sm text-gray-500">This item may have been removed from the menu.</p>
        <Link href="/shop" className="px-5 py-2.5 rounded-full bg-[#fe0000] text-white text-sm font-bold">
          Back to Menu
        </Link>
      </div>
    );
  }

  const availability = evaluateProductAvailability(product);
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="min-h-screen pt-[96px] md:pt-[104px] pb-16">
      <EcommerceNav onOpenAuth={openAuthModal} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-[#f9f4ec] dark:bg-[#25252d]">
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              className={`object-cover ${!availability.isAvailable ? 'grayscale opacity-70' : ''}`}
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={() => setImgSrc(FALLBACK_IMAGE)}
              priority
            />
            {!availability.isAvailable && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 text-center">
                <div className="bg-white/95 dark:bg-gray-900/95 px-4 py-2 rounded-2xl shadow-lg border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#fe0000] shrink-0" />
                  <span className="text-sm font-bold text-[#fe0000]">{availability.customMessage || 'Unavailable'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {categoryName && (
              <Link
                href="/shop"
                className="text-xs font-bold text-[#fe0000] uppercase tracking-wider mb-1 hover:underline w-fit"
              >
                {categoryName}
              </Link>
            )}
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white">
              {product.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
              {product.description || 'Authentic traditional recipe prepared with fresh ingredients.'}
            </p>

            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#fe0000]">₹{product.price}</span>
              {product.unit && <span className="text-sm text-gray-500">/ {product.unit}</span>}
            </div>

            <div className="mt-5">
              {!availability.isAvailable ? (
                <span className="inline-block text-sm font-bold text-gray-400 px-5 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-not-allowed">
                  Sold Out
                </span>
              ) : quantity === 0 ? (
                <button
                  onClick={() => addItem(product, 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-sm shadow-md shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add to Cart
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-[#fff0f0] dark:bg-red-950/40 border border-[#fcd4d4] dark:border-red-900/50 px-3 py-2 rounded-xl text-[#fe0000] font-bold w-fit">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="p-1 hover:bg-[#ffe6e6] dark:hover:bg-red-900/60 rounded-full transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-extrabold w-5 text-center">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="p-1 hover:bg-[#ffe6e6] dark:hover:bg-red-900/60 rounded-full transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <ShieldCheck className="w-4 h-4 text-[#0f7a42] shrink-0" />
              <span>100% Pure Vegetarian · Prepared fresh daily at our Chromepet &amp; Nanganallur kitchens</span>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-gray-900 dark:text-white mb-2 border-b border-[#e8e4da] dark:border-[#2e2e38] pb-3">
              More from {categoryName ?? 'this category'}
            </h2>
            <ProductGrid products={related} />
          </section>
        )}

        {others.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-gray-900 dark:text-white mb-2 border-b border-[#e8e4da] dark:border-[#2e2e38] pb-3">
              You might also like
            </h2>
            <ProductGrid products={others} />
          </section>
        )}
      </div>
    </div>
  );
}
