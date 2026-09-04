'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CitizenPortalLandingPage() {
  const router = useRouter();
  const [searchUlpin, setSearchUlpin] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUlpin.trim()) {
      router.push(`/citizen/${searchUlpin.trim()}`);
    }
  };

  const quickPills = [
    {
      ulpin: 'ULPIN-P001',
      label: 'Clear Agricultural Parcel',
      desc: '100% Verified Clean Title',
      badge: 'Clear',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      ulpin: 'ULPIN-P004',
      label: 'Ancestral Ownership Dispute',
      desc: 'Deceased Person & Unfinalized Mutation',
      badge: 'Review Notice',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      ulpin: 'ULPIN-P007',
      label: 'Government / Poramboke Risk',
      desc: 'State Custody Inconsistency Flagged',
      badge: 'Critical Risk',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    {
      ulpin: 'ULPIN-P012',
      label: 'Circular Rapid Conveyance',
      desc: 'High Velocity Transaction Pattern',
      badge: 'High Priority',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      ulpin: 'ULPIN-P015',
      label: 'Multiple Simultaneous Disputes',
      desc: 'Area, Ownership, Court & Tax Discrepancies',
      badge: 'Multi-Conflict',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      {/* Citizen Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/citizen" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-black text-base shadow-sm">
                B
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  BhoomiLens
                </span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold -mt-0.5">
                  Citizen Portal • Bhu-Aadhaar Transparency
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
            >
              <span>Officer Portal</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero & Search Section */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Transparent Land Record Verification</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 max-w-2xl leading-tight">
          Search Your Land Parcel by ULPIN (Bhu-Aadhaar)
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
          Check cross-departmental record synchronization, view official boundary measurements, and verify if any title discrepancies are flagged for your property.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-xl mt-8">
          <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border-2 border-emerald-600/60 focus-within:border-emerald-700 bg-white">
            <div className="pl-4 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              required
              value={searchUlpin}
              onChange={(e) => setSearchUlpin(e.target.value)}
              placeholder="Enter 14-digit ULPIN (e.g., ULPIN-P001, ULPIN-P004)..."
              className="w-full text-sm py-4 px-3 text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="m-1.5 px-6 py-3 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-600 transition shadow-sm"
            >
              Verify Record
            </button>
          </div>
        </form>

        {/* Quick-Select Scenarios */}
        <div className="w-full max-w-2xl mt-10 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3 text-center">
            Or Test with Golden Cadastral Scenarios
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickPills.map((p) => (
              <Link
                key={p.ulpin}
                href={`/citizen/${p.ulpin}`}
                className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {p.ulpin}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{p.label}</span>
                  <span className="text-[11px] text-slate-500">{p.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Information Grid: What is ULPIN & How BhoomiLens Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-14 text-left">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="text-xs font-bold text-slate-900">What is ULPIN / Bhu-Aadhaar?</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Unique Land Parcel Identification Number is a 14-digit geospatial coordinate-based identifier assigned to every cadastral land parcel in India.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="text-xs font-bold text-slate-900">Cross-Department Reconciliation</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              BhoomiLens continuously cross-checks Registration Deeds, Revenue Khatoni, and Cadastral Survey maps to safeguard your legal rights.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="text-xs font-bold text-slate-900">Direct Citizen Clarifications</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Spotted a typo or boundary mismatch? Submit an instant clarification directly to your local revenue officer desk.
            </p>
          </div>
        </div>
      </main>

      {/* Citizen Portal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>BhoomiLens Citizen Portal &copy; 2026 — Public Land Records Transparency</span>
          <span className="font-mono text-[11px] text-slate-400">Unique Land Parcel Identification Number (ULPIN) Standard</span>
        </div>
      </footer>
    </div>
  );
}
