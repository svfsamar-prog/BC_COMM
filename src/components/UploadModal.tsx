'use client';

import React, { useState, useRef } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { parseCommissionWorkbook } from '@/lib/parser';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, setIsUploadModalOpen, handleImportData } = useCommission();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedMonth, setDetectedMonth] = useState<string>('AUGUST');
  const [detectedYear, setDetectedYear] = useState<number>(2026);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleFileDetection = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);

    // Attempt intelligent detection from filename
    const nameUpper = file.name.toUpperCase();
    for (const m of MONTH_NAMES) {
      if (nameUpper.includes(m)) {
        setDetectedMonth(m);
        break;
      }
    }

    const yearMatch = file.name.match(/\b(202\d)\b/);
    if (yearMatch) {
      setDetectedYear(parseInt(yearMatch[1], 10));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        handleFileDetection(file);
      } else {
        setErrorMessage('Please upload a valid Excel (.xlsx) file.');
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select an Excel file first.');
      return;
    }

    setIsParsing(true);
    setErrorMessage(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const parsedRecords = parseCommissionWorkbook(
        buffer,
        selectedFile.name,
        detectedMonth,
        detectedYear
      );

      if (parsedRecords.length === 0) {
        throw new Error('No valid commission rows found in the uploaded workbook.');
      }

      handleImportData(parsedRecords);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse the commission statement.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Dim Backdrop */}
      <div
        onClick={() => setIsUploadModalOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-[#E5E7EB] rounded-xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0A0A0A]">Upload Commission Statement</h3>
            <p className="text-xs text-[#6B7280]">Import monthly bank Excel file to calculate payouts</p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="text-[#6B7280] hover:text-[#0A0A0A] p-1 rounded-md hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
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
              ? 'border-[#0F2942] bg-[#F0F4F8]'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-50/40'
              : 'border-[#E5E7EB] bg-[#FAFAFA] hover:bg-[#F3F4F6]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileDetection(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-1.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <span className="text-xs font-semibold text-[#0A0A0A] truncate max-w-xs">{selectedFile.name}</span>
              <span className="text-[11px] text-[#6B7280]">
                {(selectedFile.size / 1024).toFixed(1)} KB • Ready to import
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-[#9CA3AF]" />
              <div>
                <p className="text-xs font-medium text-[#0A0A0A]">
                  Drop Excel file here or <span className="text-[#0F2942] underline font-semibold">browse</span>
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">Supports standard .xlsx monthly commission sheets</p>
              </div>
            </div>
          )}
        </div>

        {/* Detected Month & Fallback */}
        <div className="p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B7280] font-medium">Target Statement Period:</span>
            <span className="font-semibold text-[#0A0A0A]">
              {detectedMonth} {detectedYear}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E5E7EB]">
            <div>
              <label className="block text-[10px] text-[#6B7280] mb-0.5">Month</label>
              <select
                value={detectedMonth}
                onChange={(e) => setDetectedMonth(e.target.value)}
                className="w-full h-7 px-2 text-xs border border-[#E5E7EB] rounded bg-white"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#6B7280] mb-0.5">Year</label>
              <select
                value={detectedYear}
                onChange={(e) => setDetectedYear(parseInt(e.target.value, 10))}
                className="w-full h-7 px-2 text-xs border border-[#E5E7EB] rounded bg-white"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(false)}
            className="px-3.5 py-2 text-xs font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!selectedFile || isParsing}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2942] hover:bg-[#0A1D30] disabled:opacity-50 disabled:pointer-events-none rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {isParsing ? 'Importing...' : 'Import Statement'}
          </button>
        </div>
      </div>
    </div>
  );
};
