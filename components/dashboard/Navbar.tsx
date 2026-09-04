'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutOfficerAction } from '@/app/actions/authActions';
import { AshokaChakra } from '@/components/ui/AshokaChakra';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', active: pathname === '/dashboard' },
    { label: 'Priority Queue', href: '/dashboard/queue', active: pathname === '/dashboard/queue' },
    { label: 'Authority Matrix', href: '/dashboard/authority', active: pathname === '/dashboard/authority' },
    { label: 'Performance', href: '/dashboard/performance', active: pathname === '/dashboard/performance' },
    { label: 'Citizen Portal', href: '/citizen', active: pathname.startsWith('/citizen') },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-white shadow-xs">
                <AshokaChakra size={22} color="#93c5fd" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  BhoomiLens
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium -mt-0.5">
                  Land-Record Reconciliation
                </span>
              </div>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800 ml-2">
              Officer Portal
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
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
            ))}
          </nav>

          {/* Right Header Status / Officer Info / Language / Logout */}
          <div className="flex items-center gap-3">
            <LanguageToggle variant="dark" />

            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium">Deterministic Engine</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center text-xs font-semibold text-blue-200">
                VO
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-semibold text-slate-200 leading-tight">Verification Officer</span>
                <span className="text-[10px] text-slate-400">Revenue Dept</span>
              </div>
            </div>

            {/* Officer Sign Out Form */}
            <form action={logoutOfficerAction} className="pl-1">
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                title="Sign Out of Officer Session"
              >
                <span>Logout</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
