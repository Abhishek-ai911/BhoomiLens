'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginOfficerAction } from '@/app/actions/authActions';
import { AshokaChakra } from '@/components/ui/AshokaChakra';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function OfficerLoginForm() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg(lang === 'hi' ? 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें।' : 'Please enter both your officer email and password.');
      return;
    }

    startTransition(async () => {
      const result = await loginOfficerAction({
        email: email.trim(),
        password,
      });

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setErrorMsg(result.error || (lang === 'hi' ? 'अमान्य अधिकारी क्रेडेंशियल्स।' : 'Invalid officer credentials. Please check your email and password.'));
      }
    });
  };

  const handleDemoFill = () => {
    setEmail('officer@bhoomilens.gov.in');
    setPassword('Officer@2026');
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        {/* Emblem & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 border border-blue-200 text-blue-900 shadow-xs mb-1">
            <AshokaChakra size={34} color="#1e3a8a" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {lang === 'hi' ? 'अधिकारी पोर्टल लॉगिन' : 'Officer Portal Login'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {lang === 'hi'
              ? 'राजस्व एवं भू-अभिलेख विभाग • आधिकारिक सत्यापन'
              : 'Revenue & Land Records Department • Official Authentication'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
            <span className="text-rose-600 font-bold shrink-0">⚠️</span>
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {lang === 'hi' ? 'अधिकारी ईमेल पता' : 'Officer Official Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@bhoomilens.gov.in"
              required
              disabled={isPending}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition disabled:bg-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {lang === 'hi' ? 'पासवर्ड' : 'Security Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isPending}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition disabled:bg-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{lang === 'hi' ? 'प्रमाणीकरण जारी है...' : 'Authenticating Officer...'}</span>
              </>
            ) : (
              <>
                <span>{lang === 'hi' ? 'सुरक्षित लॉगिन' : 'Authenticate & Sign In'}</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick-Assist */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              {lang === 'hi' ? 'परीक्षण हेतु डेमो खाता' : 'Evaluator Demo Account'}
            </span>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-[10px] font-bold text-blue-900 hover:text-blue-700 underline cursor-pointer"
            >
              {lang === 'hi' ? 'स्वतः भरें (Fill Demo)' : 'Auto-Fill Credentials'}
            </button>
          </div>
          <div className="font-mono text-[11px] text-slate-600 space-y-0.5">
            <div>Email: <span className="font-semibold text-slate-800">officer@bhoomilens.gov.in</span></div>
            <div>Password: <span className="font-semibold text-slate-800">Officer@2026</span></div>
          </div>
        </div>

        {/* Citizen Portal Distinction */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {lang === 'hi' ? 'नागरिक सार्वजनिक पार्सल खोज?' : 'Looking for public citizen record search?'}
          </p>
          <Link
            href="/citizen"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 mt-1"
          >
            <span>{lang === 'hi' ? 'नागरिक पोर्टल पर जाएं (लॉगिन की आवश्यकता नहीं)' : 'Go to Citizen Portal (Public ULPIN Lookup — No Login Required)'}</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
