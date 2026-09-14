'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — CUSTOMER SIGNUP & LOGIN MODAL
// Requirement: No OTP confirmation. Only Name, Mobile, Password & Retype Password
// =============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Phone, Lock, User, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerAuthModal({ isOpen, onClose }: CustomerAuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate phone number
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Validate password
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Signup specific validation
    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== retypePassword) {
        setError('Passwords do not match. Please retype password correctly.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Direct signup/login without OTP
      const userEmail = `${cleanPhone}@jayarammittai.customer`;

      if (isSupabaseConfigured()) {
        if (mode === 'signup') {
          const { data, error: authError } = await supabase.auth.signUp({
            email: userEmail,
            password: password,
            options: {
              data: {
                full_name: name.trim(),
                phone: cleanPhone,
              },
            },
          });

          if (authError && !authError.message.includes('already registered')) {
            throw new Error(authError.message);
          }

          // Save/Upsert into jayaram_mittai_profiles if session exists
          if (data?.user) {
            await (supabase as any).from('jayaram_mittai_profiles').upsert({
              id: data.user.id,
              full_name: name.trim(),
              phone: cleanPhone,
              role: 'customer',
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          // Login
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: password,
          });

          if (loginError) {
            throw new Error('Invalid mobile number or password.');
          }
        }
      }

      // Save customer profile in localStorage for instant persistent state
      const customerSession = {
        name: mode === 'signup' ? name.trim() : (phone.trim() || 'Customer'),
        phone: cleanPhone,
        authenticated: true,
        loggedAt: new Date().toISOString(),
      };
      localStorage.setItem('jm_customer_session', JSON.stringify(customerSession));

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click outside */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-[#fffdfa] dark:bg-[#1e1e24] rounded-3xl overflow-hidden shadow-2xl border border-[#e8e4da] dark:border-[#2e2e38] p-6 sm:p-8 text-gray-900 dark:text-gray-100 font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#fe0000] p-1.5 mx-auto flex items-center justify-center shadow-lg shadow-red-500/20">
            <Image
              src="/logo.png"
              alt="Jayaram Mittai"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>
          <h3 className="font-bold text-2xl text-gray-900 dark:text-white tracking-tight">
            {mode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Enter your mobile number and password to sign in.'
              : 'Fill in your details to create your Jayaram Mittai account.'}
          </p>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-90 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 text-[#76e000] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
              {mode === 'signup' ? 'Account Created Successfully!' : 'Signed In Successfully!'}
            </h4>
            <p className="text-xs text-gray-500">Welcome to Jayaram Mittai.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Name Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] rounded-xl text-xs font-medium focus:outline-none focus:border-[#fe0000] focus:ring-2 focus:ring-red-500/20 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            )}

            {/* Mobile Number Field */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number (e.g. 9840012345)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] rounded-xl text-xs font-medium focus:outline-none focus:border-[#fe0000] focus:ring-2 focus:ring-red-500/20 text-gray-900 dark:text-gray-100 font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] rounded-xl text-xs font-medium focus:outline-none focus:border-[#fe0000] focus:ring-2 focus:ring-red-500/20 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Retype Password Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Retype Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="password"
                    required
                    value={retypePassword}
                    onChange={(e) => setRetypePassword(e.target.value)}
                    placeholder="Retype password to confirm"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] rounded-xl text-xs font-medium focus:outline-none focus:border-[#fe0000] focus:ring-2 focus:ring-red-500/20 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Processing...'
                : mode === 'signup'
                ? 'Create Account'
                : 'Sign In'}
            </button>

            {/* Switch Mode Toggle */}
            <div className="pt-2 text-center text-xs text-gray-500">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="text-[#fe0000] font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-[#fe0000] font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
              <ShieldCheck className="w-3.5 h-3.5 text-[#76e000]" />
              <span>Direct password login • Fast & Secure</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
