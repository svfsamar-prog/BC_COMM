'use client';

import React, { useState, useRef } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { parseCommissionWorkbook } from '@/lib/parser';
import { Upload, X, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { CommissionRecord } from '@/types/commission';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

interface PreviewSummary {
  targetMonthYear: string;
  totalAgentsFound: number;
  newAgentsCount: number;
  missingFromPreviousMonthCount: number;
  previousMonthName: string;
  fileTotals: {
    grossCommission: number;
    bcCommission: number;
    corpCommission: number;
    tdsDeduction: number;
    netPayable: number;
  };
}

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, setIsUploadModalOpen, handleImportData } = useCommission();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('AUGUST');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [daysInMonth, setDaysInMonth] = useState<number>(31);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsedRecords, setParsedRecords] = useState<CommissionRecord[] | null>(null);
  const [previewSummary, setPreviewSummary] = useState<PreviewSummary | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleMonthChange = (m: string) => {
    setSelectedMonth(m);
    const mIdx = MONTH_NAMES.indexOf(m);
    if (mIdx !== -1) {
      setDaysInMonth(new Date(selectedYear, mIdx + 1, 0).getDate());
    }
  };

  const handleYearChange = (y: number) => {
    setSelectedYear(y);
    const mIdx = MONTH_NAMES.indexOf(selectedMonth);
    if (mIdx !== -1) {
      setDaysInMonth(new Date(y, mIdx + 1, 0).getDate());
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setParsedRecords(null);
    setPreviewSummary(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        handleFileSelect(file);
      } else {
        setErrorMessage('Please upload a valid Excel (.xlsx) file.');
      }
    }
  };

  const handleGeneratePreview = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select an Excel file first.');
      return;
    }

    setIsParsing(true);
    setErrorMessage(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const records = parseCommissionWorkbook(
        buffer,
        selectedFile.name,
        selectedMonth,
        selectedYear,
        daysInMonth
      );

      if (records.length === 0) {
        throw new Error('No valid commission rows found in the uploaded workbook.');
      }

      setParsedRecords(records);

      // Request server comparison preview
      const res = await fetch('/api/upload/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records,
          monthYear: `${selectedMonth} ${selectedYear}`,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.summary) {
          setPreviewSummary(json.summary);
        }
      } else {
        // Fallback preview
        let gross = 0, bc = 0, corp = 0;
        records.forEach((r) => {
          gross += r.netCommission;
          bc += r.bcComm;
          corp += r.corpComm;
        });
        const tds = Number((bc * 0.02).toFixed(2));
        setPreviewSummary({
          targetMonthYear: `${selectedMonth} ${selectedYear}`,
          totalAgentsFound: records.length,
          newAgentsCount: 0,
          missingFromPreviousMonthCount: 0,
          previousMonthName: 'Previous',
          fileTotals: {
            grossCommission: Number(gross.toFixed(2)),
            bcCommission: Number(bc.toFixed(2)),
            corpCommission: Number(corp.toFixed(2)),
            tdsDeduction: tds,
            netPayable: Number((bc - tds).toFixed(2)),
          },
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse the commission statement.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!parsedRecords || parsedRecords.length === 0) return;
    setIsSaving(true);
    try {
      await handleImportData(parsedRecords, selectedMonth, selectedYear, daysInMonth);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setParsedRecords(null);
      setPreviewSummary(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save statement.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setParsedRecords(null);
    setPreviewSummary(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={resetModal} className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150" />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#0A0A0A]">Upload Monthly Statement</h3>
            <p className="text-xs text-[#6B7280]">Select statement period and upload bank file with pre-save verification</p>
          </div>
          <button onClick={resetModal} className="text-[#6B7280] hover:text-[#0A0A0A] p-1 rounded-md hover:bg-[#F3F4F6] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Manual Period Picker */}
        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-2.5">
          <div className="text-xs font-bold text-[#0A0A0A]">Select Statement Period</div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-[#6B7280] mb-1 font-medium">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                disabled={!!previewSummary}
                className="w-full h-8 px-2 text-xs border border-[#CBD5E1] rounded bg-white font-semibold text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[#6B7280] mb-1 font-medium">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                disabled={!!previewSummary}
                className="w-full h-8 px-2 text-xs border border-[#CBD5E1] rounded bg-white font-semibold text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[#6B7280] mb-1 font-medium">Calendar Days</label>
              <input
                type="number"
                value={daysInMonth}
                onChange={(e) => setDaysInMonth(parseInt(e.target.value, 10) || 30)}
                disabled={!!previewSummary}
                min={28}
                max={31}
                className="w-full h-8 px-2 text-xs border border-[#CBD5E1] rounded bg-white font-semibold text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
              />
            </div>
          </div>
        </div>

        {/* 2. Drop Zone (When no preview yet) */}
        {!previewSummary && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-[#0A5C36] bg-[#F0FDF4]'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/40'
                : 'border-[#CBD5E1] bg-[#FAFAFA] hover:bg-[#F1F5F9]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-1.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <span className="text-xs font-bold text-[#0A0A0A] truncate max-w-xs">{selectedFile.name}</span>
                <span className="text-[11px] text-[#6B7280]">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for preview
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-[#9CA3AF]" />
                <div>
                  <p className="text-xs font-semibold text-[#0A0A0A]">
                    Drag & Drop bank Excel file or <span className="text-[#0A5C36] underline font-bold">browse</span>
                  </p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">Supports 40-column Sanjivani Commission sheets</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Preview Verification Step */}
        {previewSummary && (
          <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl space-y-3.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#DCFCE7] pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#15803D]" />
                <span className="text-xs font-bold text-[#166534]">Import Verification Preview</span>
              </div>
              <button
                onClick={() => setPreviewSummary(null)}
                className="text-[11px] text-[#0A5C36] hover:underline font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Change File</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border border-[#DCFCE7]">
                <span className="text-[10px] text-[#6B7280] block">Agents Found</span>
                <span className="text-base font-extrabold text-[#0A0A0A]">{previewSummary.totalAgentsFound}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#DCFCE7]">
                <span className="text-[10px] text-[#6B7280] block">New Agents</span>
                <span className="text-base font-extrabold text-[#0A5C36]">+{previewSummary.newAgentsCount}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#DCFCE7]">
                <span className="text-[10px] text-[#6B7280] block">Missing Prev.</span>
                <span className="text-base font-extrabold text-[#B45309]">{previewSummary.missingFromPreviousMonthCount}</span>
              </div>
            </div>

            {/* Financial Totals Breakdown */}
            <div className="p-3 bg-white rounded-lg border border-[#DCFCE7] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#374151]">
                <span>Gross Reconciled Commission:</span>
                <span className="font-bold text-[#0A0A0A] tabular-nums">
                  ₹{previewSummary.fileTotals.grossCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#166534]">
                <span>BCA Disbursement (80%):</span>
                <span className="font-bold tabular-nums">
                  ₹{previewSummary.fileTotals.bcCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#B91C1C]">
                <span>TDS Deduction (2%):</span>
                <span className="font-semibold tabular-nums">
                  -₹{previewSummary.fileTotals.tdsDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#15803D] pt-1.5 border-t border-[#F1F5F9] font-bold">
                <span>Net Payable to BCAs:</span>
                <span className="text-sm tabular-nums">
                  ₹{previewSummary.fileTotals.netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F3F4F6]">
          <button
            type="button"
            onClick={resetModal}
            className="px-3.5 py-2 text-xs font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {!previewSummary ? (
            <button
              type="button"
              onClick={handleGeneratePreview}
              disabled={!selectedFile || isParsing}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0A5C36] hover:bg-[#084B26] disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>{isParsing ? 'Parsing Statement...' : 'Preview Import'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmSave}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>{isSaving ? 'Saving to Database...' : 'Confirm & Save to Database'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
