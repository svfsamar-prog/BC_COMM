'use client';

import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, Calendar } from 'lucide-react';
import { parseCommissionWorkbook } from '@/lib/parser';
import { CommissionRecord } from '@/types/commission';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (newRecords: CommissionRecord[], mode: 'replace' | 'append') => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onDataLoaded }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [selectedMonth, setSelectedMonth] = useState<string>('August');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const records = parseCommissionWorkbook(buffer, file.name, selectedMonth, selectedYear);

      if (records.length === 0) {
        throw new Error('No valid Business Correspondent records found in the Excel workbook.');
      }

      onDataLoaded(records, importMode);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to parse the Excel workbook. Please verify the column layout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-7 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Import Monthly Statement (.xlsx)
                </h3>
                <p className="text-xs text-slate-500">
                  Ingest raw Sanjivani Commission spreadsheets
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-2 text-xs">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
              Dataset Ingestion Mode:
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <label
                className={`flex items-start space-x-2.5 p-3 rounded-lg border cursor-pointer transition ${
                  importMode === 'replace'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <span className="text-xs">Replace Dataset</span>
                  <p className="text-[10px] text-slate-500 font-normal">
                    View only this new monthly statement
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start space-x-2.5 p-3 rounded-lg border cursor-pointer transition ${
                  importMode === 'append'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <span className="text-xs">Append (Cumulative)</span>
                  <p className="text-[10px] text-slate-500 font-normal">
                    Combine for multi-month date ranges
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Statement Period Selector */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-2 text-xs">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
              Statement Period (Target Month & Year):
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Drag and Drop Box */}
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-7 text-center transition bg-slate-50/50 hover:bg-emerald-50/20 group">
            <div className="p-3 bg-white text-emerald-700 rounded-full w-fit mx-auto mb-3 shadow-xs border border-slate-200">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-900">
              Select or drop Sanjivani Commission Excel workbook
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Supports standard `.xlsx` files</p>

            <label className="mt-4 inline-block px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition active:scale-95">
              <span>{isProcessing ? 'Processing Statement...' : 'Browse Computer'}</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
