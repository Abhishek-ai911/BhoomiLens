import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-sm">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white">BhoomiLens</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium -mt-0.5">
                SIH 2026 • Land-Record Reconciliation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/citizen"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              <span>Citizen Portal</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm"
            >
              <span>Officer Portal</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Deterministic Land-Record Intelligence</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight sm:leading-tight">
          Explainable Land-Record Reconciliation & Decision Support
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          BhoomiLens connects and cross-verifies disparate land-record sources, discovers inconsistencies, collects verifiable evidence, computes deterministic Clarity & Priority, and empowers officers and citizens with auditable transparency.
        </p>

        {/* Portal Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-12 text-left">
          {/* Officer Portal Card */}
          <Link
            href="/dashboard"
            className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/80 hover:bg-slate-800 transition-all group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Authorized Officers
                </span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                Officer Dashboard
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Access the real-time deterministic Priority Queue, view conflict evidence packages, inspect AI explanatory decision support briefings, and manage case verification workflows.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span>Open Dashboard & Priority Queue</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>

          {/* Citizen Portal Card */}
          <Link
            href="/citizen"
            className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-blue-500/80 hover:bg-slate-800 transition-all group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-blue-950 border border-blue-800 text-blue-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  Public Transparency
                </span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                Citizen Portal
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Lookup land parcels by ULPIN (Bhu-Aadhaar), check cross-departmental record integrity, inspect cadastral GIS maps, and submit official clarification requests.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <span>Search Land Records by ULPIN</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Quick ULPIN Quick-Select Ribbon */}
        <div className="w-full max-w-3xl mt-10 pt-8 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-3">
            Quick Verification by ULPIN:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { ulpin: 'ULPIN-P001', label: 'Clear Agricultural (P001)' },
              { ulpin: 'ULPIN-P004', label: 'Ancestral Ownership (P004)' },
              { ulpin: 'ULPIN-P007', label: 'Government Land (P007)' },
              { ulpin: 'ULPIN-P012', label: 'Circular Conveyance (P012)' },
              { ulpin: 'ULPIN-P015', label: 'Multi-Conflict (P015)' },
            ].map((item) => (
              <Link
                key={item.ulpin}
                href={`/citizen/${item.ulpin}`}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white border border-slate-700 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>BhoomiLens &copy; 2026 — Ministry of Rural Development / Land Records Department</span>
          <span className="font-mono text-[11px] text-slate-600">PostgreSQL • PostGIS • Supabase • Next.js</span>
        </div>
      </footer>
    </div>
  );
}
