'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — NAVBAR
// Two clear rows on desktop (utility row: logo/search/account/cart, and a
// separate links row underneath) instead of cramming everything into one
// strip — that's what was making the desktop nav feel crowded and "clumsy".
// =============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, Sun, Moon, Phone, X, User, LogOut, Bike, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

/** Real storefront links — update here if a branch's page moves or a new one goes live. */
const ZOMATO_BRANCHES = [
  { label: 'Nanganallur', url: 'https://www.zomato.com/chennai/jayaram-mittai-nanganallur/order' },
  { label: 'Madipakkam', url: 'https://www.zomato.com/chennai/jayaram-mittai-madipakkam/order' },
];
const SWIGGY_URL = 'https://www.swiggy.com/city/chennai/jayaram-mittai-keelkattalai-ranga-nagar-rest963700';

const NAV_LINKS = [
  { href: '#hero-slideshow', label: 'Home' },
  { href: '#special-combos', label: 'Special Combos' },
  { href: '#shop-menu', label: 'Categories' },
  { href: '#about-story', label: 'Our Story' },
  { href: '#contact', label: 'Contact' },
];

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
  const { isAuthenticated, session, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isZomatoMenuOpen, setIsZomatoMenuOpen] = useState(false);

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
          ? 'bg-[#fe0000]/90 backdrop-blur-xl shadow-lg'
          : 'bg-[#fe0000]'
      }`}
    >
      {/* Top micro-banner (collapses when scrolled) */}
      {!isScrolled && (
        <div className="bg-[#cc0000] text-[11px] py-1.5 px-4 text-center text-white/85 flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            Since 1978 · Chromepet &amp; Nanganallur, Chennai
          </span>
          <span className="hidden sm:inline text-white/40">|</span>
          <span className="hidden sm:flex items-center gap-1">
            <Phone className="w-3 h-3" /> +91 9445387897
          </span>
        </div>
      )}

      {/* Utility row: logo, search, account/cart. No link clutter in here. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-5">
        <Link href="/shop" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-full bg-white p-1 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <Image src="/logo.png" alt="Jayaram Mittai Logo" width={36} height={36} className="object-contain" priority />
          </div>
          <div className="hidden sm:block leading-none">
            <span className="font-serif font-extrabold text-lg text-white tracking-tight block">Jayaram Mittai</span>
            <span className="text-[9px] text-white/75 tracking-widest uppercase font-bold">Since 1978</span>
          </div>
        </Link>

        {/* Search bar — the primary action in this row, like Zepto's own header */}
        <div className="hidden md:block flex-1 max-w-md">
          <div
            className={`flex items-center rounded-full border transition-colors px-4 py-2 ${
              isSearchFocused ? 'bg-white border-white ring-2 ring-white/60' : 'bg-white/15 border-white/25 hover:bg-white/20'
            }`}
          >
            <Search className={`w-4 h-4 mr-2 shrink-0 ${isSearchFocused ? 'text-[#fe0000]' : 'text-white'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search for sweets, snacks, tikkas…"
              className={`w-full bg-transparent text-sm font-medium focus:outline-none placeholder:text-white/70 ${
                isSearchFocused ? 'text-gray-900 placeholder:text-gray-400' : 'text-white'
              }`}
            />
            {searchQuery && (
              <button onClick={() => onSearchChange?.('')} className="p-0.5 rounded-full hover:bg-black/10 shrink-0">
                <X className={`w-3.5 h-3.5 ${isSearchFocused ? 'text-gray-500' : 'text-white'}`} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 md:flex-none" />

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Order through Swiggy / Zomato (desktop only — icons, compact) */}
          <div className="hidden lg:flex items-center gap-1.5 pr-1.5 mr-1 border-r border-white/20">
            <a
              href={SWIGGY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/15 text-white transition-colors"
              title="Order on Swiggy"
            >
              <Bike className="w-4 h-4" />
            </a>
            <div className="relative">
              <button
                onClick={() => setIsZomatoMenuOpen((prev) => !prev)}
                className="flex items-center gap-0.5 p-2 rounded-full hover:bg-white/15 text-white transition-colors"
                title="Order on Zomato"
              >
                <Bike className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>
              {isZomatoMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1e1e24] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-10"
                  onMouseLeave={() => setIsZomatoMenuOpen(false)}
                >
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Order on Zomato</p>
                  {ZOMATO_BRANCHES.map((branch) => (
                    <a
                      key={branch.url}
                      href={branch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsZomatoMenuOpen(false)}
                      className="block px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {branch.label} branch
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 rounded-full hover:bg-white/15 text-white transition-colors"
            aria-label="Toggle Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            className="hidden sm:flex p-2 rounded-full hover:bg-white/15 text-white transition-colors"
            aria-label="Toggle Theme"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors border border-white/20"
                title="Your account"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-mono">{session?.user.phone.slice(-10)}</span>
              </button>
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#1e1e24] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#fe0000]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors border border-white/20"
                title="Customer Login"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )
          )}

          <button
            id="cart-nav-button"
            onClick={openDrawer}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-white text-[#fe0000] font-bold text-xs shadow-sm hover:bg-[#fff0f0] transition-colors"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="bg-[#cc0000] text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Links row — its own strip, with room to breathe */}
      <nav className="hidden md:block bg-[#d60000] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-10">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[11px] font-bold text-white/85 hover:text-white tracking-wide uppercase transition-colors"
            >
              {link.label}
            </a>
          ))}
          {onOpenBookMenu && (
            <button
              onClick={onOpenBookMenu}
              className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold tracking-wide uppercase transition-colors border border-white/20"
            >
              Menu Card
            </button>
          )}
        </div>
      </nav>

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

      {/* Mobile quick-actions row — just the essentials, not a shrunk copy of the desktop nav */}
      <div
        className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 border-t border-white/15 transition-all duration-300 ${
          isScrolled ? 'bg-[#cc0000]/80 backdrop-blur-xl' : 'bg-[#cc0000]'
        }`}
      >
        {onOpenBookMenu && (
          <button
            onClick={onOpenBookMenu}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 font-bold transition-all text-[11px] text-white border border-white/25"
          >
            Menu Card
          </button>
        )}
        <a
          href={SWIGGY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-[11px] font-bold text-white"
        >
          <Bike className="w-3 h-3" /> Swiggy
        </a>
        <a
          href={ZOMATO_BRANCHES[0].url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-[11px] font-bold text-white"
        >
          <Bike className="w-3 h-3" /> Zomato
        </a>
        <button
          onClick={toggleTheme}
          className="ml-auto p-1.5 rounded-full hover:bg-white/15 text-white transition-colors"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
}
