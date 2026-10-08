'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Menu,
  LayoutDashboard,
  ShieldCheck,
  DollarSign,
  Users,
  BarChart3,
  Calendar,
  Building,
} from 'lucide-react';
import { useCommission } from '@/context/CommissionContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    statementMonthLabel,
    records,
    setIsUploadModalOpen,
    setIsSidebarOpen,
    exportCurrentExcel,
    exportCurrentPdf,
  } = useCommission();

  const navLinks = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/social-schemes', label: 'Social Schemes (SSS)', icon: ShieldCheck },
    { href: '/commission', label: 'Commission (80/20)', icon: DollarSign },
    { href: '/agents', label: 'BCA Directory', icon: Users },
    { href: '/analytics', label: 'Regional Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Official Sanjivani Foundation Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-28 sm:w-32 bg-white flex items-center justify-start">
                <img
                  src="https://res.cloudinary.com/date69bba/image/upload/v1774602823/SanjivaniVikasLogo_new_2_hpwra4.png"
                  alt="Sanjivani Vikas Foundation"
                  className="max-h-9 max-w-full object-contain"
                />
              </div>
              <div className="hidden xl:block border-l border-slate-200 pl-3">
                <span className="text-xs font-bold text-[#0f2942] uppercase tracking-wider block">
                  BC Commission Portal
                </span>
                <span className="text-[10px] text-slate-500 block">
                  National Banking Settlement Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? 'bg-[#0f2942] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0f2942] hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions (Import Statement & Exports) */}
          <div className="flex items-center space-x-2">
            {/* Current Statement Month Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 text-[11px]">Period:</span>
              <strong className="text-slate-900 font-bold text-[11px]">{statementMonthLabel}</strong>
            </div>

            {/* Quick Export XLSX */}
            <button
              onClick={exportCurrentExcel}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition shadow-xs"
              title="Export 33-Column Master XLSX"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>XLSX</span>
            </button>

            {/* Quick Export PDF */}
            <button
              onClick={exportCurrentPdf}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition shadow-xs"
              title="Generate Executive PDF Report"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>PDF</span>
            </button>

            {/* Import Statement Button (Sanjivani Brand Green) */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Import Statement</span>
              <span className="sm:hidden">Import</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
