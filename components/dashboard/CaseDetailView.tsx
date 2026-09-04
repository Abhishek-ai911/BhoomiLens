'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CaseDetailData, DatabaseCase, ActionPayload, CaseAction } from '@/lib/cases/types';
import { transitionCaseAction } from '@/app/actions/caseActions';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { ClarityMeter } from './ClarityMeter';
import { CaseAuditTimeline } from './CaseAuditTimeline';
import { AiExplanationCard } from './AiExplanationCard';
import { AuthorityMatrixModal } from './AuthorityMatrixModal';

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

interface ModalConfig {
  isOpen: boolean;
  action: 'RESOLVE' | 'REJECT' | 'REQUEST_MORE_INFO' | null;
  title: string;
  description: string;
  label: string;
  placeholder: string;
  confirmButtonText: string;
  confirmButtonClass: string;
}

export function CaseDetailView({ data }: CaseDetailViewProps) {
  const router = useRouter();
  const {
    case: initialCase,
    conflict,
    parcel,
    interests,
    records,
    transactions,
    scores,
    allParcelConflicts,
    auditLogs = [],
  } = data;

  const [currentCase, setCurrentCase] = useState<DatabaseCase>(initialCase);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedCaseId, setCopiedCaseId] = useState(false);
  const [showAuthorityModal, setShowAuthorityModal] = useState(false);

  // Justification Modal State
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    action: null,
    title: '',
    description: '',
    label: '',
    placeholder: '',
    confirmButtonText: '',
    confirmButtonClass: '',
  });
  const [modalInput, setModalInput] = useState('');

  const handleCopyCaseId = () => {
    navigator.clipboard.writeText(currentCase.case_id);
    setCopiedCaseId(true);
    setTimeout(() => setCopiedCaseId(false), 2000);
  };

  const conflictTitle = CONFLICT_TITLES[conflict.conflict_type] || conflict.conflict_type.replace(/_/g, ' ');

  // Direct Action: Assign to Me (OPEN -> ASSIGNED)
  const handleAssign = () => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await transitionCaseAction({
        caseId: currentCase.case_id,
        action: 'ASSIGN',
      });

      if (res.success && res.case) {
        setCurrentCase(res.case);
        setActionSuccess('Case successfully assigned to your officer profile.');
        router.refresh();
      } else {
        setActionError(res.error || 'Failed to assign case.');
      }
    });
  };

  // Direct Action: Start Verification (ASSIGNED -> UNDER_VERIFICATION)
  const handleStartVerification = () => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await transitionCaseAction({
        caseId: currentCase.case_id,
        action: 'START_VERIFICATION',
      });

      if (res.success && res.case) {
        setCurrentCase(res.case);
        setActionSuccess('Verification commenced. Case moved to Under Verification.');
        router.refresh();
      } else {
        setActionError(res.error || 'Failed to start verification.');
      }
    });
  };

  // Direct Action: Resume Verification (MORE_INFO_REQUESTED -> UNDER_VERIFICATION)
  const handleResumeVerification = () => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await transitionCaseAction({
        caseId: currentCase.case_id,
        action: 'START_VERIFICATION',
        payload: { note: 'Resuming verification with updated records' },
      });

      if (res.success && res.case) {
        setCurrentCase(res.case);
        setActionSuccess('Verification resumed following information review.');
        router.refresh();
      } else {
        setActionError(res.error || 'Failed to resume verification.');
      }
    });
  };

  // Open Modal for Justified Actions
  const openActionModal = (action: 'RESOLVE' | 'REJECT' | 'REQUEST_MORE_INFO') => {
    setActionError(null);
    setActionSuccess(null);
    setModalInput('');

    if (action === 'RESOLVE') {
      setModalConfig({
        isOpen: true,
        action: 'RESOLVE',
        title: 'Resolve Conflict Case',
        description:
          'Provide a mandatory legal/verification note explaining the basis of resolution (e.g., succession certificate verified, mutation regularized, or area reconciled).',
        label: 'Resolution Justification Note (Required)',
        placeholder: 'Enter official resolution findings and statutory basis...',
        confirmButtonText: 'Confirm & Resolve Case',
        confirmButtonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      });
    } else if (action === 'REJECT') {
      setModalConfig({
        isOpen: true,
        action: 'REJECT',
        title: 'Reject Conflict Case',
        description:
          'Provide a mandatory rejection reason explaining why the dispute or transaction claim is invalid or rejected.',
        label: 'Rejection Reason (Required)',
        placeholder: 'Enter official reason for dispute rejection...',
        confirmButtonText: 'Confirm & Reject Case',
        confirmButtonClass: 'bg-rose-600 hover:bg-rose-500 text-white',
      });
    } else if (action === 'REQUEST_MORE_INFO') {
      setModalConfig({
        isOpen: true,
        action: 'REQUEST_MORE_INFO',
        title: 'Request Additional Information',
        description:
          'Specify the exact departmental documents, certified registry copies, or cadastral measurements required to proceed with verification.',
        label: 'Query Details & Required Documents (Required)',
        placeholder: 'Specify certificates, certified deeds, or survey records required...',
        confirmButtonText: 'Submit Query & Update Status',
        confirmButtonClass: 'bg-amber-600 hover:bg-amber-500 text-white',
      });
    }
  };

  // Submit Justified Modal Action
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalConfig.action || modalInput.trim() === '') return;

    const action = modalConfig.action;
    const trimmedInput = modalInput.trim();

    let payload: ActionPayload = {};
    if (action === 'RESOLVE') {
      payload = { resolutionNote: trimmedInput };
    } else if (action === 'REJECT') {
      payload = { rejectionReason: trimmedInput };
    } else if (action === 'REQUEST_MORE_INFO') {
      payload = { queryDetails: trimmedInput };
    }

    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await transitionCaseAction({
        caseId: currentCase.case_id,
        action,
        payload,
      });

      if (res.success && res.case) {
        setCurrentCase(res.case);
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        setModalInput('');
        setActionSuccess(`Case status successfully updated to ${res.case.status.replace(/_/g, ' ')}.`);
        router.refresh();
      } else {
        setActionError(res.error || 'Failed to submit case action.');
      }
    });
  };

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
              <StatusBadge status={currentCase.status} />
              <PriorityBadge priority={scores.priority.priority} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Case ID:</span>
                <span className="font-mono text-slate-900">{currentCase.case_id}</span>
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
                  {new Date(currentCase.created_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <span>•</span>
              <div>
                <span className="text-slate-500">Assigned Officer:</span>{' '}
                <span className="font-medium text-slate-700 font-mono">
                  {currentCase.assigned_to ? currentCase.assigned_to : 'Unassigned (Open Queue)'}
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

        {/* Right Column: Human Review Actions, Conflict Evidence, Interests, Transactions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Dedicated Human Review Action Card */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-900">Human Review & Workflow</h2>
              </div>
              <StatusBadge status={currentCase.status} />
            </div>

            {/* Status & Assignment Indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  Current Status
                </span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {currentCase.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  Assigned Officer
                </span>
                <span
                  className="font-mono text-slate-800 text-xs mt-0.5 truncate block"
                  title={currentCase.assigned_to || 'Unassigned'}
                >
                  {currentCase.assigned_to
                    ? `${currentCase.assigned_to.substring(0, 16)}...`
                    : 'Unassigned (Open Queue)'}
                </span>
              </div>
            </div>

            {/* Error / Success feedback alerts */}
            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{actionError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActionError(null)}
                  className="text-red-400 hover:text-red-600 font-bold ml-1 text-sm leading-none"
                >
                  &times;
                </button>
              </div>
            )}

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{actionSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActionSuccess(null)}
                  className="text-emerald-400 hover:text-emerald-600 font-bold ml-1 text-sm leading-none"
                >
                  &times;
                </button>
              </div>
            )}

            {/* State-Driven Available Officer Actions */}
            {currentCase.status === 'OPEN' && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-600 leading-relaxed">
                  This case is currently unassigned in the public queue. Assign this case to yourself to take official ownership and commence investigation.
                </p>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleAssign}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition shadow-sm"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Assigning Case...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Assign to Me</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {currentCase.status === 'ASSIGNED' && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Case is assigned. Start the active verification process to inspect spatial boundaries, cross-registry deeds, and parties.
                </p>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleStartVerification}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition shadow-sm"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Initiating Verification...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Start Verification</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {currentCase.status === 'UNDER_VERIFICATION' && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Verification in progress. Evaluate the deterministic evidence on this parcel and select the appropriate resolution action:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => openActionModal('RESOLVE')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Resolve</span>
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => openActionModal('REJECT')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 transition shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => openActionModal('REQUEST_MORE_INFO')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 transition shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>More Info</span>
                  </button>
                </div>
              </div>
            )}

            {currentCase.status === 'MORE_INFO_REQUESTED' && (
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <strong>Pending Departmental Response:</strong> Additional documentation or certified records have been requested from the department.
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleResumeVerification}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition shadow-sm"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Resuming Verification...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Resume Verification</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {currentCase.status === 'RESOLVED' && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Case Resolved</span>
                </div>
                <p className="text-emerald-700 text-[11px] leading-relaxed">
                  This case has been resolved following officer verification. Historical resolution details and officer justifications are recorded in the append-only audit trail at the application layer.
                </p>
              </div>
            )}

            {currentCase.status === 'REJECTED' && (
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-slate-900">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Case Rejected / Dismissed</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  This case has been rejected/dismissed. The recorded rationale is preserved in the append-only audit log at the application layer.
                </p>
              </div>
            )}
          </div>

          {/* 1.5 AI / Decision Support Explanation Layer */}
          <AiExplanationCard
            conflictType={conflict.conflict_type}
            evidence={conflict.evidence}
            clarity={scores.clarity.score}
            priority={scores.priority.priority}
            ulpin={parcel.ulpin}
            classification={parcel.classification}
          />

          {/* 2. Conflict & Deterministic Evidence Package */}
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
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Statutory / Authority Rule
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAuthorityModal(true)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
                    >
                      <span>Explore Precedence Matrix</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center justify-between">
                    <span>{conflict.evidence.authority}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200/80 text-indigo-900 font-mono">
                      Statutory Precedence
                    </span>
                  </div>
                </div>
              )}

              {/* Objective Decision Support Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <strong>Officer Notice:</strong> BhoomiLens is an explainable decision-support system. It highlights deterministic variances between official records for human verification and does not make automated legal declarations.
              </div>
            </div>
          </div>

          {/* 3. Interests & Ownership Model (interests -> persons) */}
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

          {/* 4. Transaction History Timeline */}
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

          {/* 5. Simultaneous Parcel Conflicts (if more than 1) */}
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

      {/* 3. Immutable Application-Layer Case Audit Timeline */}
      <CaseAuditTimeline auditLogs={auditLogs} />

      {/* Statutory Authority Precedence Matrix Modal */}
      <AuthorityMatrixModal
        isOpen={showAuthorityModal}
        onClose={() => setShowAuthorityModal(false)}
        highlightRuleId={conflict.evidence.authority || undefined}
      />

      {/* Justification Modal Dialog */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{modalConfig.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{modalConfig.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {modalConfig.label}
                </label>
                <textarea
                  rows={4}
                  required
                  autoFocus
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  placeholder={modalConfig.placeholder}
                  className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 resize-none bg-slate-50 focus:bg-white transition"
                />
                <span className="text-[10px] text-slate-400 mt-1 block text-right font-mono">
                  {modalInput.trim().length} characters (mandatory)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || modalInput.trim() === ''}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${modalConfig.confirmButtonClass} disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm flex items-center gap-1.5`}
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{modalConfig.confirmButtonText}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
