'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AshokaChakra } from '@/components/ui/AshokaChakra';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CitizenPortalLandingPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
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
      label: lang === 'hi' ? 'स्पष्ट कृषि पार्सल' : 'Clear Agricultural Parcel',
      desc: lang === 'hi' ? '100% सत्यापित स्पष्ट विलेख' : '100% Verified Clean Title',
      badge: lang === 'hi' ? 'स्पष्ट' : 'Clear',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      ulpin: 'ULPIN-P004',
      label: lang === 'hi' ? 'पैतृक स्वामित्व विसंगति' : 'Ancestral Ownership Dispute',
      desc: lang === 'hi' ? 'मृतक व्यक्ति एवं लंबित दाखिल खारिज' : 'Deceased Person & Unfinalized Mutation',
      badge: lang === 'hi' ? 'पुनरावलोकन नोटिस' : 'Review Notice',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      ulpin: 'ULPIN-P007',
      label: lang === 'hi' ? 'सरकारी / गैर मुमकिन भूमि जोखिम' : 'Government / Poramboke Risk',
      desc: lang === 'hi' ? 'राज्य अभिरक्षा विसंगति चिह्नित' : 'State Custody Inconsistency Flagged',
      badge: lang === 'hi' ? 'गंभीर जोखिम' : 'Critical Risk',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    {
      ulpin: 'ULPIN-P012',
      label: lang === 'hi' ? 'चक्रीय तीव्र अंतरण' : 'Circular Rapid Conveyance',
      desc: lang === 'hi' ? 'उच्च वेग अंतरण पैटर्न' : 'High Velocity Transaction Pattern',
      badge: lang === 'hi' ? 'उच्च प्राथमिकता' : 'High Priority',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      ulpin: 'ULPIN-P015',
      label: lang === 'hi' ? 'एकाधिक समवर्ती विसंगतियां' : 'Multiple Simultaneous Disputes',
      desc: lang === 'hi' ? 'क्षेत्रफल, स्वामित्व, न्यायालय एवं कर विसंगति' : 'Area, Ownership, Court & Tax Discrepancies',
      badge: lang === 'hi' ? 'बहु-विवाद' : 'Multi-Conflict',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      {/* Citizen Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/citizen" className="flex items-center gap-2.5">
              <AshokaChakra size={26} color="#1e3a8a" />
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  BhoomiLens
                </span>
                <span className="text-[10px] uppercase tracking-wider text-blue-900 font-bold -mt-0.5">
                  {lang === 'hi' ? 'नागरिक पोर्टल • भू-आधार पारदर्शिता' : 'Citizen Portal • Bhu-Aadhaar Transparency'}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
            >
              <span>{lang === 'hi' ? 'अधिकारी लॉगिन' : 'Officer Login'}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero & Search Section */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900 mb-4">
          <AshokaChakra size={14} color="#1e3a8a" />
          <span>{lang === 'hi' ? 'पारदर्शी भू-अभिलेख सत्यापन' : 'Transparent Land Record Verification'}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 max-w-2xl leading-tight">
          {lang === 'hi' ? 'अपने भूमि पार्सल को ULPIN (भू-आधार) द्वारा खोजें' : 'Search Your Land Parcel by ULPIN (Bhu-Aadhaar)'}
        </h1>

        <p className="mt-3 text-sm text-slate-600 max-w-xl leading-relaxed">
          {lang === 'hi'
            ? 'विभिन्न सरकारी विभागों (पंजीयन, राजस्व, कैडस्ट्रल सर्वेक्षण) में दर्ज अपने पार्सल की स्थिति, स्पष्टता स्कोर एवं विसंगति नोटिस की सार्वजनिक जांच करें।'
            : 'Instantly verify cross-departmental records (Registration, Revenue, Cadastral GIS) for any parcel in Rajasthan. View clarity scores, discrepancy notices, and cadastral boundaries.'}
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="w-full max-w-xl mt-8">
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl border border-slate-300 shadow-md focus-within:border-blue-900 focus-within:ring-2 focus-within:ring-blue-900/20 transition">
            <div className="flex items-center gap-2 flex-1 w-full px-3">
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchUlpin}
                onChange={(e) => setSearchUlpin(e.target.value)}
                placeholder="e.g. ULPIN-P001, ULPIN-P004..."
                className="w-full text-sm font-mono text-slate-900 bg-transparent outline-none placeholder:text-slate-400 placeholder:font-sans"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>{lang === 'hi' ? 'पार्सल खोजें' : 'Verify Parcel'}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>

        {/* Quick Demo Parcels */}
        <div className="w-full max-w-2xl mt-10 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === 'hi' ? 'डेमो पार्सल उदाहरण (SIH स्वर्ण परिदृश्य)' : 'Demo Parcels (SIH Golden Scenarios)'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Click to test instant lookup</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickPills.map((pill) => (
              <button
                key={pill.ulpin}
                type="button"
                onClick={() => router.push(`/citizen/${pill.ulpin}`)}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-900/60 hover:shadow-xs transition text-left flex items-start justify-between gap-2 group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-blue-900 transition">
                      {pill.ulpin}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${pill.badgeColor}`}>
                      {pill.badge}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-1">{pill.label}</div>
                  <div className="text-[10px] text-slate-400">{pill.desc}</div>
                </div>
                <span className="text-slate-300 group-hover:text-blue-900 group-hover:translate-x-0.5 transition font-bold">
                  &rarr;
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BhoomiLens Citizen Portal • SIH 2026</span>
          <span className="text-[11px] text-slate-400">Public ULPIN Verification • Application-Layer Append-Only Audit Trail</span>
        </div>
      </footer>
    </div>
  );
}
