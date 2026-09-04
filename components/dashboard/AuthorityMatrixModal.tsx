'use client';

import React, { useState } from 'react';
import { STATUTORY_AUTHORITY_RULES, AuthorityRule } from '@/lib/authority/rules';

export { STATUTORY_AUTHORITY_RULES };
export type { AuthorityRule };

interface AuthorityMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightRuleId?: string;
}

export function AuthorityMatrixModal({
  isOpen,
  onClose,
  highlightRuleId,
}: AuthorityMatrixModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredRules = STATUTORY_AUTHORITY_RULES.filter(
    (r) =>
      r.rule_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.statutory_basis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              AM
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Statutory Authority Precedence Matrix</h2>
              <p className="text-xs text-slate-300">
                Departmental jurisdiction hierarchy & statutory weight for cross-record reconciliation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-lg leading-none transition"
          >
            &times;
          </button>
        </div>

        {/* Search / Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by rule, department, statutory Act, or scope..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {filteredRules.length} of {STATUTORY_AUTHORITY_RULES.length} Rules
          </span>
        </div>

        {/* Rules Table / Cards */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {filteredRules.map((rule) => {
            const isHighlighted = highlightRuleId === rule.rule_id;

            return (
              <div
                key={rule.rule_id}
                className={`p-4 rounded-xl border transition ${
                  isHighlighted
                    ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {rule.rule_id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {rule.department}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                      {rule.scope}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 mt-2 font-medium leading-relaxed">
                  {rule.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Statutory Basis:</span>
                    <span className="font-mono text-indigo-700 font-medium">{rule.statutory_basis}</span>
                  </div>
                  <div>
                    <span>Precedence Tier: </span>
                    <strong className="text-slate-800 font-mono">Rank #{rule.precedence_rank}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Authority Precedence is deterministically coded into detector heuristics.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
