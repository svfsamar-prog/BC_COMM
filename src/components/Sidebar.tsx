'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCommission } from '@/context/CommissionContext';
import {
  Gauge,
  Users,
  Receipt,
  QrCode,
  ShieldCheck,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  ChevronRight,
  ChevronDown,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    setIsUploadModalOpen,
    exportPayoutListPdf,
    exportBulkVouchersPdf,
    exportCurrentExcel,
    exportCurrentPdf,
  } = useCommission();
  const { logout } = useAuth();

  const [expandedSection, setExpandedSection] = useState<string | null>('commission');

  const toggleSection = (key: string) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  return (
    <>
      {/* Desktop Left Sidebar (Sanjivani Forest Green `#0A5C36`) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#0A5C36] text-white min-h-screen select-none shadow-xl border-r border-[#004D25]">
        {/* Top Logo Card */}
        <div className="p-3.5 border-b border-[#004D25]/60 bg-[#084B26]">
          <Link href="/" className="block bg-white p-2 rounded-lg shadow-sm hover:opacity-95 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/date69bba/image/upload/v1774602823/SanjivaniVikasLogo_new_2_hpwra4.png"
              alt="Sanjivani Vikas Foundation"
              className="h-10 w-full object-contain mx-auto"
            />
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {/* Main Dashboard item */}
          <button
            onClick={() => {
              setActiveTab('overview');
              if (pathname !== '/') router.push('/');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all text-left ${
              activeTab === 'overview' && pathname === '/'
                ? 'bg-[#004D25] text-white shadow-inner border-l-3 border-[#E59819]'
                : 'text-emerald-100/80 hover:text-white hover:bg-[#004D25]/50'
            }`}
          >
            <Gauge className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Dashboard Overview</span>
          </button>

          {/* Section 1: COMMISSION MANAGEMENT */}
          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] font-bold tracking-wider text-emerald-300/70 uppercase">
              COMMISSION MANAGEMENT
            </span>
          </div>

          <div>
            <button
              onClick={() => toggleSection('commission')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'register'
                  ? 'bg-[#004D25] text-white border-l-3 border-[#E59819]'
                  : 'text-emerald-100/90 hover:text-white hover:bg-[#004D25]/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-300" />
                <span>BCA Master Register</span>
              </div>
              {expandedSection === 'commission' ? (
                <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60" />
              )}
            </button>
            {expandedSection === 'commission' && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-[11px] text-emerald-200">
                <button
                  onClick={() => {
                    setActiveTab('register');
                    if (pathname !== '/') router.push('/');
                  }}
                  className={`w-full text-left py-1 px-2 rounded transition-colors ${
                    activeTab === 'register' ? 'text-white font-bold bg-[#00381B]' : 'hover:bg-[#004D25]'
                  }`}
                >
                  33-Column Commission Grid
                </button>
                <button
                  onClick={() => {
                    exportPayoutListPdf();
                  }}
                  className="w-full text-left py-1 px-2 hover:bg-[#004D25] rounded transition-colors flex items-center justify-between"
                >
                  <span>Disbursement Payout List</span>
                  <Receipt className="w-3 h-3 text-emerald-300 opacity-70" />
                </button>
                <button
                  onClick={() => {
                    exportBulkVouchersPdf();
                  }}
                  className="w-full text-left py-1 px-2 hover:bg-[#004D25] rounded transition-colors flex items-center justify-between"
                >
                  <span>Bulk QR Vouchers</span>
                  <QrCode className="w-3 h-3 text-emerald-300 opacity-70" />
                </button>
              </div>
            )}
          </div>

          {/* Section 2: SCHEMES & INSURANCE */}
          <button
            onClick={() => {
              setActiveTab('schemes');
              router.push('/social-schemes');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-emerald-100/90 hover:text-white hover:bg-[#004D25]/40 rounded-lg transition-colors ${
              pathname === '/social-schemes' ? 'bg-[#004D25] text-white border-l-3 border-[#E59819]' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Social Security (SSS)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60" />
          </button>

          {/* Section 3: DATA & EXPORTS */}
          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] font-bold tracking-wider text-emerald-300/70 uppercase">
              DATA & EXPORTS
            </span>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-100/90 hover:text-white hover:bg-[#004D25]/40 rounded-lg transition-colors text-left"
          >
            <UploadCloud className="w-4 h-4 text-emerald-300" />
            <span>Import Statement File</span>
          </button>

          <button
            onClick={exportCurrentExcel}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-emerald-100/90 hover:text-white hover:bg-[#004D25]/40 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Export Excel Matrix</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-[#004D25] px-1.5 py-0.2 rounded font-mono">33 Col</span>
          </button>

          <button
            onClick={exportCurrentPdf}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-emerald-100/90 hover:text-white hover:bg-[#004D25]/40 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>Summary PDF Report</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-[#004D25] px-1.5 py-0.2 rounded font-mono">PDF</span>
          </button>
        </div>

        {/* Quiet Footer Links & Logout */}
        <div className="p-3 border-t border-[#004D25] bg-[#084B26] text-[11px] text-emerald-200/80 space-y-2">
          <div className="flex items-center justify-between px-1">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <button onClick={logout} className="hover:text-white text-rose-300 flex items-center gap-1 font-semibold">
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
          <p className="text-[10px] text-emerald-400/60 text-center">© 2026 Sanjivani Vikas Foundation</p>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A5C36] border-t border-[#004D25] flex items-center justify-around h-14 px-2 text-white shadow-lg">
        <button
          onClick={() => {
            setActiveTab('overview');
            if (pathname !== '/') router.push('/');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded text-[10px] font-medium ${
            activeTab === 'overview' && pathname === '/' ? 'text-[#E59819]' : 'text-emerald-100'
          }`}
        >
          <Gauge className="w-4 h-4 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('register');
            if (pathname !== '/') router.push('/');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded text-[10px] font-medium ${
            activeTab === 'register' && pathname === '/' ? 'text-[#E59819]' : 'text-emerald-100'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>BCA Register</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('schemes');
            router.push('/social-schemes');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded text-[10px] font-medium ${
            pathname === '/social-schemes' || activeTab === 'schemes' ? 'text-[#E59819]' : 'text-emerald-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          <span>Schemes</span>
        </button>
      </nav>
    </>
  );
};
