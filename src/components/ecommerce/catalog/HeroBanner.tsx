'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — HERO BANNER
// Reference: Section 0 (Brand Tokens & Typography) of "e commerce - master.md"
// =============================================================================

import React from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function HeroBanner({ onExploreClick }: { onExploreClick?: () => void }) {
  const { calculation } = useCart();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fff0f0] via-[#fcfbfa] to-[#f8f6f0] dark:from-[#1a1a1e] dark:via-[#16161a] dark:to-[#121214] py-10 sm:py-16 border-b border-[#e8e4da] dark:border-[#2e2e38]">
      {/* Decorative Brand Accent circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffe6e6] dark:bg-red-950/40 border border-[#fcd4d4] dark:border-red-900/50 text-[#fe0000] text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#fe0000]" />
              <span>Pure Ghee & Traditional Recipes Since 1978</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-white leading-[1.08] tracking-tight">
              Cherished Taste of Tradition,{' '}
              <span className="text-[#fe0000]">Delivered Fresh</span> to Your Doorstep.
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Handcrafted South Indian sweets, authentic savoury snacks, sizzling tikkas, and cold-pressed juices prepared fresh daily in Chennai.
            </p>

            {/* Features Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#76e000]" />
                <span>100% Pure Vegetarian</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-[#fe0000]" />
                <span>Standard Delivery (2-4 Hours)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-amber-500 font-bold">★ 4.9</span>
                <span>Trusted by 50,000+ Families</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700">
                🚀 Free Delivery on orders over <span className="font-bold text-[#fe0000]">₹1,000</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 bg-[#f9f4ec] dark:bg-[#1e1e24] group">
              <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                <Image
                  src="/images/ecommerce/Festive Combo.jpeg"
                  alt="Jayaram Mittai Festive Collection"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#fe0000] text-[10px] font-bold uppercase tracking-wider mb-1">
                    Signature Gift Box
                  </span>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Grand Festive Celebration Box
                  </h3>
                  <p className="text-xs text-white/90 line-clamp-1">
                    Assorted Pure Ghee Sweets & Crispy Savouries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
