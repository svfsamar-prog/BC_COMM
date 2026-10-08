'use client';

import React from 'react';
import './globals.css';
import { CommissionProvider } from '@/context/CommissionContext';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { AgentDetailDrawer } from '@/components/AgentDetailDrawer';
import { UploadModal } from '@/components/UploadModal';

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white text-[#0A0A0A] font-sans antialiased">
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content View */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* 3. Universal Detail Drawer */}
      <AgentDetailDrawer />

      {/* 4. Universal 1-Step Upload Modal */}
      <UploadModal />
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
        <title>Sanjivani BC Commission & Payout Portal</title>
        <meta
          name="description"
          content="Sanjivani Vikas Foundation — Minimalist Business Correspondent Commission & Payout Portal"
        />
        <link
          rel="icon"
          href="https://res.cloudinary.com/date69bba/image/upload/v1791445720/favicon_tdi2sr.ico"
          type="image/x-icon"
        />
        <link
          rel="shortcut icon"
          href="https://res.cloudinary.com/date69bba/image/upload/v1791445720/favicon_tdi2sr.ico"
          type="image/x-icon"
        />
      </head>
      <body>
        <CommissionProvider>
          <LayoutContent>{children}</LayoutContent>
        </CommissionProvider>
      </body>
    </html>
  );
}
