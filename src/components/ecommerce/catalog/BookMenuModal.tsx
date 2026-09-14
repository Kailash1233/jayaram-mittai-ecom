'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — RESPONSIVE REAL 3D MENU CARD
// Optimized: Full-width single-page view on mobile, dual-spread opened book on desktop
// =============================================================================

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { JayaramMittaiProduct } from '@/lib/ecommerce/types';

const BOOK_SPREADS = [
  // Spread 0: Today's Special & Index
  {
    type: 'special_index',
    left: {
      title: "Today's Chef Special",
      badge: 'HOUSE SIGNATURE',
      name: 'Royal Rasamalai & Ghee Mysore Pak Combo',
      desc: 'Rich saffron infused rasamalai paired with melt-in-mouth artisanal ghee Mysore Pak, prepared with 100% pure desi ghee.',
      price: 180,
      unit: 'combo pack',
      imageUrl: '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg',
    },
    right: {
      title: 'Menu Card Directory',
      categories: [
        { name: 'Sweets & Desserts', desc: 'Kaju Katli, Mysore Pak, Rasamalai, Basundi', targetSpread: 1, targetPage: 2, icon: '🍬', page: 'Page 3' },
        { name: 'Savouries & Snacks', desc: 'Special Mixture, Kara Sev, Samosa, Pakoda', targetSpread: 1, targetPage: 3, icon: '🥨', page: 'Page 4' },
        { name: 'Chaats & Sandwiches', desc: 'Pani Puri, Dahi Puri, Pav Bhaji, Sandwiches', targetSpread: 2, targetPage: 4, icon: '🧆', page: 'Page 5' },
        { name: 'North Indian & Rotis', desc: 'Paneer Butter Masala, Naan, Paratha', targetSpread: 2, targetPage: 5, icon: '🍲', page: 'Page 6' },
        { name: 'Rice & Biryani', desc: 'Special Biryani, Paneer Biryani, Fried Rice', targetSpread: 3, targetPage: 6, icon: '🍚', page: 'Page 7' },
        { name: 'Tandoori & Juices', desc: 'Paneer Tikka, Mushroom Tikka, Pomegranate Juice', targetSpread: 3, targetPage: 7, icon: '🍹', page: 'Page 8' },
      ],
    },
  },

  // Spread 1: Sweets & Savouries
  {
    type: 'menu_items',
    left: {
      category: 'Sweets & Desserts',
      items: [
        { id: '1', name: 'Royal Rasamalai', desc: 'Fresh spongy rasamalai in saffron milk', price: 120, unit: '2 pcs', imageUrl: '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg' },
        { id: '2', name: 'Rich Badam Basundi', desc: 'Thickened creamy almond dessert', price: 180, unit: '250g', imageUrl: '/images/food/Basundi_plated_on_white_dish_202608251905.jpeg' },
        { id: '3', name: 'Ghee Mysore Pak', desc: 'Melt-in-mouth traditional ghee pak', price: 250, unit: '250g', imageUrl: '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg' },
        { id: '4', name: 'Kaju Katli', desc: 'Cashew silver leaf diamond sweets', price: 330, unit: '250g', imageUrl: '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg' },
        { id: '5', name: 'Black Forest Slice', desc: 'Fresh cream chocolate pastry', price: 90, unit: '1 slice', imageUrl: '/images/food/Black_Forest_Cake_plated_202608251905.jpeg' },
      ],
    },
    right: {
      category: 'Savouries & Snacks',
      items: [
        { id: '6', name: 'Special Mixture', desc: 'Signature crispy mix with nuts & sev', price: 140, unit: '250g', imageUrl: '/images/ecommerce/snacks.jpeg' },
        { id: '7', name: 'Madras Mixture', desc: 'Spicy South Indian crunchy mixture', price: 120, unit: '250g', imageUrl: '/images/ecommerce/snacks.jpeg' },
        { id: '8', name: 'Kara Sev Pepper', desc: 'Crispy black pepper infused sev', price: 125, unit: '250g', imageUrl: '/images/ecommerce/snacks.jpeg' },
        { id: '9', name: 'Ribbon Pakoda', desc: 'Golden crispy ribbon snack', price: 120, unit: '250g', imageUrl: '/images/ecommerce/snacks.jpeg' },
        { id: '10', name: 'Hot Samosa', desc: 'Crispy spiced potato samosa', price: 30, unit: '1 pc', imageUrl: '/images/ecommerce/snacks.jpeg' },
      ],
    },
  },

  // Spread 2: Chaats & North Indian
  {
    type: 'menu_items',
    left: {
      category: 'Chaats & Sandwiches',
      items: [
        { id: '11', name: 'Pani Puri', desc: 'Crisp puris with spicy mint water', price: 50, unit: '6 pcs', imageUrl: '/images/ecommerce/snacks.jpeg' },
        { id: '12', name: 'Dahi Puri', desc: 'Puris topped with sweet curd & sev', price: 90, unit: '5 pcs', imageUrl: '/images/ecommerce/snacks.jpeg' },
        { id: '13', name: 'Pav Bhaji', desc: 'Buttery pav with spiced potato bhaji', price: 120, unit: '2 pav', imageUrl: '/images/food/Chapathi_with_gravy_plated_202608251905.jpeg' },
        { id: '14', name: 'Samosa Chaat', desc: 'Crushed samosa layered with chana', price: 90, unit: '1 plate', imageUrl: '/images/ecommerce/snacks.jpeg' },
        { id: '15', name: 'Veg Cheese Sandwich', desc: 'Grilled vegetables with melted cheese', price: 85, unit: '1 pc', imageUrl: '/images/ecommerce/snacks.jpeg' },
      ],
    },
    right: {
      category: 'North Indian & Rotis',
      items: [
        { id: '16', name: 'Tandoori Butter Naan', desc: 'Soft naan brushed with pure butter', price: 65, unit: '1 pc', imageUrl: '/images/food/Butter_Naan_on_dish_202608251905.jpeg' },
        { id: '17', name: 'Garlic Naan', desc: 'Clay oven naan topped with garlic', price: 75, unit: '1 pc', imageUrl: '/images/food/Garlic_Naan_plated_on_dish_202608251905.jpeg' },
        { id: '18', name: 'Amritsari Paneer Paratha', desc: 'Stuffed paneer paratha with curd', price: 130, unit: '1 pc', imageUrl: '/images/food/Paneer_paratha_on_a_plate_202608251905.jpeg' },
        { id: '19', name: 'Classic Aloo Paratha', desc: 'Mashed potato paratha with pickle', price: 110, unit: '1 pc', imageUrl: '/images/food/Aloo_Paratha_on_plate_202608251905.jpeg' },
        { id: '20', name: 'Butter Phulka', desc: 'Puffed wheat flatbread with butter', price: 40, unit: '2 pcs', imageUrl: '/images/food/Butter_phulka_on_plate_202608251905.jpeg' },
      ],
    },
  },

  // Spread 3: Rice, Tandoori & Drinks
  {
    type: 'menu_items',
    left: {
      category: 'Rice & Biryani',
      items: [
        { id: '21', name: 'Paneer Fried Rice', desc: 'Wok tossed basmati rice with paneer', price: 210, unit: '500g', imageUrl: '/images/food/Paneer_fried_rice_in_bowl_202608251905.jpeg' },
        { id: '22', name: 'Veg Schezwan Fried Rice', desc: 'Fiery wok rice with vegetables', price: 190, unit: '500g', imageUrl: '/images/food/Veg_Schezwan_Fried_Rice_bowl_202608251905.jpeg' },
        { id: '23', name: 'Mushroom Fried Rice', desc: 'Fragrant fried rice with mushrooms', price: 200, unit: '500g', imageUrl: '/images/food/Mushroom_fried_rice_in_bowl_202608251905.jpeg' },
        { id: '24', name: 'Steamed Rice', desc: 'Fluffy white steamed basmati rice', price: 90, unit: '1 bowl', imageUrl: '/images/food/Steamed_rice_on_plate_202608251905.jpeg' },
      ],
    },
    right: {
      category: 'Tandoori Starters & Juices',
      items: [
        { id: '25', name: 'Tandoori Paneer Tikka', desc: 'Chargrilled cottage cheese tikka', price: 260, unit: '6 pcs', imageUrl: '/images/food/Paneer_tikka_on_white_dish_202608251905.jpeg' },
        { id: '26', name: 'Mushroom Tikka', desc: 'Spiced roasted tandoor mushrooms', price: 240, unit: '6 pcs', imageUrl: '/images/food/Mushroom_tikka_on_white_dish_202608251905.jpeg' },
        { id: '27', name: 'Fresh Pomegranate Juice', desc: 'Cold pressed ruby pomegranate juice', price: 110, unit: '300 ml', imageUrl: '/images/food/Pomegranate_juice_in_glass_202608251905.jpeg' },
        { id: '28', name: 'Kesari Badam Milk', desc: 'Chilled rich saffron almond milk', price: 90, unit: '300 ml', imageUrl: '/images/food/Badam_milk_in_glass_202608251905.jpeg' },
        { id: '29', name: 'Signature Rose Milk', desc: 'Fragrant chilled rose syrup milk', price: 80, unit: '300 ml', imageUrl: '/images/food/Rose_milk_in_glass_202608251905.jpeg' },
      ],
    },
  },
];

// Flat individual pages array for mobile view (8 pages total)
const ALL_PAGES = [
  { type: 'special', data: BOOK_SPREADS[0].left },
  { type: 'index', data: BOOK_SPREADS[0].right },
  { type: 'items', data: BOOK_SPREADS[1].left },
  { type: 'items', data: BOOK_SPREADS[1].right },
  { type: 'items', data: BOOK_SPREADS[2].left },
  { type: 'items', data: BOOK_SPREADS[2].right },
  { type: 'items', data: BOOK_SPREADS[3].left },
  { type: 'items', data: BOOK_SPREADS[3].right },
];

interface BookMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: (itemName: string, event: React.MouseEvent) => void;
}

export function BookMenuModal({ isOpen, onClose, onItemAdded }: BookMenuModalProps) {
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [mobilePageIndex, setMobilePageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const { addItem, itemCount, calculation, openDrawer } = useCart();

  if (!isOpen) return null;

  const totalSpreads = BOOK_SPREADS.length;
  const totalPages = ALL_PAGES.length;
  const currentSpread = BOOK_SPREADS[currentSpreadIndex];

  // Desktop Next Spread
  const handleDesktopNext = () => {
    if (currentSpreadIndex < totalSpreads - 1 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('next');
      setTimeout(() => {
        setCurrentSpreadIndex((prev) => prev + 1);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 550);
    }
  };

  // Desktop Prev Spread
  const handleDesktopPrev = () => {
    if (currentSpreadIndex > 0 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('prev');
      setTimeout(() => {
        setCurrentSpreadIndex((prev) => prev - 1);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 550);
    }
  };

  // Mobile Next Page
  const handleMobileNext = () => {
    if (mobilePageIndex < totalPages - 1 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('next');
      setTimeout(() => {
        setMobilePageIndex((prev) => prev + 1);
        setCurrentSpreadIndex(Math.floor((mobilePageIndex + 1) / 2));
        setIsFlipping(false);
        setFlipDirection(null);
      }, 400);
    }
  };

  // Mobile Prev Page
  const handleMobilePrev = () => {
    if (mobilePageIndex > 0 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('prev');
      setTimeout(() => {
        setMobilePageIndex((prev) => prev - 1);
        setCurrentSpreadIndex(Math.floor((mobilePageIndex - 1) / 2));
        setIsFlipping(false);
        setFlipDirection(null);
      }, 400);
    }
  };

  const handleJumpToCategory = (targetSpread: number, targetPage: number) => {
    if (isFlipping) return;
    setIsFlipping(true);
    setFlipDirection('next');
    setTimeout(() => {
      setCurrentSpreadIndex(targetSpread);
      setMobilePageIndex(targetPage);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 450);
  };

  const handleAddBookItem = (item: any, e: React.MouseEvent) => {
    const product: JayaramMittaiProduct = {
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      description: item.desc || null,
      category_id: 'book_item',
      image_url: item.imageUrl,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addItem(product, 1);
    if (onItemAdded) {
      onItemAdded(item.name, e);
    }
  };

  const renderLeftPageContent = (spread: typeof BOOK_SPREADS[0]) => {
    if (spread.type === 'special_index') {
      const special = spread.left as any;
      return (
        <div className="h-full flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#fe0000] bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-full inline-block">
              {special.badge}
            </span>
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white leading-tight mt-1.5">
              {special.name}
            </h3>
          </div>

          <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden bg-gray-100 shadow-md border border-amber-200/60">
            <Image src={special.imageUrl} alt={special.name} fill className="object-cover" />
          </div>

          <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
            {special.desc}
          </p>

          <div className="flex items-center justify-between pt-2.5 border-t border-amber-300/60 dark:border-gray-800">
            <div>
              <span className="text-lg font-extrabold text-[#fe0000]">₹{special.price}</span>
              <span className="text-xs text-gray-500"> / {special.unit}</span>
            </div>
            <button
              onClick={(e) => handleAddBookItem(special, e)}
              className="px-4 py-1.5 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Special</span>
            </button>
          </div>
        </div>
      );
    }

    const leftData = spread.left as any;
    return (
      <div className="space-y-3">
        <h4 className="font-serif font-bold text-sm sm:text-base text-[#fe0000] border-b-2 border-red-200 dark:border-red-950 pb-1 flex items-center justify-between">
          <span>{leftData.category}</span>
        </h4>
        <div className="space-y-2">
          {leftData.items?.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-red-50/70 dark:hover:bg-red-950/30 border-b border-amber-200/40 dark:border-gray-800/40 last:border-0 transition-colors"
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-amber-200/50">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-serif font-bold text-xs truncate text-gray-900 dark:text-gray-100">
                  {item.name}
                </h5>
                <p className="text-[10px] text-gray-500 truncate">{item.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-[#fe0000] block">₹{item.price}</span>
                <button
                  onClick={(e) => handleAddBookItem(item, e)}
                  className="px-2 py-0.5 mt-0.5 rounded-md bg-[#fe0000] text-white text-[10px] font-bold hover:bg-[#cc0000] transition-transform hover:scale-105 active:scale-95"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRightPageContent = (spread: typeof BOOK_SPREADS[0]) => {
    if (spread.type === 'special_index') {
      const index = spread.right as any;
      return (
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm sm:text-base text-[#fe0000] border-b-2 border-red-200 dark:border-red-950 pb-1">
            {index.title}
          </h4>
          <div className="space-y-2">
            {index.categories?.map((cat: any, idx: number) => (
              <div
                key={idx}
                onClick={() => handleJumpToCategory(cat.targetSpread, cat.targetPage || (cat.targetSpread * 2))}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#25252d] border border-amber-200/70 dark:border-gray-700/60 hover:border-[#fe0000] hover:bg-[#fff0f0] cursor-pointer transition-all hover:translate-x-1 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <div>
                    <span className="font-serif font-bold text-xs text-gray-900 dark:text-gray-100 block">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-gray-400 block line-clamp-1">
                      {cat.desc}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#fe0000] shrink-0">
                  {cat.page} →
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const rightData = spread.right as any;
    return (
      <div className="space-y-3">
        <h4 className="font-serif font-bold text-sm sm:text-base text-[#fe0000] border-b-2 border-red-200 dark:border-red-950 pb-1 flex items-center justify-between">
          <span>{rightData.category}</span>
        </h4>
        <div className="space-y-2">
          {rightData.items?.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-red-50/70 dark:hover:bg-red-950/30 border-b border-amber-200/40 dark:border-gray-800/40 last:border-0 transition-colors"
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-amber-200/50">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-serif font-bold text-xs truncate text-gray-900 dark:text-gray-100">
                  {item.name}
                </h5>
                <p className="text-[10px] text-gray-500 truncate">{item.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-[#fe0000] block">₹{item.price}</span>
                <button
                  onClick={(e) => handleAddBookItem(item, e)}
                  className="px-2 py-0.5 mt-0.5 rounded-md bg-[#fe0000] text-white text-[10px] font-bold hover:bg-[#cc0000] transition-transform hover:scale-105 active:scale-95"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSingleMobilePage = (pageIdx: number) => {
    const pageObj = ALL_PAGES[pageIdx];
    if (!pageObj) return null;

    if (pageObj.type === 'special') {
      const special = pageObj.data as any;
      return (
        <div className="h-full flex flex-col justify-between space-y-3 p-1">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#fe0000] bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-full inline-block">
              {special.badge}
            </span>
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white leading-tight mt-1.5">
              {special.name}
            </h3>
          </div>

          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-100 shadow-md border border-amber-200/60">
            <Image src={special.imageUrl} alt={special.name} fill className="object-cover" />
          </div>

          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            {special.desc}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-amber-300/60 dark:border-gray-800">
            <div>
              <span className="text-lg font-extrabold text-[#fe0000]">₹{special.price}</span>
              <span className="text-xs text-gray-500"> / {special.unit}</span>
            </div>
            <button
              onClick={(e) => handleAddBookItem(special, e)}
              className="px-4 py-2 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Special</span>
            </button>
          </div>
        </div>
      );
    }

    if (pageObj.type === 'index') {
      const index = pageObj.data as any;
      return (
        <div className="space-y-3 p-1">
          <h4 className="font-serif font-bold text-base text-[#fe0000] border-b-2 border-red-200 dark:border-red-950 pb-1">
            {index.title}
          </h4>
          <div className="space-y-2">
            {index.categories?.map((cat: any, idx: number) => (
              <div
                key={idx}
                onClick={() => handleJumpToCategory(cat.targetSpread, cat.targetPage || (cat.targetSpread * 2))}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#25252d] border border-amber-200/70 dark:border-gray-700/60 hover:border-[#fe0000] hover:bg-[#fff0f0] cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <span className="font-serif font-bold text-xs text-gray-900 dark:text-gray-100 block">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-gray-400 block line-clamp-1">
                      {cat.desc}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#fe0000] shrink-0">
                  {cat.page} →
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const itemsData = pageObj.data as any;
    return (
      <div className="space-y-3 p-1">
        <h4 className="font-serif font-bold text-base text-[#fe0000] border-b-2 border-red-200 dark:border-red-950 pb-1 flex items-center justify-between">
          <span>{itemsData.category}</span>
        </h4>
        <div className="space-y-2.5">
          {itemsData.items?.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-red-50/70 dark:hover:bg-red-950/30 border-b border-amber-200/40 dark:border-gray-800/40 last:border-0 transition-colors"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-amber-200/50">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-serif font-bold text-xs truncate text-gray-900 dark:text-gray-100">
                  {item.name}
                </h5>
                <p className="text-[10px] text-gray-500 line-clamp-1">{item.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-[#fe0000] block mb-1">₹{item.price}</span>
                <button
                  onClick={(e) => handleAddBookItem(item, e)}
                  className="px-3 py-1 rounded-md bg-[#fe0000] text-white text-[11px] font-bold hover:bg-[#cc0000] transition-transform hover:scale-105 active:scale-95"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Book Window Container */}
      <div className="relative z-10 w-full max-w-5xl max-h-[94vh] bg-[#fffdfa] dark:bg-[#1e1e24] rounded-3xl overflow-hidden shadow-2xl border border-[#e8e4da] dark:border-[#2e2e38] flex flex-col">
        {/* Book Header Bar */}
        <div className="bg-[#fe0000] text-white px-4 sm:px-5 py-3.5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center shadow-sm shrink-0">
              <Image src="/logo.png" alt="Jayaram Mittai" width={28} height={28} className="object-contain" />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-sm sm:text-base text-white">Menu Card</h3>
              <p className="text-[9px] sm:text-[10px] text-white/80 uppercase tracking-widest font-semibold">Since 1978</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Page Badge */}
            <span className="hidden md:inline-block px-3.5 py-1 rounded-full bg-white/20 text-white font-bold text-xs shadow-inner">
              Pages {currentSpreadIndex * 2 + 1}-{currentSpreadIndex * 2 + 2} of {totalSpreads * 2}
            </span>

            {/* Mobile Page Badge */}
            <span className="md:hidden px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs shadow-inner">
              Page {mobilePageIndex + 1} of {totalPages}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              aria-label="Close Menu Card"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP VIEW (MD+): DUAL SPREAD 3D REAL BOOK */}
        {/* ========================================================================= */}
        <div
          className="hidden md:flex relative flex-1 p-6 sm:p-8 bg-[#121214] items-center justify-center overflow-hidden min-h-[500px]"
          style={{ perspective: '2600px' }}
        >
          {/* Arrow Left */}
          <button
            onClick={handleDesktopPrev}
            disabled={currentSpreadIndex === 0 || isFlipping}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/95 dark:bg-gray-800 text-[#fe0000] shadow-2xl flex items-center justify-center hover:scale-110 disabled:opacity-20 disabled:scale-100 transition-all cursor-pointer disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* Arrow Right */}
          <button
            onClick={handleDesktopNext}
            disabled={currentSpreadIndex === totalSpreads - 1 || isFlipping}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/95 dark:bg-gray-800 text-[#fe0000] shadow-2xl flex items-center justify-center hover:scale-110 disabled:opacity-20 disabled:scale-100 transition-all cursor-pointer disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
            aria-label="Next Page"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* 3D Realistic Hardcover Book Layout */}
          <div
            className="w-full max-w-4xl h-[480px] sm:h-[520px] rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] border-4 border-amber-950/40 flex relative bg-[#f9f4ec] dark:bg-[#1a1a1e]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Center Spine Groove & Depth Shadow */}
            <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-black/35 via-black/10 to-black/35 pointer-events-none z-30 shadow-inner" />
            <div className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-amber-400/50 pointer-events-none z-30" />

            {/* Static Left Base Page */}
            <div
              className="w-1/2 h-full p-4 sm:p-6 overflow-y-auto border-r border-amber-300/40 dark:border-gray-800/80 bg-gradient-to-r from-[#f5eedf] via-[#fffdfa] to-[#f2e9d8] dark:from-[#18181c] dark:via-[#1e1e24] dark:to-[#16161a]"
              style={{
                boxShadow: 'inset -25px 0 35px rgba(0,0,0,0.06)',
                borderRadius: '12px 0 0 12px',
              }}
            >
              {renderLeftPageContent(currentSpread)}
            </div>

            {/* Static Right Base Page */}
            <div
              className="w-1/2 h-full p-4 sm:p-6 overflow-y-auto bg-gradient-to-l from-[#f5eedf] via-[#fffdfa] to-[#f2e9d8] dark:from-[#18181c] dark:via-[#1e1e24] dark:to-[#16161a]"
              style={{
                boxShadow: 'inset 25px 0 35px rgba(0,0,0,0.06)',
                borderRadius: '0 12px 12px 0',
              }}
            >
              {renderRightPageContent(currentSpread)}
            </div>

            {/* Dynamic Physical 3D Turning Leaf Animation */}
            {isFlipping && flipDirection === 'next' && currentSpreadIndex < totalSpreads - 1 && (
              <div
                className="absolute right-0 top-0 w-1/2 h-full z-30 pointer-events-none origin-left"
                style={{
                  transformStyle: 'preserve-3d',
                  animation: 'flipNextSheetAnim 0.55s cubic-bezier(0.645, 0.045, 0.355, 1) forwards',
                }}
              >
                <div
                  className="absolute inset-0 p-4 sm:p-6 overflow-hidden bg-gradient-to-l from-[#f5eedf] via-[#fffdfa] to-[#f2e9d8] dark:from-[#18181c] dark:to-[#16161a] border-l border-amber-200/50 shadow-2xl"
                  style={{ backfaceVisibility: 'hidden', borderRadius: '0 12px 12px 0' }}
                >
                  {renderRightPageContent(currentSpread)}
                </div>
                <div
                  className="absolute inset-0 p-4 sm:p-6 overflow-hidden bg-gradient-to-r from-[#f5eedf] via-[#fffdfa] to-[#f2e9d8] dark:from-[#18181c] dark:to-[#16161a] border-r border-amber-200/50 shadow-2xl"
                  style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', borderRadius: '12px 0 0 12px' }}
                >
                  {renderLeftPageContent(BOOK_SPREADS[currentSpreadIndex + 1])}
                </div>
              </div>
            )}

            {isFlipping && flipDirection === 'prev' && currentSpreadIndex > 0 && (
              <div
                className="absolute left-0 top-0 w-1/2 h-full z-30 pointer-events-none origin-right"
                style={{
                  transformStyle: 'preserve-3d',
                  animation: 'flipPrevSheetAnim 0.55s cubic-bezier(0.645, 0.045, 0.355, 1) forwards',
                }}
              >
                <div
                  className="absolute inset-0 p-4 sm:p-6 overflow-hidden bg-gradient-to-r from-[#f5eedf] via-[#fffdfa] to-[#f2e9d8] dark:from-[#18181c] dark:to-[#16161a] border-r border-amber-200/50 shadow-2xl"
                  style={{ backfaceVisibility: 'hidden', borderRadius: '12px 0 0 12px' }}
                >
                  {renderLeftPageContent(currentSpread)}
                </div>
                <div
                  className="absolute inset-0 p-4 sm:p-6 overflow-hidden bg-gradient-to-l from-[#f5eedf] via-[#fffdfa] to-[#f2e9d8] dark:from-[#18181c] dark:to-[#16161a] border-l border-amber-200/50 shadow-2xl"
                  style={{ transform: 'rotateY(-180deg)', backfaceVisibility: 'hidden', borderRadius: '0 12px 12px 0' }}
                >
                  {renderRightPageContent(BOOK_SPREADS[currentSpreadIndex - 1])}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE PHONE VIEW (<MD): FULL-WIDTH SINGLE PAGE EXPERIENCE */}
        {/* ========================================================================= */}
        <div className="md:hidden relative flex-1 p-3 bg-[#121214] flex flex-col justify-center overflow-hidden min-h-[460px]">
          {/* Mobile Single Page Container */}
          <div
            className="w-full h-[450px] rounded-2xl shadow-2xl border-2 border-amber-950/40 bg-gradient-to-br from-[#f5eedf] via-[#fffdfa] to-[#f2e9d8] dark:from-[#18181c] dark:via-[#1e1e24] dark:to-[#16161a] p-4 overflow-y-auto relative"
            style={{
              boxShadow: '0 15px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.05)',
            }}
          >
            {renderSingleMobilePage(mobilePageIndex)}
          </div>

          {/* Mobile Flip Navigation Controls */}
          <div className="flex items-center justify-between pt-3 px-2">
            <button
              onClick={handleMobilePrev}
              disabled={mobilePageIndex === 0 || isFlipping}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/95 text-[#fe0000] font-bold text-xs shadow-lg disabled:opacity-20 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Page</span>
            </button>

            <span className="text-xs font-bold text-white/80">
              {mobilePageIndex + 1} / {totalPages}
            </span>

            <button
              onClick={handleMobileNext}
              disabled={mobilePageIndex === totalPages - 1 || isFlipping}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/95 text-[#fe0000] font-bold text-xs shadow-lg disabled:opacity-20 active:scale-95 transition-all"
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Navigation Bar with Cart Option */}
        <div className="px-4 sm:px-6 py-3 bg-[#f8f6f0] dark:bg-[#18181c] border-t border-[#e8e4da] dark:border-[#2e2e38] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="text-gray-500 hidden sm:block">
            <span>Tip: Click any directory section on the index page to jump straight to that menu section.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              Close Menu Card
            </button>

            <button
              id="book-menu-cart-btn"
              onClick={() => {
                onClose();
                openDrawer();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {itemCount > 0
                  ? `View Cart (${itemCount} items • ₹${calculation.total.toFixed(0)}) →`
                  : 'Open Cart'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded CSS for 3D Page Turn Keyframes */}
      <style jsx global>{`
        @keyframes flipNextSheetAnim {
          0% {
            transform: rotateY(0deg);
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
          }
          50% {
            box-shadow: -20px 20px 50px rgba(0,0,0,0.5);
          }
          100% {
            transform: rotateY(-180deg);
            box-shadow: -5px 5px 25px rgba(0,0,0,0.2);
          }
        }

        @keyframes flipPrevSheetAnim {
          0% {
            transform: rotateY(0deg);
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
          }
          50% {
            box-shadow: 20px 20px 50px rgba(0,0,0,0.5);
          }
          100% {
            transform: rotateY(180deg);
            box-shadow: 5px 5px 25px rgba(0,0,0,0.2);
          }
        }
      `}</style>
    </div>
  );
}
