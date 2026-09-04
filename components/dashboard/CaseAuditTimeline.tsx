'use client';

import React from 'react';
import { DatabaseAuditLog } from '@/lib/cases/types';
import {
  formatAuditAction,
  formatCaseStatus,
  formatConflictName,
  formatPriority,
} from '@/lib/ui/formatters';

interface CaseAuditTimelineProps {
  auditLogs: DatabaseAuditLog[];
}

const ACTION_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string; icon: string }
> = {
  CASE_CREATED: {
    label: 'Case Created',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: 'M12 4v16m8-8H4',
  },
  CASE_ASSIGNED: {
    label: 'Officer Assigned',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  VERIFICATION_STARTED: {
    label: 'Verification Started',
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  MORE_INFO_REQUESTED: {
    label: 'Additional Info Requested',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  CASE_RESOLVED: {
    label: 'Case Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
    icon: 'M5 13l4 4L19 7',
  },
  CASE_REJECTED: {
    label: 'Case Rejected',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-600',
    icon: 'M6 18L18 6M6 6l12 12',
  },
  RECONCILIATION_EVIDENCE_UPDATED: {
    label: 'Evidence Updated',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
};

export function CaseAuditTimeline({ auditLogs }: CaseAuditTimelineProps) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <h2 className="text-sm font-bold text-slate-900">Application-Layer Audit Trail</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">0 Entries</span>
        </div>
        <p className="text-xs text-slate-500 p-4 text-center bg-slate-50 rounded-xl border border-slate-100">
          No audit entries recorded for this case yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Application-Layer Audit Trail</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            Append-Only Ledger
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {auditLogs.length} {auditLogs.length === 1 ? 'Event' : 'Events'}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        All lifecycle transitions, officer justifications, and departmental queries are permanently recorded in an immutable application-layer audit log.
      </p>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {auditLogs.map((log) => {
          const cfg = ACTION_CONFIG[log.action] || {
            label: formatAuditAction(log.action),
            bg: 'bg-slate-50',
            text: 'text-slate-800',
            border: 'border-slate-200',
            dot: 'bg-slate-500',
            icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          };

          const details = log.details || {};

          return (
            <div key={log.audit_log_id} className="relative group">
              {/* Dot on vertical line */}
              <div
                className={`absolute -left-[1.625rem] top-1.5 w-3 h-3 rounded-full ${cfg.dot} ring-4 ring-white shadow-xs`}
              />

              {/* Event Card */}
              <div className={`p-3.5 rounded-xl border ${cfg.bg} ${cfg.border} text-xs space-y-2`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${cfg.text}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cfg.icon} />
                      </svg>
                      <span>{cfg.label}</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-medium">
                    {new Date(log.occurred_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                {/* Actor */}
                <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                  <span className="text-slate-400 font-semibold">Actor:</span>
                  {log.actor_id ? (
                    <span className="font-mono text-slate-800 bg-white/70 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                      Officer ({log.actor_id})
                    </span>
                  ) : (
                    <span className="font-medium text-slate-700 bg-white/70 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                      Automated Reconciliation Engine
                    </span>
                  )}
                </div>

                {/* Specific Action Details */}
                {details.resolution_note && (
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Resolution Basis / Justification
                    </span>
                    <p className="text-xs font-medium text-slate-900 leading-relaxed">
                      {details.resolution_note}
                    </p>
                  </div>
                )}

                {details.rejection_reason && (
                  <div className="bg-white p-2.5 rounded-lg border border-rose-200 text-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                      Rejection Reason / Grounds
                    </span>
                    <p className="text-xs font-medium text-slate-900 leading-relaxed">
                      {details.rejection_reason}
                    </p>
                  </div>
                )}

                {details.query_details && (
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                      Information / Department Query
                    </span>
                    <p className="text-xs font-medium text-slate-900 leading-relaxed">
                      {details.query_details}
                    </p>
                  </div>
                )}

                {details.note && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                      Officer Verification Note
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">{details.note}</p>
                  </div>
                )}

                {details.initial_clarity !== undefined && (
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 bg-white/60 p-2 rounded-lg border border-slate-200/80">
                    <span>
                      Initial Clarity:{' '}
                      <strong className="text-slate-900 font-mono">{details.initial_clarity}/100</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Initial Priority:{' '}
                      <strong className="text-slate-900 font-semibold">{formatPriority(details.initial_priority)}</strong>
                    </span>
                    {details.conflict_type && (
                      <>
                        <span>•</span>
                        <span>
                          Type:{' '}
                          <strong className="text-slate-900 font-semibold">{formatConflictName(details.conflict_type)}</strong>
                        </span>
                      </>
                    )}
                  </div>
                )}

                {details.previous_status && details.new_status && (
                  <div className="text-[11px] text-slate-600">
                    <span className="text-slate-400 font-semibold">Status Transition: </span>
                    <span className="font-semibold text-slate-800">{formatCaseStatus(details.previous_status)}</span>
                    <span className="text-slate-400 font-bold mx-1.5">&rarr;</span>
                    <span className="font-semibold text-slate-800">{formatCaseStatus(details.new_status)}</span>
                  </div>
                )}

                <div className="text-[9px] text-slate-400 font-mono pt-0.5">
                  Audit ID: {log.audit_log_id}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
