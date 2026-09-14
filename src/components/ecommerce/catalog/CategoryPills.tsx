'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — CATEGORY PILL FILTER
// Reference: Section 0 (UI patterns: rounded 100px pills turning solid red)
// =============================================================================

import React from 'react';
import { JayaramMittaiCategory } from '@/lib/ecommerce/types';
import { Sparkles, Utensils, Coffee, Flame, FlameKindling, Gift } from 'lucide-react';

interface CategoryPillsProps {
  categories: JayaramMittaiCategory[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryPills({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryPillsProps) {
  const allCategories: Array<{ id: string; name: string }> = [
    { id: 'all', name: 'All Specialties' },
    ...categories,
  ];

  return (
    <div className="w-full py-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2.5 min-w-max px-1">
        {allCategories.map((category) => {
          const isActive = activeCategoryId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center gap-2 select-none ${
                isActive
                  ? 'bg-[#fe0000] text-white shadow-md shadow-red-500/30 scale-105'
                  : 'bg-[#fffdfa] dark:bg-[#1e1e24] text-gray-700 dark:text-gray-300 border border-[#e8e4da] dark:border-[#2e2e38] hover:border-[#fe0000] hover:text-[#fe0000] dark:hover:text-[#fe0000]'
              }`}
            >
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
