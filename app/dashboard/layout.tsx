import React from 'react';
import { Navbar } from '@/components/dashboard/Navbar';

export const metadata = {
  title: 'Officer Dashboard — BhoomiLens',
  description: 'Deterministic Land-Record Reconciliation & Decision Support System',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BhoomiLens &copy; 2026 — Government Land-Record Verification & Decision Support</span>
          <span className="font-mono text-[11px] text-slate-400">Deterministic Engine • Auditable • Human-in-the-Loop</span>
        </div>
      </footer>
    </div>
  );
}
