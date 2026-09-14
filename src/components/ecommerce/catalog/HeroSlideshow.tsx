'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — FULL-WIDTH HERO VIDEO/IMAGE SLIDESHOW
// Sourced from ECommerce.html reference
// =============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface SlideData {
  id: number;
  type: 'video' | 'image';
  src: string;
  eyebrow: string;
  title: string;
  description: string;
  stats: Array<{ strong: string; span: string }>;
  ctaText: string;
  targetCategory?: string;
  targetAnchor?: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    type: 'video',
    src: '/videos/sweets.mp4',
    eyebrow: 'Pure Ghee Mithai • Handcrafted Daily',
    title: 'Royal Sweet Delicacies',
    description: 'Watch the art of handcrafted pure ghee sweets and traditional Indian mithai prepared fresh everyday.',
    stats: [
      { strong: 'Pure', span: 'Ghee' },
      { strong: 'Fresh', span: 'Daily' },
      { strong: 'Since', span: '1978' },
    ],
    ctaText: 'Explore Sweets →',
    targetCategory: 'cat-sweets',
    targetAnchor: '#shop-menu',
  },
  {
    id: 2,
    type: 'video',
    src: '/videos/tsnacks.mp4',
    eyebrow: 'Watch Kitchen Craft • Fresh Preparation',
    title: 'Traditional Snack Crafting',
    description: "Experience the art of traditional South Indian sweet and savoury making — Right From Your Grandmother's Kitchen...",
    stats: [
      { strong: 'Handmade', span: 'Craft' },
      { strong: 'Live', span: 'Kitchen' },
      { strong: 'Authentic', span: 'Recipes' },
    ],
    ctaText: 'Explore Full Menu →',
    targetAnchor: '#shop-menu',
  },
  {
    id: 3,
    type: 'image',
    src: '/images/ecommerce/n combo2.jpeg',
    eyebrow: 'Special Edition • Navaratri Combo',
    title: 'Jayaram Navaratri Combo',
    description: 'Grand celebration box loaded with premium Kaju Katli, Ghee Mysore Pak, Special Mixture and crunchy savouries.',
    stats: [
      { strong: '₹499', span: '1 kg Pack' },
      { strong: 'Pure', span: 'Ghee' },
      { strong: 'Special', span: 'Assortment' },
    ],
    ctaText: 'Order Navaratri Combo →',
    targetAnchor: '#special-combos',
  },
  {
    id: 4,
    type: 'image',
    src: '/images/ecommerce/Festive Combo.jpeg',
    eyebrow: 'Handcrafted in Chennai • Pure Ghee',
    title: 'Festive Combo Delights',
    description: 'Handcrafted traditional sweets and crunchy savouries specially curated for festive celebrations and family joy.',
    stats: [
      { strong: '1978', span: 'Established' },
      { strong: 'Festive', span: 'Special Packs' },
      { strong: 'Pure', span: 'Ghee Sweets' },
    ],
    ctaText: 'Explore Combos →',
    targetAnchor: '#special-combos',
  },
  {
    id: 5,
    type: 'image',
    src: '/images/ecommerce/Glass Rack.jpeg',
    eyebrow: 'Fresh Daily • Live Display Counter',
    title: 'Fresh From Our Display Counter',
    description: 'Visit our stores for live counters with fresh ghee Mysore Pak, Kaju Katli, golden laddus and crispy hot savouries.',
    stats: [
      { strong: 'Chromepet', span: 'Branch' },
      { strong: 'Nanganallur', span: 'Branch' },
      { strong: 'Daily', span: 'Fresh Batch' },
    ],
    ctaText: 'Browse Display →',
    targetAnchor: '#shop-menu',
  },
  {
    id: 6,
    type: 'image',
    src: '/images/ecommerce/Combo.jpeg',
    eyebrow: 'Signature Value Packs',
    title: 'Sweets & Savouries Combo',
    description: 'The perfect harmonized blend of handcrafted mithai and spicy South Indian snacks packaged for everyday joy.',
    stats: [
      { strong: '100%', span: 'Authentic' },
      { strong: 'Value', span: 'Packs' },
      { strong: 'Best', span: 'Quality' },
    ],
    ctaText: 'Order Combo →',
    targetAnchor: '#special-combos',
  },
  {
    id: 7,
    type: 'image',
    src: '/images/ecommerce/snacks.jpeg',
    eyebrow: 'Crispy & Spicy • Since 1978',
    title: 'Snacks & Sweets Selection',
    description: 'Crispy Special Mixture, Madras Mixture, Kara Sev, Ribbon Pakoda, hot samosas and sweet treats.',
    stats: [
      { strong: 'Crunchy', span: 'Bites' },
      { strong: 'Spicy', span: 'Flavours' },
      { strong: 'Fresh', span: 'Oil & Ghee' },
    ],
    ctaText: 'Explore Snacks →',
    targetAnchor: '#shop-menu',
  },
];

interface HeroSlideshowProps {
  onOpenBookMenu?: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

export function HeroSlideshow({ onOpenBookMenu, onSelectCategory }: HeroSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto slide timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6500);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Handle video autoplay on active slide
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === currentSlide) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [currentSlide]);

  const handleCtaClick = (slide: SlideData) => {
    if (slide.targetCategory && onSelectCategory) {
      onSelectCategory(slide.targetCategory);
    }
    if (slide.targetAnchor) {
      const el = document.querySelector(slide.targetAnchor);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero-slideshow"
      className="relative w-full h-[85vh] min-h-[520px] max-h-[780px] overflow-hidden bg-black text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Track */}
      <div className="relative w-full h-full">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out flex items-center ${
                isActive
                  ? 'opacity-100 visible z-10 pointer-events-auto'
                  : 'opacity-0 invisible z-0 pointer-events-none'
              }`}
            >
              {/* Slide Background: Video or High-res Image */}
              {slide.type === 'video' ? (
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el;
                  }}
                  src={slide.src}
                  muted
                  playsInline
                  loop
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-cover bg-center">
                  <Image
                    src={slide.src}
                    alt={slide.title}
                    fill
                    priority={idx === 0 || idx === 2}
                    className="object-cover"
                  />
                </div>
              )}

              {/* Dark Gradient Overlay for optimal text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 z-10" />

              {/* Text & Content */}
              <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 w-full py-12">
                <div className="max-w-2xl space-y-5">
                  {/* Eyebrow badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-extrabold uppercase tracking-widest text-[#ffe6e6]">
                    <span className="w-2 h-2 rounded-full bg-[#76e000] animate-pulse"></span>
                    <span>{slide.eyebrow}</span>
                  </div>

                  {/* Title */}
                  <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.05] tracking-tight drop-shadow-lg">
                    {slide.title}
                  </h1>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-sans max-w-xl drop-shadow-md">
                    {slide.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-2">
                    <button
                      onClick={() => handleCtaClick(slide)}
                      className="px-7 py-3.5 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
                    >
                      <span>{slide.ctaText}</span>
                    </button>

                    {onOpenBookMenu && (
                      <button
                        onClick={onOpenBookMenu}
                        className="px-6 py-3.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-bold text-sm shadow-md transition-all hover:scale-105 flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4 text-yellow-300" />
                        <span>View Menu Card</span>
                      </button>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-8 pt-4 border-t border-white/20">
                    {slide.stats.map((stat, sIdx) => (
                      <div key={sIdx}>
                        <strong className="block font-serif font-bold text-xl sm:text-2xl text-white leading-none">
                          {stat.strong}
                        </strong>
                        <span className="text-xs text-gray-300 font-sans tracking-wide uppercase">
                          {stat.span}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 hover:bg-[#fe0000] backdrop-blur-md border border-white/40 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 hover:bg-[#fe0000] backdrop-blur-md border border-white/40 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentSlide
                ? 'w-8 h-2.5 bg-[#fe0000] shadow-md shadow-red-500/50'
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
