'use client';

import React, { useState, useTransition } from 'react';
import { OfficerQueueItem } from '@/lib/cases/types';
import { SummaryCards } from './SummaryCards';
import { PriorityQueueTable } from './PriorityQueueTable';
import { syncAllParcelsAction } from '@/app/actions/reconciliation';

interface OfficerDashboardClientProps {
  initialQueue: OfficerQueueItem[];
  fetchError?: string | null;
}

export function OfficerDashboardClient({
  initialQueue,
  fetchError = null,
}: OfficerDashboardClientProps) {
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [isPending, startTransition] = useTransition();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSyncAll = () => {
    setSyncMessage(null);
    setSyncError(null);

    startTransition(async () => {
      const res = await syncAllParcelsAction();
      if (res.success) {
        setSyncMessage(
          `Successfully synchronized ${res.totalConflicts} conflicts and ${res.totalCases} cases across all parcels.`
        );
      } else {
        setSyncError(res.error || 'Failed to synchronize parcels.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded">
              SIH 2026 Decision Support
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Deterministic Land Record System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Officer Verification Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Reconciles disparate land-record sources, detects inconsistencies, computes deterministic Clarity & Priority, and prioritizes human verification.
          </p>
        </div>

        {/* Sync / Refresh Action Button */}
        <div className="flex flex-col sm:items-end gap-2">
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isPending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Re-evaluating Records...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Re-evaluate & Sync Cases</span>
              </>
            )}
          </button>
          <span className="text-[11px] text-slate-400">
            Idempotent • Never creates duplicates
          </span>
        </div>
      </div>

      {/* Sync Status Notifications */}
      {syncMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {syncError && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{syncError}</span>
          </div>
          <button onClick={() => setSyncError(null)} className="text-rose-600 hover:text-rose-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Fetch Error Warning */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Database Connection Notice</span>
          </div>
          <p>{fetchError}</p>
        </div>
      )}

      {/* Summary Stat Cards */}
      <SummaryCards
        queueItems={initialQueue}
        selectedPriority={selectedPriority}
        onSelectPriority={setSelectedPriority}
      />

      {/* Priority Queue Main Table */}
      <PriorityQueueTable
        items={initialQueue}
        selectedPriority={selectedPriority}
        onSelectPriority={setSelectedPriority}
        isLoading={isPending}
      />
    </div>
  );
}
