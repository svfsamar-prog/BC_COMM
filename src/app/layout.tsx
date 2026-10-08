'use client';

import React from 'react';
import './globals.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CommissionProvider } from '@/context/CommissionContext';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { AgentDetailDrawer } from '@/components/AgentDetailDrawer';
import { UploadModal } from '@/components/UploadModal';
import { usePathname } from 'next/navigation';

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Verification pages and Login page are COMPLETELY isolated (zero sidebar, zero topbar, zero tabs)
  const isIsolatedPage = pathname.startsWith('/verify') || pathname === '/login' || pathname === '/terms' || pathname === '/privacy';

  if (isIsolatedPage) {
    return <>{children}</>;
  }

  // Show clean spinner while loading auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#0A5C36] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via AuthContext
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0A0A0A] font-sans antialiased">
      {/* 1. Left Sidebar (Forest Green Theme) */}
      <Sidebar />

      {/* 2. Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 overflow-x-hidden">
        {/* Top Bar (Search, Live Date Clock, Profile SAMAR RAJ, Period, Upload, Export) */}
        <TopBar />

        {/* Page Content View */}
        <main className="flex-1 p-4 md:p-6 w-full mx-auto">
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
        <title>Sanjivani Vikas Foundation — BC Commission & Operations Portal</title>
        <meta
          name="description"
          content="Sanjivani Vikas Foundation — National Business Correspondent Commission, Management & Verification Portal"
        />
        <link
          rel="icon"
          href="https://res.cloudinary.com/date69bba/image/upload/v1774602823/SanjivaniVikasLogo_new_2_hpwra4.png"
          type="image/png"
        />
        <link
          rel="shortcut icon"
          href="https://res.cloudinary.com/date69bba/image/upload/v1774602823/SanjivaniVikasLogo_new_2_hpwra4.png"
          type="image/png"
        />
      </head>
      <body>
        <AuthProvider>
          <CommissionProvider>
            <AppShell>{children}</AppShell>
          </CommissionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
