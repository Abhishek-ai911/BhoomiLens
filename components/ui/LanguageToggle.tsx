'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  variant?: 'light' | 'dark' | 'outline';
}

export function LanguageToggle({ className = '', variant = 'outline' }: LanguageToggleProps) {
  const { lang, toggleLanguage } = useLanguage();

  let variantStyles = 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100';
  if (variant === 'dark') {
    variantStyles = 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700';
  } else if (variant === 'light') {
    variantStyles = 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
  }

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition shadow-2xs ${variantStyles} ${className}`}
      title="Toggle Language / भाषा बदलें"
      aria-label="Toggle Language / भाषा बदलें"
    >
      <span className="text-sm">🌐</span>
      <span>{lang === 'en' ? 'हिन्दी (Hindi)' : 'English'}</span>
    </button>
  );
}
