'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — LUXURY FLOATING NAV WITH SCROLL OPACITY
// Consistent button styling, expanding desktop search bar, and frosted blur
// =============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, Sun, Moon, Phone, X, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface EcommerceNavProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenBookMenu?: () => void;
  onOpenAuth?: () => void;
}

export function EcommerceNav({
  searchQuery = '',
  onSearchChange,
  onOpenBookMenu,
  onOpenAuth,
}: EcommerceNavProps) {
  const { itemCount, openDrawer } = useCart();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#fe0000]/75 backdrop-blur-xl shadow-2xl border-b border-white/20'
          : 'bg-[#fe0000] shadow-md'
      }`}
    >
      {/* Top micro-banner (collapses when scrolled) */}
      {!isScrolled && (
        <div className="bg-[#cc0000] text-xs font-medium py-1 px-4 text-center tracking-wide text-white/90 flex items-center justify-center gap-4 transition-all duration-300">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#76e000] animate-pulse"></span>
            <span>Since 1978 • Chromepet & Nanganallur, Chennai</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span><strong>+91 9445387897</strong></span>
          </span>
        </div>
      )}

      {/* Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <Link href="/shop" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-full bg-white p-1 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="Jayaram Mittai Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-lg sm:text-xl leading-none tracking-tight text-white drop-shadow-sm">
              Jayaram Mittai
            </h1>
            <p className="text-[9px] text-white/80 font-sans tracking-widest uppercase font-semibold">
              Since 1978
            </p>
          </div>
        </Link>

        {/* Uniform Consistent Navigation Buttons Bar */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-black/10 dark:bg-white/5 p-1 rounded-full border border-white/15 backdrop-blur-md">
          <a
            href="#hero-slideshow"
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/20 hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            Home
          </a>
          <a
            href="#special-combos"
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/20 hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            Special Combos
          </a>
          <a
            href="#shop-menu"
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/20 hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            Categories
          </a>
          {onOpenBookMenu && (
            <button
              onClick={onOpenBookMenu}
              className="px-4 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/25 bg-white/15 transition-all hover:scale-105 active:scale-95 border border-white/25 shadow-sm"
            >
              Menu Card
            </button>
          )}
          <a
            href="#about-story"
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/20 hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            Our Story
          </a>
          <a
            href="#contact"
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/20 hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            Contact
          </a>
        </nav>

        {/* Right Actions: Expanding Search Bar, Theme Toggle, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Expanding Search Bar (Hover/Focus Expands) */}
          <div className="hidden md:block relative group">
            <div
              className={`flex items-center rounded-full bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md transition-all duration-300 ease-out px-3 py-1.5 ${
                isSearchFocused ? 'w-64 bg-white text-gray-900 ring-2 ring-white/80' : 'w-36 text-white group-hover:w-56'
              }`}
            >
              <Search className={`w-3.5 h-3.5 mr-2 shrink-0 ${isSearchFocused ? 'text-[#fe0000]' : 'text-white'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search menu..."
                className={`w-full bg-transparent text-xs font-semibold focus:outline-none placeholder:text-white/70 ${
                  isSearchFocused ? 'text-gray-900 placeholder:text-gray-400' : 'text-white'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="p-0.5 rounded-full hover:bg-black/10 shrink-0"
                >
                  <X className={`w-3 h-3 ${isSearchFocused ? 'text-gray-500' : 'text-white'}`} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Button (Compact) */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 rounded-full hover:bg-white/15 text-white transition-colors"
            aria-label="Toggle Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/15 text-white transition-colors"
            aria-label="Toggle Theme"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Customer Sign In / Profile Button */}
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all hover:scale-105 active:scale-95 border border-white/20"
              title="Customer Login / Sign Up"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Cart Trigger Button */}
          <button
            id="cart-nav-button"
            onClick={openDrawer}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#fe0000] font-bold text-xs shadow-md hover:bg-[#fff0f0] transition-all hover:scale-105 active:scale-95"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span
                id="cart-badge-counter"
                className="bg-[#cc0000] text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow-sm"
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Expanding Search Drawer if opened */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 pb-2.5 pt-1 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center rounded-full bg-white text-gray-900 px-3 py-1.5 shadow-md">
            <Search className="w-3.5 h-3.5 text-[#fe0000] mr-2 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search sweets, tikkas, snacks..."
              className="w-full bg-transparent text-xs font-semibold focus:outline-none text-gray-900 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange?.('')} className="p-0.5">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sub-Navigation Bar — Uniform consistent buttons */}
      <div
        className={`lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-1.5 border-t border-white/15 text-xs font-semibold text-white whitespace-nowrap transition-all duration-300 ${
          isScrolled ? 'bg-[#cc0000]/80 backdrop-blur-xl' : 'bg-[#cc0000]'
        }`}
      >
        <a href="#hero-slideshow" className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-[11px] font-bold">
          Home
        </a>
        <a href="#special-combos" className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-[11px] font-bold">
          Special Combos
        </a>
        <a href="#shop-menu" className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-[11px] font-bold">
          Categories
        </a>
        {onOpenBookMenu && (
          <button
            onClick={onOpenBookMenu}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 font-bold transition-all text-[11px] border border-white/25"
          >
            Menu Card
          </button>
        )}
        <a href="#about-story" className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-[11px] font-bold">
          Our Story
        </a>
        <a href="#contact" className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-[11px] font-bold">
          Contact
        </a>
      </div>
    </header>
  );
}
