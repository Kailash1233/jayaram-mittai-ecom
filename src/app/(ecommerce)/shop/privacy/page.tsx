import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Jayaram Mittai',
  description: 'How Jayaram Mittai collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-10 pb-16 max-w-3xl mx-auto px-4 sm:px-6">
      <Link href="/shop" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Menu
      </Link>

      <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
      <p className="text-xs text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="prose prose-sm max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">1. What we collect</h2>
          <p>
            When you sign in or place an order with Jayaram Mittai, we collect your mobile number, name, delivery
            address, and order details. We use your mobile number to send a one-time verification code and to
            identify your account — we never ask for or store a password.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">2. How we use your number and personal information</h2>
          <p>
            We use your mobile number and order details to process and deliver your orders, send order and
            delivery updates, and provide customer support. With your consent, we may also use your mobile number
            for our own store marketing — for example, to let you know about new menu items, seasonal offers, or
            discounts, or to call you about an ongoing promotion.
          </p>
          <p className="mt-2 font-semibold text-gray-900 dark:text-white">
            We do not sell, rent, or share your mobile number, personal data, or order preferences with any third
            party for their own marketing purposes. Your information is used only by Jayaram Mittai, for Jayaram
            Mittai's own purposes described above.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">3. Who else sees your information</h2>
          <p>
            We share only what's necessary to get your order to you: your delivery address and phone number with
            our own delivery staff, and payment details directly with our payment processor (Razorpay) to complete
            your transaction securely. We do not control and are not responsible for Razorpay's own privacy
            practices, which are governed by their own policy.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">4. Data retention</h2>
          <p>
            We keep your account and order history for as long as your account is active, so you can view past
            orders and reorder easily. You can ask us to delete your account and personal data at any time by
            contacting us (see Section 6) — we'll retain only what we're legally required to keep, such as
            transaction records for tax purposes.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">5. Your choices</h2>
          <p>
            You can opt out of marketing messages at any time by replying STOP to any marketing message, or by
            contacting us directly. This won't affect order and delivery updates for orders you've already placed,
            which we'll always send so you know the status of your order.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">6. Contact us</h2>
          <p>
            Questions about this policy, or requests to access, correct, or delete your data, can be sent to{' '}
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
