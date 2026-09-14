'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — SPECIAL COMBOS FEATURED SECTION
// Sourced from ECommerce.html reference
// =============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Gift, Users, Plus, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { JayaramMittaiProduct } from '@/lib/ecommerce/types';

interface SpecialCombosSectionProps {
  onAdd?: (productName: string, event: React.MouseEvent) => void;
}

export function SpecialCombosSection({ onAdd }: SpecialCombosSectionProps) {
  const [selectedPack, setSelectedPack] = useState<'gift' | 'family'>('gift');
  const { addItem } = useCart();

  const comboDetails = {
    gift: {
      id: 'special-navaratri-gift-pack',
      title: 'Jayaram Special Navaratri Combo (Gift Pack)',
      badge: 'ROYAL GIFT PACK',
      kicker: 'Grand Celebration Box',
      price: 499,
      unit: '1 kg Combo Pack',
      img: '/images/ecommerce/n combo2.jpeg',
      desc: 'Our flagship royal gift box loaded with handcrafted Kaju Katli, Ghee Mysore Pak, Special Mixture, Kara Sev, and crisp savory delights. Prepared with 100% pure ghee and packed in a premium festive gift box.',
      items: [
        '✨ Premium Kaju Katli & Pure Ghee Mysore Pak',
        '✨ Signature Special Mixture & Crunchy Kara Sev',
        '✨ Elegant festive gift packaging, ideal for corporate & family gifting',
      ],
      note: '📌 Designed for royal festive gifting, corporate clients, and relatives. Custom bulk corporate gift branding available.',
    },
    family: {
      id: 'special-navaratri-family-pack',
      title: 'Jayaram Special Navaratri Combo (Family Pack)',
      badge: 'FAMILY VALUE PACK',
      kicker: 'Family Celebration Assortment',
      price: 499,
      unit: '1 kg Combo Pack',
      img: '/images/ecommerce/N combo.jpeg',
      desc: 'Grand family celebration pack loaded with pure ghee sweets, spicy mixture, ribbon pakoda, and crunchy savouries specially proportioned for sharing during get-togethers.',
      items: [
        '👨‍👩‍👧‍👦 Assorted Pure Ghee Laddus & Mysore Pak',
        '👨‍👩‍👧‍👦 Madras Mixture, Ribbon Pakoda & Kara Sev',
        '👨‍👩‍👧‍👦 Airtight tamper-evident family freshness containers',
      ],
      note: '📌 Ideal for weekend family treats, pooja celebrations, and festive get-togethers at home.',
    },
  };

  const current = comboDetails[selectedPack];

  const handleAddCombo = (e: React.MouseEvent) => {
    const product: JayaramMittaiProduct = {
      id: current.id,
      name: current.title,
      price: current.price,
      unit: current.unit,
      category_id: 'cat-combos',
      image_url: current.img,
      description: current.desc,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addItem(product, 1);
    if (onAdd) {
      onAdd(current.title, e);
    }
  };

  return (
    <section id="special-combos" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 border-b border-[#e8e4da] dark:border-[#2e2e38] pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#fe0000] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Assortment</span>
          </div>
          <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white">
            Special Combos & Gift Boxes
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
          Handpicked grand celebration assortments, perfect for family get-togethers, corporate orders, and gifting.
        </p>
      </div>

      {/* Main Combo Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#fffdfa] dark:bg-[#1e1e24] rounded-3xl border border-[#e8e4da] dark:border-[#2e2e38] p-6 sm:p-8 shadow-sm">
        {/* Left: Combo Image with Badge */}
        <div className="lg:col-span-5 relative">
          <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
            <Image
              src={current.img}
              alt={current.title}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <span className="absolute top-4 left-4 bg-[#fe0000] text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              {current.badge}
            </span>
          </div>
        </div>

        {/* Right: Info & Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div>
            {/* Pack Switch Buttons */}
            <div className="inline-flex p-1 bg-[#f8f6f0] dark:bg-[#25252d] rounded-full border border-[#e8e4da] dark:border-[#2e2e38] gap-1 mb-3">
              <button
                type="button"
                onClick={() => setSelectedPack('gift')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedPack === 'gift'
                    ? 'bg-[#fe0000] text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>🎁 Gift Pack</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPack('family')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedPack === 'family'
                    ? 'bg-[#fe0000] text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>👨‍👩‍👧‍👦 Family Pack</span>
              </button>
            </div>

            <span className="text-xs font-bold text-[#fe0000] uppercase tracking-wider block">
              {current.kicker}
            </span>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-gray-900 dark:text-white mt-1">
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              {current.desc}
            </p>

            {/* Feature Bullets */}
            <div className="space-y-1.5 pt-3 text-xs font-semibold text-gray-800 dark:text-gray-200">
              {current.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Add CTA */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-serif font-extrabold text-2xl sm:text-3xl text-[#fe0000]">
                  ₹{current.price}
                </span>
                <span className="text-xs text-gray-500 ml-1.5">/ {current.unit}</span>
              </div>

              <button
                onClick={handleAddCombo}
                className="px-7 py-3 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add {selectedPack === 'gift' ? 'Gift Pack' : 'Family Pack'}</span>
              </button>
            </div>

            <div className="p-3 bg-[#fff0f0] dark:bg-red-950/20 border border-[#fcd4d4] dark:border-red-900/40 rounded-xl text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
              {current.note}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
