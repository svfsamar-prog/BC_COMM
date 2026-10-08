'use client';

import React from 'react';
import Image from 'next/image';
import { Menu, Upload, FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenUpload: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onResetFilters: () => void;
  recordCount: number;
  totalRecordCount: number;
  statementMonth: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenUpload,
  onExportExcel,
  onExportPdf,
  onResetFilters,
  recordCount,
  totalRecordCount,
  statementMonth,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenSidebar}
              className="p-2 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-slate-700 focus:outline-none"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-32 bg-white rounded p-1 flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/date69bba/image/upload/v1774602823/SanjivaniVikasLogo_new_2_hpwra4.png"
                  alt="Sanjivani Vikas Logo"
                  className="max-h-8 max-w-full object-contain"
                />
              </div>
              <div className="hidden sm:block border-l border-slate-700 pl-3">
                <h1 className="text-sm font-bold tracking-wide uppercase text-slate-100">
                  Sanjivani Vikas Foundation
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  BC Commission & Operations Portal • {statementMonth}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {recordCount < totalRecordCount && (
              <button
                onClick={onResetFilters}
                className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/50 border border-amber-800/80 rounded hover:bg-amber-900/60 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset ({recordCount}/{totalRecordCount})</span>
              </button>
            )}

            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 hover:text-white transition"
              title="Upload New Monthly Statement XLSX"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Upload XLSX</span>
            </button>

            <button
              onClick={onExportExcel}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 border border-emerald-600 rounded hover:bg-emerald-600 transition"
              title="Export 33-Column Formatted Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <button
              onClick={onExportPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition"
              title="Export Summary PDF Report"
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Summary PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
