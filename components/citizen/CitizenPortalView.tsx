'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { submitCitizenGrievanceAction, CitizenGrievanceResult } from '@/app/actions/citizenActions';

const ParcelMap = dynamic(
  () => import('@/components/map/ParcelMap').then((mod) => mod.ParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-72 sm:h-80 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium">
        Loading Cadastral Map...
      </div>
    ),
  }
);

export interface PublicConflictSummary {
  conflict_type: string;
  public_title: string;
  public_description: string;
  sources_involved: string[];
}

export interface CitizenPortalData {
  parcel: {
    parcel_id: string;
    ulpin: string;
    geometry: any | null;
    area: number | null;
    classification: string | null;
  };
  clarityScore: number;
  priorityLevel: string;
  isClear: boolean;
  publicConflicts: PublicConflictSummary[];
  indexedDepartmentsCount: number;
}

interface CitizenPortalViewProps {
  data: CitizenPortalData;
}

export function CitizenPortalView({ data }: CitizenPortalViewProps) {
  const { parcel, clarityScore, isClear, publicConflicts, indexedDepartmentsCount } = data;

  // Grievance Form State
  const [citizenName, setCitizenName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [grievanceType, setGrievanceType] = useState('NAME_CORRECTION');
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<CitizenGrievanceResult | null>(null);

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await submitCitizenGrievanceAction({
        ulpin: parcel.ulpin,
        citizenName,
        contactNumber,
        grievanceType,
        description,
      });

      if (res.success) {
        setReceipt(res);
        setCitizenName('');
        setContactNumber('');
        setDescription('');
      } else {
        setFormError(res.error || 'Failed to submit grievance.');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/citizen"
            className="text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Search Another ULPIN</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-mono text-slate-700 font-medium">{parcel.ulpin}</span>
        </div>

        <Link
          href="/dashboard"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
        >
          Officer Portal &rarr;
        </Link>
      </div>

      {/* Main Status Hero Card */}
      <div
        className={`rounded-2xl border p-6 shadow-sm ${
          isClear
            ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-emerald-200'
            : 'bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-amber-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  isClear ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Land Record Status
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {isClear ? 'Record Status: Clear & Verified' : 'Notice: Record Discrepancy Flagged'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              {isClear
                ? 'All cross-departmental records for this parcel (Registration, Revenue, Cadastral Survey) are fully synchronized and exhibit zero active conflicts.'
                : 'A variance between official departmental records has been identified by the BhoomiLens automated engine and is currently undergoing human verification by the Revenue Department.'}
            </p>
          </div>

          {/* Clarity Score Pill */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center min-w-[160px] text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Record Clarity
            </span>
            <div className="text-3xl font-black font-mono mt-0.5 text-slate-900">
              {clarityScore}
              <span className="text-base text-slate-400 font-normal">/100</span>
            </div>
            <span
              className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isClear
                  ? 'bg-emerald-100 text-emerald-800'
                  : clarityScore < 50
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isClear ? 'High Integrity' : clarityScore < 50 ? 'Requires Review' : 'Moderate Variance'}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: GIS & Property Profile (Left) | Discrepancies & Transparency (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cadastral Map & Parcel Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Parcel Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900">Cadastral Boundary Map</h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {parcel.ulpin}
              </span>
            </div>

            {/* GIS Map */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <ParcelMap geometry={parcel.geometry} ulpin={parcel.ulpin} />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Survey Extent
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {parcel.area ? `${parcel.area.toLocaleString()} sq.m` : 'Not recorded'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Land Category
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {parcel.classification || 'Unclassified'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Departments Indexed
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {indexedDepartmentsCount} Sources
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Public Discrepancy Summary & Citizen Grievance Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Public Discrepancy Summary (if any) */}
          {!isClear && publicConflicts.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-amber-100 pb-2.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Public Discrepancy Notice ({publicConflicts.length})
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                The following variances were identified across departmental registries. Revenue officers have been notified for administrative review:
              </p>

              <div className="space-y-2.5 pt-1">
                {publicConflicts.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950">{c.public_title}</span>
                      <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      {c.public_description}
                    </p>
                    <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-1">
                      <span>Departments involved:</span>
                      <span className="font-medium text-slate-700">{c.sources_involved.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citizen Grievance & Clarification Submission Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Submit Land Record Clarification</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Citizen Desk
              </span>
            </div>

            {receipt ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Grievance Acknowledged</span>
                </div>

                <p className="text-emerald-800 leading-relaxed">
                  Your clarification request for parcel <strong className="font-mono">{parcel.ulpin}</strong> has been registered with the Revenue Grievance Desk.
                </p>

                <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tracking Number:</span>
                    <strong className="font-mono text-slate-900 text-xs">{receipt.trackingNumber}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Registered On:</span>
                    <span className="text-slate-700">
                      {receipt.submittedAt ? new Date(receipt.submittedAt).toLocaleDateString('en-IN') : 'Today'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-700">
                  Please preserve this tracking number for future inquiries with your local Tehsildar or Sub-Registrar office.
                </p>

                <button
                  type="button"
                  onClick={() => setReceipt(null)}
                  className="w-full py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition"
                >
                  Submit Another Clarification
                </button>
              </div>
            ) : (
              <form onSubmit={handleGrievanceSubmit} className="space-y-3 text-xs">
                <p className="text-slate-500 leading-relaxed">
                  If you hold an interest in this parcel and notice an incorrect name spelling, boundary issue, or unrecorded succession, submit a query directly to the verification queue:
                </p>

                {formError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px]">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g., Rajesh Kumar"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile / Contact (Optional)
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Query Type *
                  </label>
                  <select
                    value={grievanceType}
                    onChange={(e) => setGrievanceType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800"
                  >
                    <option value="NAME_CORRECTION">Name Spelling / Identity Correction</option>
                    <option value="BOUNDARY_DISPUTE">Cadastral Boundary / Area Clarification</option>
                    <option value="SUCCESSION_INHERITANCE">Inheritance / Succession Claim Update</option>
                    <option value="MUTATION_DELAY">Pending Mutation Regularization</option>
                    <option value="UNAUTHORIZED_TRANSACTION">Notice of Unauthorized Alienation</option>
                    <option value="OTHER">General Departmental Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clarification Details (Min 10 characters) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your query, deed numbers, or documents in your possession..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Submitting Grievance...</span>
                    </>
                  ) : (
                    <span>Submit Clarification Request</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
