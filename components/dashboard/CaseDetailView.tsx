'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CaseDetailData } from '@/lib/cases/types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { ClarityMeter } from './ClarityMeter';

// Dynamic import of ParcelMap to ensure client-only MapLibre rendering
const ParcelMap = dynamic(
  () => import('@/components/map/ParcelMap').then((mod) => mod.ParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-72 sm:h-80 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium">
        Loading GIS Map...
      </div>
    ),
  }
);

interface CaseDetailViewProps {
  data: CaseDetailData;
}

const CONFLICT_TITLES: Record<string, string> = {
  OWNERSHIP_CONFLICT: 'Ownership Record Mismatch',
  MUTATION_CONFLICT: 'Unfinalized / Pending Mutation',
  LIFECYCLE_CONFLICT: 'Deceased Person / Succession Anomaly',
  AREA_MISMATCH: 'Area Variance (Survey vs Registration)',
  BOUNDARY_ANOMALY: 'Cadastral Boundary Inconsistency',
  LAND_USE_CONFLICT: 'Zoning / Land-Use Unauthorized Conversion',
  GOVERNMENT_LAND_RISK: 'Government / State Custody Risk',
  MISSING_RECORD_CONFLICT: 'Missing or Unavailable Departmental Record',
  COURT_CONFLICT: 'Active Judicial Lis Pendens / Injunction',
  MULTIPLE_ENCUMBRANCE: 'Multiple Active Mortgage / Bank Charges',
  UNUSUAL_TRANSACTION_VELOCITY: 'High Transaction Velocity',
  CIRCULAR_TRANSACTION: 'Circular / Rapid Re-conveyance Pattern',
  RECURRING_ENTITY: 'Recurring Transferee / Intermediary Entity',
  TAX_CONFLICT: 'Outstanding Revenue / Municipal Tax Dues',
};

const OPEN_WORLD_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PRESENT: { label: 'PRESENT', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  NOT_FOUND: { label: 'NOT FOUND', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CONFIRMED_ABSENT: { label: 'CONFIRMED ABSENT', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  CONFLICTING: { label: 'CONFLICTING', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  UNAVAILABLE: { label: 'UNAVAILABLE', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
};

export function CaseDetailView({ data }: CaseDetailViewProps) {
  const {
    case: c,
    conflict,
    parcel,
    interests,
    records,
    transactions,
    scores,
    allParcelConflicts,
  } = data;

  const [copiedCaseId, setCopiedCaseId] = useState(false);

  const handleCopyCaseId = () => {
    navigator.clipboard.writeText(c.case_id);
    setCopiedCaseId(true);
    setTimeout(() => setCopiedCaseId(false), 2000);
  };

  const conflictTitle = CONFLICT_TITLES[conflict.conflict_type] || conflict.conflict_type.replace(/_/g, ' ');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/queue"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Priority Queue</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-mono font-medium text-slate-500">Case Details</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">ULPIN:</span>
          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            {parcel.ulpin}
          </span>
        </div>
      </div>

      {/* Main Case Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {conflictTitle}
              </h1>
              <StatusBadge status={c.status} />
              <PriorityBadge priority={scores.priority.priority} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Case ID:</span>
                <span className="font-mono text-slate-900">{c.case_id}</span>
                <button
                  onClick={handleCopyCaseId}
                  title="Copy Case ID"
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  {copiedCaseId ? (
                    <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <span>•</span>
              <div>
                <span className="text-slate-500">Created:</span>{' '}
                <span className="font-medium text-slate-700">
                  {new Date(c.created_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <span>•</span>
              <div>
                <span className="text-slate-500">Assigned Officer:</span>{' '}
                <span className="font-medium text-slate-700 font-mono">
                  {c.assigned_to ? c.assigned_to : 'Unassigned (Open Queue)'}
                </span>
              </div>
            </div>
          </div>

          {/* Clarity Meter */}
          <div className="w-full lg:w-72 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
            <ClarityMeter score={scores.clarity.score} size="md" />
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Deterministic Deductions</span>
              <span className="font-bold text-slate-700">
                -{100 - scores.clarity.score} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spatial, Parcel & Source Records (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Parcel Profile & GIS Map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900">Parcel GIS & Profile</h2>
              </div>
              <span className="text-xs font-mono text-slate-500">{parcel.ulpin}</span>
            </div>

            {/* Parcel Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[11px] font-medium">Cadastral Area</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {parcel.area ? `${parcel.area.toLocaleString()} sq.m` : 'Not recorded'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[11px] font-medium">Classification</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {parcel.classification || 'Unclassified'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[11px] font-medium">Recorded Interests</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {interests.length} {interests.length === 1 ? 'Party' : 'Parties'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[11px] font-medium">Cross-Dept Records</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {records.length} Documents
                </span>
              </div>
            </div>

            {/* Interactive MapLibre Map */}
            <div>
              <ParcelMap geometry={parcel.geometry} ulpin={parcel.ulpin} />
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Parcel UUID: {parcel.parcel_id}
            </div>
          </div>

          {/* 2. Source Records Table (Open-World Data) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h2 className="text-sm font-bold text-slate-900">Source Records & Open-World Status</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {records.length} {records.length === 1 ? 'Record' : 'Records'} Indexed
              </span>
            </div>

            {records.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                No departmental records currently indexed for this parcel.
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((rec) => {
                  const badge = OPEN_WORLD_BADGES[rec.status] || {
                    label: rec.status,
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                  };

                  const isCitedInConflict = conflict.evidence.record_ids.includes(rec.record_id);

                  return (
                    <div
                      key={rec.record_id}
                      className={`p-3.5 rounded-xl border transition ${
                        isCitedInConflict
                          ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            {rec.record_type}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            via <strong className="text-slate-700 font-semibold">{rec.source}</strong>
                          </span>
                        </div>

                        {isCitedInConflict && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                            Cited in Conflict
                          </span>
                        )}
                      </div>

                      {/* Record Details & Payload */}
                      <div className="mt-2.5 text-xs text-slate-600 space-y-1">
                        {rec.person_name && (
                          <div>
                            <span className="text-slate-500">Named Party:</span>{' '}
                            <strong className="text-slate-800">{rec.person_name}</strong>
                          </div>
                        )}

                        {rec.payload && (
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 overflow-x-auto">
                            {Object.entries(rec.payload).map(([k, v]) => (
                              <div key={k} className="inline-block mr-4">
                                <span className="text-slate-400">{k}:</span>{' '}
                                <span className="text-slate-900 font-semibold">
                                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                          <span>ID: {rec.record_id}</span>
                          {rec.valid_from && (
                            <span>
                              Valid: {new Date(rec.valid_from).toLocaleDateString('en-IN')}
                              {rec.valid_to ? ` to ${new Date(rec.valid_to).toLocaleDateString('en-IN')}` : ' (Ongoing)'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Conflict Evidence, Interests, Transactions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Conflict & Deterministic Evidence Package */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <h2 className="text-sm font-bold text-slate-900">Deterministic Evidence</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase font-mono">
                {conflict.conflict_type}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* What */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  1. What Was Detected
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                  {conflict.evidence.what}
                </div>
              </div>

              {/* Why */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  2. Why It Requires Review
                </span>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-amber-950 leading-relaxed font-medium">
                  {conflict.evidence.why}
                </div>
              </div>

              {/* Sources & Records Cited */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Sources Compared
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {conflict.evidence.source.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Records Cited
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {conflict.evidence.record_ids.map((rId) => (
                      <span
                        key={rId}
                        className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200"
                      >
                        {rId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Authority Rule (if present) */}
              {conflict.evidence.authority && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Statutory / Authority Rule
                  </span>
                  <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-200 text-indigo-900 text-xs font-semibold">
                    {conflict.evidence.authority}
                  </div>
                </div>
              )}

              {/* Objective Decision Support Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <strong>Officer Notice:</strong> BhoomiLens is an explainable decision-support system. It highlights deterministic variances between official records for human verification and does not make automated legal declarations.
              </div>
            </div>
          </div>

          {/* 2. Interests & Ownership Model (interests -> persons) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900">Interests & Legal Rights</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {interests.length} Registered {interests.length === 1 ? 'Interest' : 'Interests'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              In the BhoomiLens normalized data model, ownership and interest claims are represented through relations between <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-mono">interests</code> and <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-mono">persons</code>.
            </p>

            {interests.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                No active interests or rights recorded for this parcel.
              </div>
            ) : (
              <div className="space-y-2.5">
                {interests.map((inst) => (
                  <div
                    key={inst.interest_id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 text-sm font-bold">{inst.person_name}</strong>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {inst.interest_type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                      <span>
                        Share:{' '}
                        <strong className="text-slate-800">
                          {inst.share !== null ? `${Math.round(inst.share * 100)}%` : 'Undivided'}
                        </strong>
                      </span>
                      <span>
                        Status:{' '}
                        <span className="font-semibold text-slate-700">{inst.status || 'ACTIVE'}</span>
                      </span>
                    </div>

                    {inst.valid_from && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Valid: {new Date(inst.valid_from).toLocaleDateString('en-IN')}
                        {inst.valid_to ? ` to ${new Date(inst.valid_to).toLocaleDateString('en-IN')}` : ' (Active)'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Transaction History Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <h2 className="text-sm font-bold text-slate-900">Transaction History</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {transactions.length} Recorded {transactions.length === 1 ? 'Transfer' : 'Transfers'}
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                No past transactions recorded for this parcel.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((t, idx) => (
                  <div
                    key={t.transaction_id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs relative pl-6 space-y-1"
                  >
                    {/* Timeline bullet */}
                    <div className="absolute left-2.5 top-4 w-2 h-2 rounded-full bg-violet-500" />

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {t.from_person_name} &rarr; {t.to_person_name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Date:{' '}
                        <strong className="text-slate-700">
                          {new Date(t.occurred_at).toLocaleDateString('en-IN')}
                        </strong>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {t.transaction_id.substring(0, 12)}...
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Simultaneous Parcel Conflicts (if more than 1) */}
          {allParcelConflicts.length > 1 && (
            <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-4 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Simultaneous Conflicts on this Parcel ({allParcelConflicts.length})</span>
              </h3>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                This parcel has {allParcelConflicts.length} concurrent deterministic conflicts detected across departments.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allParcelConflicts.map((cRow) => (
                  <span
                    key={cRow.conflict_id}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cRow.conflict_id === conflict.conflict_id
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-amber-900 border border-amber-300'
                    }`}
                  >
                    {cRow.conflict_type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
