'use client';

import React, { useState } from 'react';
import { Shield, Search, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VerifyIndexPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/verify/search?c=${encodeURIComponent(code.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-[#0A0A0A] font-sans antialiased py-8 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#0F2942] text-white font-black text-sm tracking-wider shadow-sm mb-1">
            SVF
          </div>
          <h1 className="text-base font-bold text-[#0F2942] leading-tight">
            Sanjivani Vikas Foundation
          </h1>
          <p className="text-xs text-[#6B7280]">
            Official Voucher Verification & Audit Registry
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-6 space-y-4">
          <div className="text-center space-y-2">
            <Shield className="w-10 h-10 text-[#0F2942] mx-auto opacity-80" />
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
                className="w-full px-3 py-2 text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-md font-mono uppercase focus:outline-none focus:border-[#0F2942]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#0F2942] text-white text-xs font-semibold rounded-md hover:bg-[#0A1D30] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Verify Voucher Authenticity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#0F2942] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sanjivani Portal</span>
          </Link>
        </div>
      </div>

      <footer className="text-center text-[10px] text-[#9CA3AF] mt-8">
        © 2026 Sanjivani Vikas Foundation • Secure Cryptographic Verification System
      </footer>
    </div>
  );
}
