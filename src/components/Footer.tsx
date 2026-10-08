import React from 'react';
import Link from 'next/link';
import { Shield, FileCheck, Lock, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f2942] text-slate-300 text-xs py-10 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
          {/* Logo & Description */}
          <div className="flex items-center space-x-4">
            <div className="h-10 w-32 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-xs">
              <img
                src="https://res.cloudinary.com/date69bba/image/upload/v1774602823/SanjivaniVikasLogo_new_2_hpwra4.png"
                alt="Sanjivani Vikas Foundation Logo"
                className="max-h-8 max-w-full object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-white text-sm tracking-wide">
                Sanjivani Vikas Foundation
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                National Business Correspondent & Financial Inclusion Network
              </p>
            </div>
          </div>

          {/* Contact & Help Links */}
          <div className="flex items-center space-x-6 text-xs font-semibold">
            <Link
              href="/privacy"
              className="flex items-center space-x-1.5 text-slate-300 hover:text-emerald-400 transition"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Privacy Policy</span>
            </Link>
            <Link
              href="/terms"
              className="flex items-center space-x-1.5 text-slate-300 hover:text-emerald-400 transition"
            >
              <FileCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Terms & Conditions</span>
            </Link>
            <a
              href="https://sanjivani.foundation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition"
            >
              sanjivani.foundation ↗
            </a>
          </div>
        </div>

        {/* Copyright & Regulatory Notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Sanjivani Vikas Foundation. All rights reserved.</p>
          <p className="text-slate-400">
            Internal Banking Correspondent Settlement Portal • Strict Confidentiality Required
          </p>
        </div>
      </div>
    </footer>
  );
};
