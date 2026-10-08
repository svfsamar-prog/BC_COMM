'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCommission } from '@/context/CommissionContext';
import { LayoutDashboard, Users, ShieldCheck, ChevronRight } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useCommission();

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      href: '/',
    },
    {
      id: 'register',
      label: 'BCA Register',
      icon: Users,
      href: '/#register',
    },
    {
      id: 'schemes',
      label: 'Social Schemes',
      icon: ShieldCheck,
      href: '/social-schemes',
    },
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-[#FAFAFA] border-r border-[#E5E7EB] min-h-screen select-none">
        {/* Brand Header */}
        <div className="h-14 px-5 flex items-center border-b border-[#E5E7EB] bg-[#FAFAFA]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded bg-[#0F2942] flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm">
              SVF
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#0A0A0A] leading-tight">Sanjivani Foundation</span>
              <span className="text-[10px] text-[#6B7280] leading-tight">BC Payout Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items (3 items only) */}
        <div className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isOverview = item.id === 'overview' && pathname === '/' && activeTab === 'overview';
            const isRegister = item.id === 'register' && pathname === '/' && activeTab === 'register';
            const isSchemes = item.id === 'schemes' && (pathname === '/social-schemes' || activeTab === 'schemes');
            const isActive = isOverview || isRegister || isSchemes;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'schemes') {
                    setActiveTab('schemes');
                    window.location.href = '/social-schemes';
                  } else {
                    setActiveTab(item.id as 'overview' | 'register');
                    if (pathname !== '/') {
                      window.location.href = item.id === 'register' ? '/#register' : '/';
                    }
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded-md transition-fast text-left ${
                  isActive
                    ? 'bg-[#0F2942] text-white'
                    : 'text-[#4B5563] hover:text-[#0A0A0A] hover:bg-[#F3F4F6]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-80" />}
              </button>
            );
          })}
        </div>

        {/* Quiet Footer Links */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA] text-[11px] text-[#6B7280] space-y-1.5">
          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-[#0A0A0A] transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#0A0A0A] transition-colors">Privacy</Link>
          </div>
          <p className="text-[10px] text-[#9CA3AF]">© 2026 Sanjivani Vikas Foundation</p>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] flex items-center justify-around h-14 px-2 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isOverview = item.id === 'overview' && pathname === '/' && activeTab === 'overview';
          const isRegister = item.id === 'register' && pathname === '/' && activeTab === 'register';
          const isSchemes = item.id === 'schemes' && (pathname === '/social-schemes' || activeTab === 'schemes');
          const isActive = isOverview || isRegister || isSchemes;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'schemes') {
                  setActiveTab('schemes');
                  window.location.href = '/social-schemes';
                } else {
                  setActiveTab(item.id as 'overview' | 'register');
                  if (pathname !== '/') {
                    window.location.href = item.id === 'register' ? '/#register' : '/';
                  }
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded text-[11px] font-medium transition-fast ${
                isActive ? 'text-[#0F2942]' : 'text-[#6B7280] hover:text-[#0A0A0A]'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#0F2942]' : 'text-[#9CA3AF]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
