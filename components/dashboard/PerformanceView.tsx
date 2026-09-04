'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OfficerPerformanceSummary } from '@/lib/performance/performanceService';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

interface PerformanceViewProps {
  data: OfficerPerformanceSummary;
}

export function PerformanceView({ data }: PerformanceViewProps) {
  const { lang, t } = useLanguage();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Language Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-900 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              ⚖️
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.officerPerformance}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.accountabilityFlowDesc}
          </p>
        </div>

        {/* Action Buttons & Language Switch */}
        <div className="flex items-center gap-2">
          <LanguageToggle />

          <Link
            href="/dashboard/queue"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-xs"
          >
            <span>{t.priorityQueue}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Indian Aesthetic Notice Banner */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/70 via-white to-amber-50/50 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
            🏛️
          </div>
          <div className="flex-1 text-xs space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span>{t.operationalIntegrity}</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-100 text-blue-900 border border-blue-200">
                100% Deterministic Aggregation
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {data.methodologyNotice}
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Cases Assigned */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t.casesAssigned}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{data.casesAssigned}</span>
            <span className="text-xs text-slate-400 font-medium">/ {data.totalCases} total</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Allocated to verification officers</p>
        </div>

        {/* Under Verification */}
        <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-xs hover:border-blue-300 transition bg-blue-50/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
            {t.casesUnderVerification}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-900">{data.casesUnderVerification}</span>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          </div>
          <p className="text-[10px] text-blue-700 mt-1">Active field & record audits</p>
        </div>

        {/* Cases Resolved */}
        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs hover:border-emerald-300 transition bg-emerald-50/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            {t.casesResolved}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-900">{data.casesResolved}</span>
            <span className="text-xs text-emerald-700 font-semibold">✓ Justified</span>
          </div>
          <p className="text-[10px] text-emerald-700 mt-1">Reconciled with written orders</p>
        </div>

        {/* Cases Rejected / Dismissed */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t.casesRejected}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-700">{data.casesRejected}</span>
            <span className="text-xs text-slate-400 font-medium">dismissed</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Claims without legal merit</p>
        </div>

        {/* More Info Requested */}
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-xs hover:border-amber-300 transition bg-amber-50/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            {t.moreInfoRequested}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-900">{data.casesMoreInfoRequested}</span>
          </div>
          <p className="text-[10px] text-amber-700 mt-1">Pending sub-registrar query</p>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t.averageResolutionTime}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {data.averageResolutionFormatted}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">From assignment to determination</p>
        </div>

        {/* Audit Actions Recorded */}
        <div className="bg-white rounded-xl border border-indigo-200 p-4 shadow-xs hover:border-indigo-300 transition bg-indigo-50/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
            {t.auditActions}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-900">{data.totalAuditActions}</span>
            <span className="text-xs text-indigo-700 font-semibold">Immutable</span>
          </div>
          <p className="text-[10px] text-indigo-700 mt-1">Append-only trail entries</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t.completionRate}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{data.completionRatePercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, data.completionRatePercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Statutory Accountability Flow & Clarity Delineation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>🛡️</span>
            <span>{t.accountabilityFlowTitle}</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">SIH 2026 Architectural Compliance</span>
        </div>

        {/* Process Steps Visual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">1</span>
              <span className="text-[10px] font-mono text-slate-400">DETECT</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-slate-900">Conflict Flag</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Deterministic rule trigger</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">2</span>
              <span className="text-[10px] font-mono text-slate-400">ASSIGN</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-slate-900">Priority Queue</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Assigned to Officer</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-bold text-[10px] flex items-center justify-center">3</span>
              <span className="text-[10px] font-mono text-blue-700">VERIFY</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-blue-950">Investigation</div>
              <div className="text-[10px] text-blue-700 mt-0.5">Cross-source inquiry</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold text-[10px] flex items-center justify-center">4</span>
              <span className="text-[10px] font-mono text-emerald-700">RESOLVE</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-emerald-950">Statutory Order</div>
              <div className="text-[10px] text-emerald-700 mt-0.5">Justified determination</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-indigo-900 text-white font-bold text-[10px] flex items-center justify-center">5</span>
              <span className="text-[10px] font-mono text-indigo-700">AUDIT</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-indigo-950">Immutable Log</div>
              <div className="text-[10px] text-indigo-700 mt-0.5">Append-only trail</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-amber-900 text-white font-bold text-[10px] flex items-center justify-center">6</span>
              <span className="text-[10px] font-mono text-amber-700">METRICS</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-amber-950">Accountability</div>
              <div className="text-[10px] text-amber-700 mt-0.5">Transparent KPIs</div>
            </div>
          </div>
        </div>

        {/* Score Distinction Guide */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Score Boundary:</span>
            <span className="text-slate-600">
              <strong>Parcel Clarity</strong> (0–100 record cleanliness) ≠ <strong>Case Priority</strong> (Queue urgency) ≠ <strong>Officer Accountability</strong> (Operational throughput).
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-semibold text-slate-700 shrink-0">
            Pure Separation of Concerns
          </span>
        </div>
      </div>

      {/* Recent Statutory Audit Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">{t.recentActivity}</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700">
              {data.recentActivity.length} Events
            </span>
          </div>
          <span className="text-xs text-slate-500">Live Append-Only Feed</span>
        </div>

        {data.recentActivity.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No audit activity recorded yet. Reconcile parcels or transition cases to generate verifiable audit trails.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Parcel / Case</th>
                  <th className="px-4 py-3">Officer Role</th>
                  <th className="px-4 py-3">Note / Justification</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.recentActivity.map((item) => (
                  <tr key={item.auditLogId} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {item.formattedTime}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {item.formattedAction}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {item.ulpin ? `Parcel ULPIN: ${item.ulpin}` : 'System Log'}
                        </span>
                        {item.conflictType && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.conflictType}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span className="text-[11px] font-medium">{item.actorRole}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-600 truncate text-[11px]">
                      {item.note || <span className="text-slate-400 italic">No notes attached</span>}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {item.caseId ? (
                        <Link
                          href={`/dashboard/cases/${item.caseId}`}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                        >
                          <span>{t.viewCase}</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
