import React from 'react';
import Link from 'next/link';
import { STATUTORY_AUTHORITY_RULES } from '@/lib/authority/rules';

export const metadata = {
  title: 'Statutory Authority Matrix | BhoomiLens Officer Portal',
};

export default function AuthorityMatrixPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-mono font-medium text-slate-700">Authority Matrix</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Statutory Authority Precedence Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Legal precedence rules and departmental jurisdictions governing cross-registry reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            8 Codified Rules Active
          </span>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <span>Jurisdiction Conflict Resolution Framework</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          In the Indian land administration framework, multiple departments hold divergent records regarding the same geographic parcel. BhoomiLens resolves these multi-source discrepancies by strictly encoding statutory precedence rules (Registration Act, Survey Codes, Lis Pendens, Succession, and Environmental Laws).
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STATUTORY_AUTHORITY_RULES.map((rule) => (
          <div
            key={rule.rule_id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  {rule.rule_id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Rank #{rule.precedence_rank}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2.5">
                {rule.department}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                Scope: {rule.scope}
              </span>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {rule.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-2xl">
              <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider mb-0.5">
                Statutory Authority Reference:
              </span>
              <span className="font-mono text-indigo-900 font-bold">{rule.statutory_basis}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
