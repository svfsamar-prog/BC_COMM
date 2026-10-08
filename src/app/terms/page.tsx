import React from 'react';
import Link from 'next/link';
import { FileCheck, ArrowLeft, ShieldAlert, Scale, CheckCircle2 } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Content */}
      <main className="space-y-6">
        <div className="water-card p-6 relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center space-x-2 text-cyan-400 mb-2">
            <Scale className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Operational Terms</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Terms & Conditions of Service (BC Operations)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standard Operating Agreement for Business Correspondents & Field Operations
          </p>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <section className="water-card p-5 space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>1. Commission Settlement & Reconciliation</span>
            </h2>
            <p className="text-slate-400">
              Commission calculations displayed in this portal reflect gross figures derived from bank monthly
              miscellaneous logs. Monthly payments are disbursed subject to applicable Tax Deducted at Source (TDS),
              device maintenance deductions, and final inter-bank reconciliation approvals.
            </p>
          </section>

          <section className="water-card p-5 space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>2. BCA Minimum Activity & Login Compliance</span>
            </h2>
            <p className="text-slate-400">
              Business Correspondents must maintain active attendance as mandated by bank SLAs. Failure to
              meet baseline active login thresholds may impact fixed base commission eligibility and lead to
              reallocation of location outlets.
            </p>
          </section>

          <section className="water-card p-5 space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-sky-400" />
              <span>3. Verification & Dispute Resolution</span>
            </h2>
            <p className="text-slate-400">
              In the event of discrepancies in account opening counts, transaction volume, or SSS enrollments
              (APY, PM-SBY, PM-JBY), written notice must be submitted to the Sanjivani Vikas Foundation operations desk
              within 15 calendar days from statement generation.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
