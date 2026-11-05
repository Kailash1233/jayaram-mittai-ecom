'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — FOOTER
// Reference: Section 0 (Brand Patterns) of "e commerce - master.md"
// =============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Award } from 'lucide-react';
import { getActiveCategories } from '@/lib/ecommerce/queries';
import { getDeliveryZones } from '@/lib/api/deliveryZones';
import type { JayaramMittaiCategory } from '@/lib/ecommerce/types';
import type { ShopApiDeliveryZone } from '@/lib/api/shopTypes';

const FALLBACK_CATEGORIES = [
  'Traditional Ghee Sweets',
  'Fresh Juices & Cold Shakes',
  'Charcoal Tikkas & Starters',
  'Fried Rice & Noodle Bowls',
  'Tandoori Naan & Parathas',
  'Festive Celebration Boxes',
];

export function EcommerceFooter() {
  const [categories, setCategories] = useState<JayaramMittaiCategory[]>([]);
  const [zones, setZones] = useState<ShopApiDeliveryZone[]>([]);

  useEffect(() => {
    getActiveCategories().then(setCategories).catch(() => {});
    getDeliveryZones().then(setZones).catch(() => {});
  }, []);

  return (
    <footer id="contact" className="bg-[#cc0000] text-white pt-14 pb-8 border-t border-red-800 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/15">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white p-1.5 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Jayaram Mittai"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-xl text-white">Jayaram Mittai</h3>
                <p className="text-xs text-[#ffe6e6] tracking-wider uppercase font-semibold">Since 1978</p>
              </div>
            </div>
            <p className="text-xs text-[#ffe6e6] leading-relaxed">
              Crafting traditional South Indian sweets, ghee delicacies, savouries, and wholesome meals for over 48 years with authentic family recipes and uncompromised purity.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#ffe6e6] font-medium">
              <Award className="w-4 h-4 text-[#ffe6e6]" />
              <span>100% Pure Vegetarian & Fresh Daily</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-base mb-4 text-white">Shop by Category</h4>
            <ul className="space-y-2.5 text-xs text-[#ffe6e6]">
              {(categories.length > 0 ? categories.map((c) => c.name) : FALLBACK_CATEGORIES).map((name) => (
                <li key={name}>
                  <Link href="/shop" className="hover:text-white transition-colors">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery & Outlets */}
          <div>
            <h4 className="font-serif font-bold text-base mb-4 text-white">Areas We Deliver To</h4>
            <ul className="space-y-2.5 text-xs text-[#ffe6e6]">
              {zones.length > 0 ? (
                zones.map((zone) => (
                  <li key={zone.location_name} className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      <strong>{zone.location_name}</strong> — pincodes {zone.pincodes.join(', ')}
                    </span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span><strong>Chromepet &amp; Nanganallur</strong>, Chennai, and nearby areas</span>
                  </li>
                </>
              )}
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span><strong>Online Orders:</strong> 9:00 AM – 5:00 PM Daily</span>
              </li>
            </ul>
          </div>

          {/* Customer Support & Safety */}
          <div>
            <h4 className="font-serif font-bold text-base mb-4 text-white">Order Assistance</h4>
            <div className="space-y-3 text-xs text-[#ffe6e6]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#ffe6e6]" />
                <span className="font-bold text-white">+91 98400 12345 / 044 2238 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#ffe6e6]" />
                <span>orders@jayarammittai.com</span>
              </div>
              <div className="p-3 bg-white/10 rounded-xl mt-3 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-[#0f7a42]" />
                  <span>Safe & Secure Checkout</span>
                </div>
                <p className="text-[10px] text-[#ffe6e6]">
                  Supports UPI, Google Pay, PhonePe, Debit/Credit Cards, Net Banking & Sodexo.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://www.swiggy.com/city/chennai/jayaram-mittai-keelkattalai-ranga-nagar-rest963700"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition-colors"
                >
                  Order on Swiggy
                </a>
                <a
                  href="https://www.zomato.com/chennai/jayaram-mittai-nanganallur/order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition-colors"
                >
                  Order on Zomato
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#ffe6e6]">
          <p>© {new Date().getFullYear()} Jayaram Mittai. All rights reserved. Crafted with care in Chennai.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/shop/privacy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/shop/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
