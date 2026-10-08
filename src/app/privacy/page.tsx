import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Lock, Database, Eye } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Content */}
      <main className="space-y-6">
        <div className="water-card p-6 relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center space-x-2 text-cyan-400 mb-2">
            <Lock className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Legal Document</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Privacy & Banking Data Protection Policy
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Effective Date: October 2026 • Governing Business Correspondent (BCA) Information Systems
          </p>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <section className="water-card p-5 space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>1. Information Collection & Purpose</span>
            </h2>
            <p className="text-slate-400">
              The Sanjivani BC Commission Analytics Portal processes operational records relating to
              Business Correspondent Agents (BCAs) engaged by Sanjivani Vikas Foundation for authorized
              banking partners. Information processed includes Agent Identification codes, BCA names,
              terminal/device serial numbers, base branch codes (SOL ID), account opening volumes,
              transaction values, and government social security enrollment tallies.
            </p>
          </section>

          <section className="water-card p-5 space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>2. Strict Confidentiality & Non-Disclosure</span>
            </h2>
            <p className="text-slate-400">
              All financial payout figures, incentive slabs, and commission distribution ratios (80% BCA /
              20% Corporate) constitute proprietary business correspondence data. Authorized personnel must
              not disclose, export, or transmit these records to unauthorized third parties or public networks.
            </p>
          </section>

          <section className="water-card p-5 space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>3. Data Retention & Secure Processing</span>
            </h2>
            <p className="text-slate-400">
              Data uploaded to this portal is processed within protected enterprise environments. Client-side
              vouchers and spreadsheet reports are generated on-demand without persistent external telemetry.
              Audit logs are retained in accordance with Reserve Bank of India (RBI) BC governance guidelines.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
