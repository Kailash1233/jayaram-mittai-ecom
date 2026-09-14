'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — ANIMATED SEARCH & FLOATING CATEGORY NAV
// =============================================================================

import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, Utensils, Flame, Coffee, Gift } from 'lucide-react';
import { JayaramMittaiCategory } from '@/lib/ecommerce/types';

interface AnimatedSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: JayaramMittaiCategory[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  totalItemsCount: number;
}

export function AnimatedSearchBar({
  searchQuery,
  onSearchChange,
  categories,
  activeCategoryId,
  onSelectCategory,
  totalItemsCount,
}: AnimatedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const placeholders = [
    'Search Kaju Katli, Mysore Pak, Rasamalai...',
    'Search Tandoori Paneer Tikka, Naan...',
    'Search Special Mixture, Kara Sev, Samosa...',
    'Search Fresh Juices, Badam Milk, Lassi...',
    'Search Fried Rice, Biryani, Combos...',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [placeholders.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allCategories: Array<{ id: string; name: string }> = [
    { id: 'all', name: 'All Specialties' },
    ...categories,
  ];

  return (
    <div id="shop-menu" className="w-full space-y-4 pt-8 pb-4">
      {/* Animated Search Bar Container */}
      <div className="max-w-2xl mx-auto px-2">
        <div
          className={`relative flex items-center rounded-2xl bg-white dark:bg-[#1e1e24] border-2 transition-all duration-300 shadow-sm ${
            isFocused
              ? 'border-[#fe0000] ring-4 ring-red-500/15 shadow-lg shadow-red-500/10 scale-[1.01]'
              : 'border-[#e8e4da] dark:border-[#2e2e38] hover:border-[#fcd4d4]'
          }`}
        >
          {/* Animated Search Icon */}
          <div className="pl-4 pr-2 text-[#fe0000] flex items-center justify-center">
            <Search className={`w-5 h-5 transition-transform duration-300 ${isFocused ? 'scale-110' : ''}`} />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholders[placeholderIndex]}
            className="w-full py-3.5 pr-4 text-sm font-medium bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none transition-all"
          />

          {/* Clear search button */}
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1.5 mr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Navigation Buttons Below Search Bar */}
      <div
        className={`sticky top-16 z-30 transition-all duration-300 py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 ${
          isScrolled
            ? 'bg-[#f8f6f0]/90 dark:bg-[#121214]/90 backdrop-blur-md shadow-md border-b border-[#e8e4da]/80 dark:border-[#2e2e38]/80'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-start sm:justify-center gap-2.5 min-w-max px-2">
            {allCategories.map((cat) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center gap-2 select-none ${
                    isActive
                      ? 'bg-[#fe0000] text-white shadow-md shadow-red-500/30 scale-105'
                      : 'bg-[#fffdfa] dark:bg-[#1e1e24] text-gray-700 dark:text-gray-300 border border-[#e8e4da] dark:border-[#2e2e38] hover:border-[#fe0000] hover:text-[#fe0000] dark:hover:text-[#fe0000]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
