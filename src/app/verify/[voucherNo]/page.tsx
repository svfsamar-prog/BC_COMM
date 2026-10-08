'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertTriangle, XCircle, Shield, Search, ArrowRight, Building, Calendar, MapPin, User, X } from 'lucide-react';

interface VerifyResult {
  status: 'valid' | 'superseded' | 'revoked' | 'not_found' | 'invalid' | 'error';
  voucherNo?: string;
  statementMonth?: string;
  issueDate?: string;
  bcaName?: string;
  maskedAgentId?: string;
  villageName?: string;
  payableAmount?: number;
  version?: number;
  shortCode?: string;
  message?: string;
}

export default function VerifyVoucherPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const voucherNoParam = typeof params?.voucherNo === 'string' ? decodeURIComponent(params.voucherNo) : '';
  const tokenParam = searchParams.get('t') || '';

  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [searchingCode, setSearchingCode] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!voucherNoParam) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const url = `/api/vouchers/verify?v=${encodeURIComponent(voucherNoParam)}&t=${encodeURIComponent(tokenParam)}`;
        const res = await fetch(url);
        const data = await res.json();
        setResult(data);
      } catch (err) {
        setResult({ status: 'error', message: 'Network error verifying voucher.' });
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [voucherNoParam, tokenParam]);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    try {
      setSearchingCode(true);
      const res = await fetch(`/api/vouchers/verify?c=${encodeURIComponent(manualCode.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ status: 'error', message: 'Network error verifying code.' });
    } finally {
      setSearchingCode(false);
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
        {/* Official Sanjivani Logo Header */}
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

        {/* Main Verification Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#0A5C36] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#6B7280] font-medium">Verifying cryptographic signature with registry...</p>
            </div>
          ) : result ? (
            <div>
              {/* Status Header Banner */}
              {result.status === 'valid' && (
                <div className="p-5 bg-[#F0FDF4] border-b border-[#DCFCE7] flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-[#15803D] shrink-0" />
                  <div>
                    <h2 className="text-sm font-bold text-[#166534]">✔ Genuine & Verified Voucher</h2>
                    <p className="text-[11px] text-[#15803D]">
                      Authentic document officially issued by Sanjivani Vikas Foundation.
                    </p>
                  </div>
                </div>
              )}

              {result.status === 'superseded' && (
                <div className="p-5 bg-[#FFFBEB] border-b border-[#FEF3C7] flex items-center gap-3">
                  <AlertTriangle className="w-7 h-7 text-[#D97706] shrink-0" />
                  <div>
                    <h2 className="text-sm font-bold text-[#92400E]">⚠ Superseded by Newer Version</h2>
                    <p className="text-[11px] text-[#B45309]">
                      A revised statement has been generated for this month. This version is outdated.
                    </p>
                  </div>
                </div>
              )}

              {result.status === 'revoked' && (
                <div className="p-5 bg-[#FEF2F2] border-b border-[#FEE2E2] flex items-center gap-3">
                  <XCircle className="w-7 h-7 text-[#DC2626] shrink-0" />
                  <div>
                    <h2 className="text-sm font-bold text-[#991B1B]">✖ Voucher Revoked</h2>
                    <p className="text-[11px] text-[#B91C1C]">
                      This voucher was officially cancelled by Sanjivani administrative authority.
                    </p>
                  </div>
                </div>
              )}

              {(result.status === 'not_found' || result.status === 'invalid' || result.status === 'error') && (
                <div className="p-5 bg-[#FEF2F2] border-b border-[#FEE2E2] flex items-center gap-3">
                  <XCircle className="w-7 h-7 text-[#DC2626] shrink-0" />
                  <div>
                    <h2 className="text-sm font-bold text-[#991B1B]">Verification Failed</h2>
                    <p className="text-[11px] text-[#B91C1C]">
                      {result.message || 'The QR link or code does not match any valid issued record.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Verified Details (Privacy-Safe) */}
              {result.voucherNo && (
                <div className="p-6 space-y-4 text-xs">
                  {/* Payout Hero Box */}
                  <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-center">
                    <span className="text-[11px] text-[#166534] font-medium block">
                      Disbursed BCA Payable Amount
                    </span>
                    <div className="text-2xl font-extrabold text-[#15803D] tabular-nums mt-0.5">
                      ₹{result.payableAmount?.toLocaleString('en-IN') || 0}
                    </div>
                    <span className="text-[10px] text-[#166534]">
                      Statement Month: <strong>{result.statementMonth}</strong>
                    </span>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#6B7280] block">Voucher No.</span>
                      <span className="font-mono font-bold text-[#0A0A0A] text-[11px]">{result.voucherNo}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#6B7280] block">Short Verification Code</span>
                      <span className="font-mono font-bold text-[#0A5C36] tracking-wider text-[11px]">{result.shortCode}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#6B7280] block">BCA Agent Name</span>
                      <span className="font-bold text-[#0A0A0A]">{result.bcaName}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#6B7280] block">Agent ID (Masked)</span>
                      <span className="font-mono text-[#0A0A0A]">{result.maskedAgentId}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#6B7280] block">Location / Village</span>
                      <span className="text-[#374151] truncate">{result.villageName}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#6B7280] block">Issue Timestamp</span>
                      <span className="text-[#374151]">
                        {result.issueDate ? new Date(result.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center space-y-3">
              <Shield className="w-10 h-10 text-[#0A5C36] mx-auto opacity-80" />
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A]">Voucher Verification Lookup</h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  Enter the 8-character verification code printed below the QR code on your voucher.
                </p>
              </div>
            </div>
          )}

          {/* Manual Short Code Search Form */}
          <div className="p-4 bg-[#FAFAFA] border-t border-[#E5E7EB]">
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Enter 8-digit code (e.g. A3F89C21)"
                maxLength={10}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              />
              <button
                type="submit"
                disabled={searchingCode || !manualCode.trim()}
                className="px-3.5 py-1.5 bg-[#0A5C36] text-white text-xs font-semibold rounded-lg hover:bg-[#084B26] disabled:opacity-50 transition-colors flex items-center gap-1 shadow-xs"
              >
                {searchingCode ? 'Checking...' : 'Verify'}
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>

        {/* Direct Close on Back Button (Zero Navigation Links to Portal) */}
        <div className="text-center pt-2">
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E5E7EB] text-xs font-semibold text-[#4B5563] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors shadow-xs"
          >
            <X className="w-3.5 h-3.5 text-rose-500" />
            <span>Close Verification</span>
          </button>
        </div>
      </div>

      <footer className="text-center text-[10px] text-[#9CA3AF] mt-8">
        © 2026 Sanjivani Vikas Foundation • Secure Cryptographic Verification System
      </footer>
    </div>
  );
}
