'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — CUSTOMER LOGIN MODAL
// Phone number + OTP (delivered on WhatsApp). No password, no name, no
// separate sign-up step — a new number is signed up automatically on its
// first successful verify.
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
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
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-[#fffdfa] dark:bg-[#1e1e24] rounded-3xl overflow-hidden shadow-2xl border border-[#e8e4da] dark:border-[#2e2e38] p-6 sm:p-8 text-gray-900 dark:text-gray-100 font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#fe0000] p-1.5 mx-auto flex items-center justify-center shadow-lg shadow-red-500/20">
            <Image src="/logo.png" alt="Jayaram Mittai" width={44} height={44} className="object-contain" />
          </div>
          <h3 className="font-bold text-2xl text-gray-900 dark:text-white tracking-tight">
            {step === 'phone' ? 'Sign In to Order' : 'Enter Verification Code'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
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
                <Phone className="w-4 h-4 text-gray-400 absolute left-3" />
                <span className="absolute left-9 text-xs font-bold text-gray-500">+91</span>
                <input
                  type="tel"
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={10}
                  value={cleanPhone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9840012345"
                  className="w-full pl-16 pr-4 py-2.5 bg-white dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] rounded-xl text-sm font-mono font-medium focus:outline-none focus:border-[#fe0000] focus:ring-2 focus:ring-red-500/20 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isValidPhone}
              className="w-full mt-2 py-3 rounded-xl bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? 'Sending Code...' : 'Send OTP on WhatsApp'}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0f7a42]" />
              <span>No password. No spam. Just your order updates.</span>
            </div>
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
                className="w-full px-4 py-3 bg-white dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] rounded-xl text-center text-xl font-mono font-bold tracking-[0.5em] focus:outline-none focus:border-[#fe0000] focus:ring-2 focus:ring-red-500/20 text-gray-900 dark:text-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== OTP_LENGTH}
              className="w-full mt-2 py-3 rounded-xl bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
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
  );
}
