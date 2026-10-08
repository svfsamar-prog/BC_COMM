'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  LayoutDashboard,
  Layers,
  MapPin,
  Building2,
  ShieldCheck,
  DollarSign,
  FileText,
  Lock,
  UploadCloud,
  ChevronRight,
  Users,
  BarChart3,
} from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: 'overview' | 'state' | 'zone' | 'district' | 'social' | 'commission') => void;
  onOpenUpload: () => void;
  statementMonth: string;
  totalAgents: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onOpenUpload,
  statementMonth,
  totalAgents,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs bg-[#0f2942] border-r border-slate-800 text-slate-200 flex flex-col justify-between shadow-2xl">
          {/* Top Section */}
          <div className="flex-1 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-700 rounded-lg text-white">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide">PORTAL NAVIGATION</h2>
                  <p className="text-[11px] text-slate-400">{statementMonth} ({totalAgents} BCAs)</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Group: Analytical Views */}
            <div className="p-4 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Dashboards & Registers
              </div>

              <Link
                href="/"
                onClick={onClose}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-slate-200 hover:bg-white/10 hover:text-white transition"
              >
                <div className="flex items-center space-x-2.5">
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>Executive Overview</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/social-schemes"
                onClick={onClose}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-slate-200 hover:bg-white/10 hover:text-white transition"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Social Security (APY/SBY/JBY)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/commission"
                onClick={onClose}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-slate-200 hover:bg-white/10 hover:text-white transition"
              >
                <div className="flex items-center space-x-2.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Commission & Split Matrix</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/agents"
                onClick={onClose}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-slate-200 hover:bg-white/10 hover:text-white transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>BCA Agent Directory</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/analytics"
                onClick={onClose}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-slate-200 hover:bg-white/10 hover:text-white transition"
              >
                <div className="flex items-center space-x-2.5">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Regional Hierarchy Rankings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <div className="pt-3">
                <button
                  onClick={() => {
                    onOpenUpload();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white shadow transition active:scale-95"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Import Statement (.XLSX)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Legal Links */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sanjivani Vikas Foundation
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <Link
                href="/privacy"
                onClick={onClose}
                className="flex items-center space-x-1 text-slate-400 hover:text-white py-1 transition"
              >
                <Lock className="w-3 h-3" />
                <span>Privacy Policy</span>
              </Link>
              <Link
                href="/terms"
                onClick={onClose}
                className="flex items-center space-x-1 text-slate-400 hover:text-white py-1 transition"
              >
                <FileText className="w-3 h-3" />
                <span>Terms & Cond.</span>
              </Link>
            </div>
            <div className="text-[10px] text-slate-400 pt-1">
              © {new Date().getFullYear()} Sanjivani Vikas Foundation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
