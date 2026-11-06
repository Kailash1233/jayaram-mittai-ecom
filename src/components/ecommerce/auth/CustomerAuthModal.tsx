'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — CUSTOMER LOGIN MODAL
// Phone number + OTP (delivered on WhatsApp). No password, no name, no
// separate sign-up step — a new number is signed up automatically on its
// first successful verify.
//
// Split-screen layout (left brand panel + right form) modeled on Zepto's own
// sign-in screen. The left panel's photo/copy is a placeholder — swap
// `/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg` and the
// headline below for your own art direction whenever you're ready.
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Phone, CheckCircle2, ShieldCheck, AlertCircle, ArrowLeft, RotateCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export function CustomerAuthModal({ isOpen, onClose }: CustomerAuthModalProps) {
  const { requestOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state the next time the modal opens
      const timeout = setTimeout(() => {
        setStep('phone');
        setPhone('');
        setOtp('');
        setError(null);
        setIsSuccess(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'otp') otpInputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const cleanPhone = phone.replace(/\D/g, '');
  const isValidPhone = cleanPhone.length === 10;

  const friendlyError = (err: unknown, fallback: string) => {
    if (err instanceof ApiError) {
      if (err.statusCode === 429) return "You've requested too many codes. Please wait a minute and try again.";
      if (err.statusCode === 401) return 'That code is incorrect or has expired. Please try again.';
      return err.message || fallback;
    }
    return fallback;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidPhone) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestOtp(cleanPhone);
      setStep('otp');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(friendlyError(err, 'Could not send the code. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await requestOtp(cleanPhone);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(friendlyError(err, 'Could not resend the code. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp(cleanPhone, otp);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError(friendlyError(err, 'Could not verify the code. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full h-full sm:h-auto sm:max-w-3xl bg-white dark:bg-[#1e1e24] sm:rounded-3xl overflow-hidden shadow-2xl flex text-gray-900 dark:text-gray-100 font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 sm:bg-transparent sm:hover:bg-gray-100 sm:dark:hover:bg-gray-800 text-white sm:text-gray-400 sm:hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left brand panel — placeholder art direction; swap freely */}
        <div className="hidden sm:block relative w-[42%] shrink-0">
          <Image
            src="/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#cc0000]/95 via-[#fe0000]/90 to-[#7a0000]/95" />
          <div className="relative h-full flex flex-col justify-between p-8 text-white">
            <div className="w-11 h-11 rounded-full bg-white p-1.5 flex items-center justify-center">
              <Image src="/logo.png" alt="Jayaram Mittai" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">Jayaram Mittai</p>
              <h2 className="font-serif font-extrabold text-3xl leading-tight mb-3">
                Fresh sweets, delivered to your door
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Sign in to track your order, save your address, and reorder your favourites in a tap.
              </p>
            </div>
            <p className="text-[10px] text-white/50">[Placeholder art — replace image, headline, and copy here]</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            <div className="sm:hidden flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#fe0000] p-1 flex items-center justify-center shrink-0">
                <Image src="/logo.png" alt="Jayaram Mittai" width={32} height={32} className="object-contain" />
              </div>
              <span className="font-serif font-extrabold text-lg">Jayaram Mittai</span>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-2xl text-gray-900 dark:text-white tracking-tight">
                {step === 'phone' ? 'Sign in' : 'Enter verification code'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                {step === 'phone'
                  ? "We'll send a one-time code to your WhatsApp."
                  : `Sent to +91 ${cleanPhone} on WhatsApp.`}
              </p>
            </div>

            {isSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-90 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-[#0f7a42] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-700 dark:text-emerald-400" />
                </div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">Signed In Successfully!</h4>
                <p className="text-xs text-gray-500">Welcome to Jayaram Mittai.</p>
              </div>
            ) : step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5" />
                    <span className="absolute left-9 text-sm font-bold text-gray-500">+91</span>
                    <input
                      type="tel"
                      required
                      autoFocus
                      inputMode="numeric"
                      maxLength={10}
                      value={cleanPhone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9840012345"
                      className="w-full pl-16 pr-4 py-3.5 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-[#2e2e38] rounded-xl text-base font-mono font-medium focus:outline-none focus:border-[#fe0000] focus:ring-2 focus:ring-red-500/20 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isValidPhone}
                  className="w-full mt-2 py-3.5 rounded-xl bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending Code...' : 'Continue'}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0f7a42] shrink-0" />
                  <span>No password. No spam. Just your order updates.</span>
                </div>

                <p className="text-center text-[10px] text-gray-400 leading-relaxed">
                  By continuing, you agree to our{' '}
                  <Link href="/shop/terms" target="_blank" className="font-semibold text-gray-600 dark:text-gray-300 hover:text-[#fe0000] underline underline-offset-2">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/shop/privacy" target="_blank" className="font-semibold text-gray-600 dark:text-gray-300 hover:text-[#fe0000] underline underline-offset-2">
                    Privacy Policy
                  </Link>
                  . We'll only use your number for order updates and our own offers — never sold or shared.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-3.5">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    {OTP_LENGTH}-Digit Code
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={OTP_LENGTH}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
                    placeholder="••••••"
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-[#2e2e38] rounded-xl text-center text-xl font-mono font-bold tracking-[0.5em] focus:outline-none focus:border-[#fe0000] focus:ring-2 focus:ring-red-500/20 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otp.length !== OTP_LENGTH}
                  className="w-full mt-2 py-3.5 rounded-xl bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                      setError(null);
                    }}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Change number
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isSubmitting}
                    className="flex items-center gap-1 text-[#fe0000] font-bold disabled:text-gray-400"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
