'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  RotateCw,
  TrendingUp,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate random 5-character alphanumeric captcha
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setErrorMessage('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const result = await login(username, password, captchaInput, captchaCode);
      if (result.success) {
        router.push('/');
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
        generateCaptcha();
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during sign-in.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FFFFFF] font-sans antialiased select-none">
      {/* LEFT HALF: Sanjivani Brand Showcase (Forest Green `#0A5C36` / `#004D25`) */}
      <div className="relative w-full md:w-1/2 bg-[#0A5C36] text-white p-8 md:p-14 flex flex-col justify-between overflow-hidden">
        {/* Background Subtle Decorative Watermark Circles */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border border-emerald-400/15 pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full border border-emerald-400/20 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border border-emerald-400/25 pointer-events-none" />

        {/* Top Header Pill with Favicon Logo (Phase 0 Fix) */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#004D25]/60 border border-emerald-500/30 text-xs font-semibold text-emerald-100 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/favicon.ico"
              alt="SVF"
              className="w-4 h-4 object-contain rounded-full bg-white p-0.5"
            />
            <span>Sanjivani Vikas Foundation</span>
          </div>
        </div>

        {/* Middle Feature Content */}
        <div className="relative z-10 my-10 md:my-0 max-w-lg space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[#004D25]/80 text-[11px] font-bold text-[#E59819] tracking-wider uppercase">
            HAPPINESS · CARE FOR ALL
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Online Dashboard
          </h1>

          <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed">
            One secure workspace for supervisors, staff and CSPs to manage operations, reports and requests.
          </p>

          {/* 3 Feature Checklist */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 text-sm text-emerald-50 font-medium">
              <div className="w-6 h-6 rounded-md bg-emerald-700/60 flex items-center justify-center text-emerald-200 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span>Live performance dashboards and reports</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-emerald-50 font-medium">
              <div className="w-6 h-6 rounded-md bg-emerald-700/60 flex items-center justify-center text-emerald-200 shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span>Help desk tickets and approvals</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-emerald-50 font-medium">
              <div className="w-6 h-6 rounded-md bg-emerald-700/60 flex items-center justify-center text-emerald-200 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Secure, role-based access</span>
            </div>
          </div>
        </div>

        {/* Left Bottom Copyright */}
        <div className="relative z-10 text-xs text-emerald-200/70 pt-6">
          © 2026 Sanjivani Vikas Foundation. All rights reserved.
        </div>
      </div>

      {/* RIGHT HALF: Secure Sign-in Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-14 bg-white">
        <div className="max-w-md w-full space-y-6">
          {/* Official Sanjivani Logo */}
          <div className="flex justify-center md:justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/date69bba/image/upload/v1774602823/SanjivaniVikasLogo_new_2_hpwra4.png"
              alt="Sanjivani Vikas Foundation"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Sign In Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs text-[#6B7280]">
              Enter your credentials to continue.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#374151]">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0A5C36] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#374151]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-[#F8FAFC] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0A5C36] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-[#374151] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security Code (CAPTCHA) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#374151]">
                Security code
              </label>
              <div className="flex items-center gap-2">
                {/* Stylized Captcha Canvas Box */}
                <div className="flex-1 h-11 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg flex items-center justify-center tracking-[0.4em] font-serif text-xl font-bold text-[#0D6832] select-none shadow-inner bg-linear-to-r from-emerald-50 via-teal-50 to-slate-50 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-around">
                    <span className="w-full h-0.5 bg-emerald-600 rotate-3 transform" />
                  </div>
                  {captchaCode.split('').map((char, index) => (
                    <span
                      key={index}
                      style={{
                        transform: `rotate(${((index % 2 === 0 ? 1 : -1) * (index + 2) * 3)}deg) translateY(${index % 2 === 0 ? '-1px' : '2px'})`,
                        display: 'inline-block',
                      }}
                      className="drop-shadow-xs"
                    >
                      {char}
                    </span>
                  ))}
                </div>

                {/* Refresh Captcha Button */}
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="h-11 w-11 rounded-lg border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center transition-colors shrink-0"
                  title="Generate new security code"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Captcha Input */}
              <input
                type="text"
                required
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Type the code shown above"
                maxLength={6}
                className="w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-lg text-xs font-mono uppercase text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0A5C36] focus:border-transparent transition-all mt-1"
              />
            </div>

            {/* Sign In Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#0A5C36] hover:bg-[#084B26] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
            </button>
          </form>

          {/* Authorized Footer */}
          <div className="text-center pt-4 border-t border-[#F3F4F6] flex items-center justify-center gap-1.5 text-[11px] text-[#6B7280]">
            <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>Authorised users only. Activity is logged.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
