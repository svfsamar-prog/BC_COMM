import React from 'react';
import Link from 'next/link';
import { FileCheck, ArrowLeft, ShieldAlert, Scale, CheckCircle2 } from 'lucide-react';

export default function TermsAndConditionsPage() {
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
          Terms & Conditions of Service (BC Operations)
        </h1>
        <p className="text-xs text-[#6B7280] mt-1">
          Standard Operating Agreement for Business Correspondents & Field Operations
        </p>
      </div>

      {/* Content */}
      <div className="space-y-4 text-xs text-[#374151] leading-relaxed">
        <section className="clean-card p-5 space-y-2">
          <h2 className="text-sm font-semibold text-[#0A0A0A] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            <span>1. Commission Settlement & Reconciliation</span>
          </h2>
          <p className="text-[#6B7280]">
            Commission calculations displayed in this portal reflect gross figures derived from bank monthly
            miscellaneous logs. Monthly payments are disbursed subject to statutory calculations (80% BCA payout, 20% corporate retention),
            applicable Tax Deducted at Source (TDS), and final inter-bank reconciliation approvals.
          </p>
        </section>

        <section className="clean-card p-5 space-y-2">
          <h2 className="text-sm font-semibold text-[#0A0A0A] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706]" />
            <span>2. BCA Minimum Activity & Login Compliance</span>
          </h2>
          <p className="text-[#6B7280]">
            Business Correspondents must maintain active attendance as mandated by bank SLAs. Failure to
            meet baseline active login thresholds (&lt; 15 days) may impact fixed base commission eligibility and lead to
            reallocation of location outlets.
          </p>
        </section>

        <section className="clean-card p-5 space-y-2">
          <h2 className="text-sm font-semibold text-[#0A0A0A] flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#0F2942]" />
            <span>3. Verification & Dispute Resolution</span>
          </h2>
          <p className="text-[#6B7280]">
            In the event of discrepancies in account opening counts, transaction volume, or SSS enrollments
            (APY, PM-SBY, PM-JBY), written notice must be submitted to the Sanjivani Vikas Foundation operations desk
            within 15 calendar days from statement generation.
          </p>
        </section>
      </div>
    </div>
  );
}
