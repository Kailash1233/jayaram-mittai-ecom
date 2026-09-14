# Jayaram Mittai — Hyper-Modern Ecommerce & Kitchen Operations Platform

A complete Next.js 16 (React 19 + TypeScript + Tailwind CSS) ecommerce and kitchen management application built for **Jayaram Mittai** (Since 1978, Chennai).

## Key Features
- **3D Menu Card (Menu Book)**: Real physical dual-sided page turns with 3D perspective and mobile responsive single-page mode.
- **Hero Video & Image Slideshow**: Full edge-to-edge video transitions with quick category shortcuts.
- **Expanding Search Bar**: Smooth hover and focus expand animation on laptop/desktop; compact mobile search.
- **Live Cart & Flying Particle Animation**: Real-time cart calculations, delivery zone checks, clear cart option.
- **Customer Authentication (No OTP)**: Direct password registration and login without SMS bottlenecks.
- **Kitchen & Operations Desk (\/shop/admin\)**:
  - Live Orders Queue with running preparation timers ticking every second.
  - Standard workflow state buttons (?? Confirm, ?? Start Packing, ?? Dispatch, ?? Mark Delivered).
  - 1-click item availability & out-of-stock management with auto-reopen timers.
  - Excel bulk menu import engine with shared canonical dish image resolution.
  - Per-dish custom photo override modal.

## Quick Start
1. Install dependencies:
   \\\ash
   npm install
   \\\
2. Run development server:
   \\\ash
   npm run dev
   \\\
3. Open in browser:
   - **Customer Storefront:** http://localhost:3000/shop (or http://localhost:3000)
   - **Kitchen Desk:** http://localhost:3000/shop/admin
