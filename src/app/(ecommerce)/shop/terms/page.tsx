import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — Jayaram Mittai',
  description: 'Terms and conditions for ordering from Jayaram Mittai online.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-10 pb-16 max-w-3xl mx-auto px-4 sm:px-6">
      <Link href="/shop" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Menu
      </Link>

      <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white mb-2">Terms of Service</h1>
      <p className="text-xs text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="prose prose-sm max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">1. Who these terms apply to</h2>
          <p>
            These terms apply to anyone who places an order with Jayaram Mittai through this website. By signing
            in and placing an order, you agree to these terms and to our{' '}
            <Link href="/shop/privacy" className="text-[#fe0000] font-semibold hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">2. Signing in</h2>
          <p>
            We verify your identity using a one-time passcode sent to your mobile number — there is no password to
            set or remember. Keep your mobile number secure; anyone with access to it and to the code we send can
            sign in to your account.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">3. Orders and pricing</h2>
          <p>
            Prices shown at checkout are the prices actually charged — they're fetched fresh from our catalogue at
            the time you place your order. Delivery charges depend on your delivery pincode and order value, and
            are shown before you pay. We reserve the right to refuse or cancel an order if an item becomes
            unavailable after you've ordered it, in which case we'll refund any amount already paid for that item.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">4. Payments</h2>
          <p>
            Payments are processed securely through Razorpay. We never see or store your card, UPI, or banking
            details — they're handled entirely by Razorpay's own secure systems.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">5. Delivery</h2>
          <p>
            We currently deliver only within the pincodes listed on our site (see the footer below). Estimated
            delivery times are our best estimate for your area and aren't guaranteed — they can vary with weather,
            traffic, and order volume.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">6. Cancellations and refunds</h2>
          <p>
            Since our sweets and savouries are freshly prepared, we're unable to accept cancellations once
            preparation has begun. If an item arrives damaged, spoiled, or incorrect, contact us within 24 hours
            of delivery and we'll make it right with a replacement or refund.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">7. Marketing communications</h2>
          <p>
            By signing in, you agree that we may contact you on your mobile number about your orders and, unless
            you opt out, about offers and discounts from Jayaram Mittai. We do not sell or share your number with
            anyone else — see our{' '}
            <Link href="/shop/privacy" className="text-[#fe0000] font-semibold hover:underline">Privacy Policy</Link> for details,
            and how to opt out.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">8. Contact us</h2>
          <p>
            Questions about these terms can be sent to{' '}
            <a href="mailto:orders@jayarammittai.com" className="text-[#fe0000] font-semibold hover:underline">
              orders@jayarammittai.com
            </a>{' '}
            or by calling <strong>+91 98400 12345</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
