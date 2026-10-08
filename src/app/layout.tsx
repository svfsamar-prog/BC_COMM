'use client';

import React from 'react';
import './globals.css';
import { CommissionProvider, useCommission } from '@/context/CommissionContext';
import { Navbar } from '@/components/Navbar';
import { SidebarDrawer } from '@/components/SidebarDrawer';
import { AgentDetailDrawer } from '@/components/AgentDetailDrawer';
import { UploadModal } from '@/components/UploadModal';
import { Footer } from '@/components/Footer';
import { Mail, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isUploadModalOpen,
    setIsUploadModalOpen,
    selectedAgent,
    setSelectedAgent,
    handleImportData,
    statementMonthLabel,
    records,
  } = useCommission();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans relative overflow-x-hidden selection:bg-emerald-600 selection:text-white">
      {/* 1. Official Sanjivani Foundation Top Bar (Matching sanjivani.foundation) */}
      <div className="bg-[#0f2942] text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Contact Details */}
          <div className="flex items-center space-x-4">
            <a
              href="mailto:info@sanjivani.foundation"
              className="flex items-center space-x-1.5 hover:text-white transition"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>info@sanjivani.foundation</span>
            </a>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <a
              href="tel:+916123530051"
              className="flex items-center space-x-1.5 hover:text-white transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>0612-3530051 / 2360350</span>
            </a>
          </div>

          {/* National Bank BC Partner Network & Live Status */}
          <div className="flex items-center space-x-3 text-[10.5px]">
            <span className="text-slate-400 font-medium hidden md:inline">
              BC Partner: <strong className="text-white">SBI • CBI • PNB • UBI • BOB • Canara</strong>
            </span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <div className="flex items-center space-x-1.5 bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">Live Supabase Node</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Executive Navbar */}
      <Navbar />

      {/* 3. Main Page Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {children}
      </main>

      {/* 4. Left Navigation Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectView={() => {}}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        statementMonth={statementMonthLabel}
        totalAgents={records.length}
      />

      {/* 5. Universal Right Slide-Over Agent Detail Panel */}
      <AgentDetailDrawer
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />

      {/* 6. Universal Monthly Statement Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleImportData}
      />

      {/* 7. Official Sanjivani Footer */}
      <Footer />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Sanjivani Vikas Foundation — Business Correspondent & Commission Portal</title>
        <meta
          name="description"
          content="Official Business Correspondent Commission & SSS Analytics Portal for Sanjivani Vikas Foundation"
        />
        <link rel="icon" href="https://res.cloudinary.com/date69bba/image/upload/v1791445720/favicon_tdi2sr.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="https://res.cloudinary.com/date69bba/image/upload/v1791445720/favicon_tdi2sr.ico" type="image/x-icon" />
      </head>
      <body className="antialiased">
        <CommissionProvider>
          <LayoutContent>{children}</LayoutContent>
        </CommissionProvider>
      </body>
    </html>
  );
}
