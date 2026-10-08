import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Lock, Database, Eye } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Portal</span>
      </Link>

      {/* Header */}
      <div className="border-b border-[#E5E7EB] pb-4">
        <h1 className="text-xl font-bold text-[#0A0A0A] tracking-tight">
          Privacy & Banking Data Protection Policy
        </h1>
        <p className="text-xs text-[#6B7280] mt-1">
          Governing Business Correspondent (BCA) Information Systems & Commission Records
        </p>
      </div>

      {/* Content */}
      <div className="space-y-4 text-xs text-[#374151] leading-relaxed">
        <section className="clean-card p-5 space-y-2">
          <h2 className="text-sm font-semibold text-[#0A0A0A] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0F2942]" />
            <span>1. Information Collection & Purpose</span>
          </h2>
          <p className="text-[#6B7280]">
            The Sanjivani BC Commission Analytics Portal processes operational records relating to
            Business Correspondent Agents (BCAs) engaged by Sanjivani Vikas Foundation for authorized
            banking partners. Information processed includes Agent Identification codes, BCA names,
            terminal/device serial numbers, base branch codes (SOL ID), account opening volumes,
            transaction values, and government social security enrollment tallies.
          </p>
        </section>

        <section className="clean-card p-5 space-y-2">
          <h2 className="text-sm font-semibold text-[#0A0A0A] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#15803D]" />
            <span>2. Strict Confidentiality & Non-Disclosure</span>
          </h2>
          <p className="text-[#6B7280]">
            All financial payout figures, incentive slabs, and commission distribution ratios (80% BCA /
            20% Corporate) constitute proprietary business correspondence data. Authorized personnel must
            not disclose, export, or transmit these records to unauthorized third parties or public networks.
          </p>
        </section>

        <section className="clean-card p-5 space-y-2">
          <h2 className="text-sm font-semibold text-[#0A0A0A] flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#0F2942]" />
            <span>3. Data Retention & Secure Processing</span>
          </h2>
          <p className="text-[#6B7280]">
            Data uploaded to this portal is processed within protected enterprise environments. Client-side
            vouchers and spreadsheet reports are generated on-demand without persistent external telemetry.
            Audit logs are retained in accordance with Reserve Bank of India (RBI) BC governance guidelines.
          </p>
        </section>
      </div>
    </div>
  );
}
