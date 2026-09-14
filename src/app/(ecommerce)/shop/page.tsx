'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — STOREFRONT HOMEPAGE
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { EcommerceNav } from '@/components/ecommerce/layout/EcommerceNav';
import { HeroSlideshow } from '@/components/ecommerce/catalog/HeroSlideshow';
import { SpecialCombosSection } from '@/components/ecommerce/catalog/SpecialCombosSection';
import { AnimatedSearchBar } from '@/components/ecommerce/catalog/AnimatedSearchBar';
import { ProductGrid } from '@/components/ecommerce/catalog/ProductGrid';
import { BookMenuModal } from '@/components/ecommerce/catalog/BookMenuModal';
import { CustomerAuthModal } from '@/components/ecommerce/auth/CustomerAuthModal';
import { FloatingCartButton } from '@/components/ecommerce/layout/FloatingCartButton';
import { useFlyingCart, FlyingCartOverlay } from '@/components/ecommerce/catalog/FlyingCartAnimation';
import { getActiveCategories, getActiveProducts } from '@/lib/ecommerce/queries';
import { JayaramMittaiCategory, JayaramMittaiProduct } from '@/lib/ecommerce/types';
import { Sparkles, Award, ShieldCheck, Heart } from 'lucide-react';

export default function ShopPage() {
  const [categories, setCategories] = useState<JayaramMittaiCategory[]>([]);
  const [products, setProducts] = useState<JayaramMittaiProduct[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBookMenuOpen, setIsBookMenuOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const { triggerFly, flyingItems, toastMessage } = useFlyingCart();
  const shopMenuSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          getActiveCategories(),
          getActiveProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load menu data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products based on selected category & search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategoryId === 'all' || product.category_id === activeCategoryId;
    const matchesSearch =
      !searchQuery.trim() ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectCategory = (catId: string) => {
    setActiveCategoryId(catId);
    shopMenuSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen pt-[96px] md:pt-[64px]">
      {/* Persistent Fixed Brand Nav with Navigation Buttons */}
      <EcommerceNav
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim()) {
            shopMenuSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenBookMenu={() => setIsBookMenuOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Full-width Hero Video/Image Slideshow from left end to right */}
      <HeroSlideshow
        onOpenBookMenu={() => setIsBookMenuOpen(true)}
        onSelectCategory={handleSelectCategory}
      />

      {/* Featured Special Combos Section */}
      <SpecialCombosSection
        onAdd={(name, e) => triggerFly(name, e)}
      />

      {/* Menu Catalog Section */}
      <section
        ref={shopMenuSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1"
      >
        {/* Animated Search Bar & Navigation Buttons Below */}
        <AnimatedSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={setActiveCategoryId}
          totalItemsCount={filteredProducts.length}
        />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 border-b border-[#e8e4da] dark:border-[#2e2e38] pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#fe0000] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Artisanal Specialties</span>
            </div>
            <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white">
              {activeCategoryId === 'all'
                ? 'All Handcrafted Menu Items'
                : categories.find((c) => c.id === activeCategoryId)?.name || 'Specialties'}
            </h2>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing <strong className="text-gray-900 dark:text-gray-100">{filteredProducts.length}</strong> freshly prepared dishes
          </p>
        </div>

        {/* Product Grid with Flying Cart Animation */}
        <ProductGrid
          products={filteredProducts}
          isLoading={isLoading}
          onClearFilter={() => {
            setActiveCategoryId('all');
            setSearchQuery('');
          }}
          onAdd={(name, e) => triggerFly(name, e)}
        />

        {/* Our Story / Heritage Section */}
        <div id="about-story" className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-3xl bg-[#fffdfa] dark:bg-[#1e1e24] border border-[#e8e4da] dark:border-[#2e2e38] p-6 sm:p-10 shadow-sm items-center">
          <div className="lg:col-span-6 relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/images/ecommerce/story.jpeg"
              alt="Jayaram Mittai Heritage Since 1978"
              fill
              className="object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#fe0000] text-white text-[10px] font-extrabold uppercase tracking-widest">
              Since 1978
            </span>
            <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white leading-tight">
              Right From Your Grandmother's Kitchen...
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Jayaram Mittai has been Chennai's trusted sweet, savoury, and dining landmark since 1978, with famous branches in Chromepet and Nanganallur. Every sweet, snack, chaat, and North Indian delicacy is prepared with authentic quality ingredients and pure ghee, staying true to our heritage.
            </p>
            <div className="flex items-center gap-6 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <strong className="block font-serif font-bold text-xl text-[#fe0000]">1978</strong>
                <span className="text-xs text-gray-400 uppercase font-semibold">Since</span>
              </div>
              <div>
                <strong className="block font-serif font-bold text-xl text-[#fe0000]">Chromepet</strong>
                <span className="text-xs text-gray-400 uppercase font-semibold">Station Rd</span>
              </div>
              <div>
                <strong className="block font-serif font-bold text-xl text-[#fe0000]">Nanganallur</strong>
                <span className="text-xs text-gray-400 uppercase font-semibold">M.G.R. Rd</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Animated Restaurant Book Menu Modal */}
      <BookMenuModal
        isOpen={isBookMenuOpen}
        onClose={() => setIsBookMenuOpen(false)}
        onItemAdded={(name, e) => triggerFly(name, e)}
      />

      {/* Non-intrusive Customer Login / Signup Modal */}
      <CustomerAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Floating Quick Cart Button on Scroll */}
      <FloatingCartButton />

      {/* Flying to Cart Animation & Toast Overlay */}
      <FlyingCartOverlay
        flyingItems={flyingItems}
        toastMessage={toastMessage}
      />
    </div>
  );
}
