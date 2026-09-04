import React from 'react';
import Link from 'next/link';
import { AshokaChakra } from '@/components/ui/AshokaChakra';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-white shadow-xs">
              <AshokaChakra size={22} color="#93c5fd" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white">BhoomiLens</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium -mt-0.5">
                SIH 2026 • Land-Record Reconciliation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle variant="dark" />
            <Link
              href="/citizen"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition shadow-2xs"
            >
              <span>Citizen Portal</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-800 text-white hover:bg-blue-700 transition shadow-xs"
            >
              <span>Officer Login</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-blue-300 mb-6 shadow-xs">
          <AshokaChakra size={16} color="#93c5fd" />
          <span>Deterministic Land-Record Intelligence & Decision Support</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight sm:leading-tight">
          Explainable Land-Record Reconciliation & Decision Support
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          BhoomiLens cross-verifies disparate revenue, registration, and survey records, detects discrepancies deterministically, builds verifiable evidence trails, computes Clarity & Priority, and empowers officers and citizens with transparent accountability.
        </p>

        {/* Portal Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-12 text-left">
          {/* Officer Portal Login Card */}
          <Link
            href="/login"
            className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-blue-500/80 hover:bg-slate-800 transition-all group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-blue-950 border border-blue-800 text-blue-300">
                  <AshokaChakra size={24} color="#93c5fd" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Authenticated Access
                </span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                Officer Portal & Login
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Securely authenticate to access the real-time deterministic Priority Queue, view multi-source evidence, inspect AI explanatory briefings, and execute human review workflows.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <span>Sign In as Authorized Officer</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>

          {/* Citizen Portal Card */}
          <Link
            href="/citizen"
            className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/80 hover:bg-slate-800 transition-all group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Public Access • No Login Required
                </span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                Citizen Portal
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Public ULPIN search allowing citizens to check the record clarity score of any parcel, view registered discrepancy notices, inspect cadastral GIS boundaries, and submit clarifications.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span>Search Parcel by ULPIN</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </div>

        {/* SIH 2026 6-Pillar Architecture Summary */}
        <div className="mt-16 w-full max-w-4xl p-6 rounded-2xl bg-slate-800/40 border border-slate-800 text-left">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              SIH 2026 Core Architecture & Principles
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-blue-400 font-bold block mb-1">01. Dual Interface</span>
              <span className="text-slate-400 text-[11px]">Officer decision support + public citizen ULPIN search.</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-blue-400 font-bold block mb-1">02. Unified Land Identity</span>
              <span className="text-slate-400 text-[11px]">Parcel ↔ ULPIN ↔ Associated Person ↔ Masked Demo ID.</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-blue-400 font-bold block mb-1">03. Multi-Source Engine</span>
              <span className="text-slate-400 text-[11px]">Deterministic cross-verification across 8 departments.</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-blue-400 font-bold block mb-1">04. Complete Audit Trail</span>
              <span className="text-slate-400 text-[11px]">Application-Layer Append-Only Audit Trail for every action.</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-blue-400 font-bold block mb-1">05. Risk & Anomaly Detection</span>
              <span className="text-slate-400 text-[11px]">Rapid velocity & circular transfer pattern discovery.</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-blue-400 font-bold block mb-1">06. Officer Accountability</span>
              <span className="text-slate-400 text-[11px]">Deterministic performance metrics derived from real logs.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BhoomiLens • SIH 2026 Decision Support System</span>
          <span className="text-[11px] text-slate-400">Application-Layer Append-Only Audit Trail</span>
        </div>
      </footer>
    </div>
  );
}
