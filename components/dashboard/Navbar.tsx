'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', active: pathname === '/dashboard' },
    { label: 'Priority Queue', href: '/dashboard/queue', active: pathname === '/dashboard/queue' },
    { label: 'Parcels (GIS)', href: '#', active: false, disabled: true, phase: 'Phase 2' },
    { label: 'Cases', href: '#', active: false, disabled: true, phase: 'Phase 2' },
    { label: 'Audit Trail', href: '#', active: false, disabled: true, phase: 'Phase 2' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                B
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  BhoomiLens
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium -mt-0.5">
                  Land-Record Reconciliation
                </span>
              </div>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 ml-2">
              Officer Portal
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.disabled) {
                return (
                  <span
                    key={link.label}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-slate-500 cursor-not-allowed select-none"
                    title={`${link.label} is scheduled for ${link.phase}`}
                  >
                    <span>{link.label}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                      {link.phase}
                    </span>
                  </span>
                );
              }

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    link.active
                      ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Status / Officer Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium">Deterministic Engine</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
                VO
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-semibold text-slate-200 leading-tight">Verification Officer</span>
                <span className="text-[10px] text-slate-400">Revenue Dept</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
