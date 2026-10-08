'use client';

import React, { useState } from 'react';
import { Shield, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerifyIndexPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/verify/${encodeURIComponent(code.trim().toUpperCase())}`);
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-[#0A0A0A] font-sans antialiased py-8 px-4 sm:px-6 select-none">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/date69bba/image/upload/v1774602823/SanjivaniVikasLogo_new_2_hpwra4.png"
            alt="Sanjivani Vikas Foundation"
            className="h-14 w-auto mx-auto object-contain"
          />
          <p className="text-xs font-semibold text-[#0A5C36]">
            Official Voucher Verification & Audit Registry
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-6 space-y-4">
          <div className="text-center space-y-2">
            <Shield className="w-10 h-10 text-[#0A5C36] mx-auto opacity-80" />
            <h2 className="text-sm font-bold text-[#0A0A0A]">Verify BCA Commission Voucher</h2>
            <p className="text-xs text-[#6B7280]">
              Scan the QR code on your printed voucher or enter the 8-character verification code below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">
                8-Character Verification Code / Voucher No.
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3F89C21 or SVF/AUG26/15385"
                className="w-full px-3 py-2 text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#0A5C36] text-white text-xs font-semibold rounded-lg hover:bg-[#084B26] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Verify Voucher Authenticity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E5E7EB] text-xs font-semibold text-[#4B5563] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors shadow-xs"
          >
            <X className="w-3.5 h-3.5 text-rose-500" />
            <span>Close Window</span>
          </button>
        </div>
      </div>

      <footer className="text-center text-[10px] text-[#9CA3AF] mt-8">
        © 2026 Sanjivani Vikas Foundation • Secure Cryptographic Verification System
      </footer>
    </div>
  );
}
