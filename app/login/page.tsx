import React from 'react';
import Link from 'next/link';
import { OfficerLoginForm } from '@/components/auth/OfficerLoginForm';
import { AshokaChakra } from '@/components/ui/AshokaChakra';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export const metadata = {
  title: 'Officer Login — BhoomiLens',
  description: 'Official Revenue Department Officer Authentication',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <AshokaChakra size={28} color="#1e3a8a" />
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-blue-900 transition">
                  BhoomiLens
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium -mt-0.5">
                  Land-Record Reconciliation
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/citizen"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs"
            >
              <span>Citizen Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <OfficerLoginForm />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BhoomiLens • SIH 2026 Decision Support System</span>
          <span className="text-[11px] text-slate-400">Application-Layer Append-Only Audit Trail</span>
        </div>
      </footer>
    </div>
  );
}
