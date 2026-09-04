/**
 * BhoomiLens Officer Performance & Accountability Service
 * Pure deterministic aggregation of operational metrics derived directly from `cases` and `audit_logs`.
 *
 * SPECIFICATION & SAFETY CONSTRAINTS:
 * 1. ZERO ML / ZERO AI / ZERO SUBJECTIVE RATING.
 * 2. Does NOT invent arbitrary numerical officer scores.
 * 3. Transparent, explainable, and fully reproducible from real database records.
 * 4. Never exposes raw Auth UUIDs to regular interfaces (uses 'Authenticated Officer').
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseAuditLog, DatabaseCase, DatabaseConflict } from '../cases/types';
import { formatAuditAction, formatConflictName } from '../ui/formatters';

export interface RecentAuditActivityItem {
  auditLogId: string;
  caseId: string | null;
  ulpin?: string;
  conflictType?: string;
  action: string;
  formattedAction: string;
  occurredAt: string;
  formattedTime: string;
  note?: string;
  actorRole: string;
}

export interface OfficerPerformanceSummary {
  totalCases: number;
  casesAssigned: number;
  casesUnderVerification: number;
  casesResolved: number;
  casesRejected: number;
  casesMoreInfoRequested: number;
  casesOpen: number;
  totalAuditActions: number;
  averageResolutionHours: number;
  averageResolutionFormatted: string;
  completionRatePercent: number;
  recentActivity: RecentAuditActivityItem[];
  methodologyNotice: string;
}

/**
 * Calculates officer performance and accountability metrics deterministically from database tables.
 */
export async function getOfficerPerformanceMetrics(
  supabase: SupabaseClient
): Promise<OfficerPerformanceSummary> {
  // 1. Fetch all cases
  const { data: casesData, error: casesErr } = await supabase
    .from('cases')
    .select('*');

  if (casesErr) {
    throw new Error(`Failed to fetch cases for performance metrics: ${casesErr.message}`);
  }

  const cases: DatabaseCase[] = casesData || [];

  // 2. Fetch all audit logs ordered by time
  const { data: auditData, error: auditErr } = await supabase
    .from('audit_logs')
    .select('*')
    .order('occurred_at', { ascending: false });

  if (auditErr) {
    throw new Error(`Failed to fetch audit logs for performance metrics: ${auditErr.message}`);
  }

  const auditLogs: DatabaseAuditLog[] = auditData || [];

  // 3. Fetch conflicts and parcels for joining recent activity
  const { data: conflictsData } = await supabase.from('conflicts').select('*');
  const conflicts: DatabaseConflict[] = conflictsData || [];
  const conflictMap = new Map<string, DatabaseConflict>();
  conflicts.forEach((c) => conflictMap.set(c.conflict_id, c));

  const { data: parcelsData } = await supabase.from('parcels').select('parcel_id, ulpin');
  const parcelMap = new Map<string, string>();
  (parcelsData || []).forEach((p) => parcelMap.set(p.parcel_id, p.ulpin));

  // Map case_id -> conflict & parcel
  const caseMetadataMap = new Map<string, { conflictType: string; ulpin: string }>();
  cases.forEach((c) => {
    const conflict = conflictMap.get(c.conflict_id);
    if (conflict) {
      const ulpin = parcelMap.get(conflict.parcel_id) || 'Unknown ULPIN';
      caseMetadataMap.set(c.case_id, {
        conflictType: conflict.conflict_type,
        ulpin,
      });
    }
  });

  // 4. Compute Counts
  const totalCases = cases.length;
  let casesAssigned = 0;
  let casesUnderVerification = 0;
  let casesResolved = 0;
  let casesRejected = 0;
  let casesMoreInfoRequested = 0;
  let casesOpen = 0;

  cases.forEach((c) => {
    switch (c.status) {
      case 'ASSIGNED':
        casesAssigned++;
        break;
      case 'UNDER_VERIFICATION':
        casesUnderVerification++;
        break;
      case 'RESOLVED':
        casesResolved++;
        break;
      case 'REJECTED':
        casesRejected++;
        break;
      case 'MORE_INFO_REQUESTED':
        casesMoreInfoRequested++;
        break;
      case 'OPEN':
      default:
        casesOpen++;
        break;
    }
  });

  // Also count total cases that have been assigned at any point
  const totalAssignedCasesCount = cases.filter((c) => c.assigned_to !== null || c.status !== 'OPEN').length;

  // 5. Compute Average Resolution Time (from created_at to updated_at for terminal cases)
  const resolvedCases = cases.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'REJECTED'
  );

  let totalResolutionTimeMs = 0;
  let validResolutionCount = 0;

  resolvedCases.forEach((c) => {
    const created = new Date(c.created_at).getTime();
    const updated = new Date(c.updated_at).getTime();
    if (updated >= created) {
      totalResolutionTimeMs += updated - created;
      validResolutionCount++;
    }
  });

  const averageResolutionHours =
    validResolutionCount > 0
      ? totalResolutionTimeMs / (validResolutionCount * 1000 * 60 * 60)
      : 0;

  let averageResolutionFormatted = 'N/A (No resolved cases)';
  if (validResolutionCount > 0) {
    if (averageResolutionHours < 1) {
      const minutes = Math.max(1, Math.round(averageResolutionHours * 60));
      averageResolutionFormatted = `${minutes} min`;
    } else if (averageResolutionHours < 24) {
      averageResolutionFormatted = `${averageResolutionHours.toFixed(1)} hrs`;
    } else {
      const days = (averageResolutionHours / 24).toFixed(1);
      averageResolutionFormatted = `${days} days`;
    }
  }

  // 6. Compute Completion Rate
  const completedCount = casesResolved + casesRejected;
  const completionRatePercent =
    totalCases > 0 ? Math.round((completedCount / totalCases) * 100) : 0;

  // 7. Format Recent Activity (top 15)
  const recentActivity: RecentAuditActivityItem[] = auditLogs.slice(0, 15).map((log) => {
    const meta = log.case_id ? caseMetadataMap.get(log.case_id) : undefined;
    const note =
      log.details?.resolution_note ||
      log.details?.rejection_reason ||
      log.details?.query_details ||
      log.details?.verification_note ||
      log.details?.reason ||
      undefined;

    return {
      auditLogId: log.audit_log_id,
      caseId: log.case_id,
      ulpin: meta?.ulpin,
      conflictType: meta?.conflictType ? formatConflictName(meta.conflictType) : undefined,
      action: log.action,
      formattedAction: formatAuditAction(log.action),
      occurredAt: log.occurred_at,
      formattedTime: new Date(log.occurred_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      note,
      actorRole: 'Verification Officer (Revenue Dept)',
    };
  });

  return {
    totalCases,
    casesAssigned: totalAssignedCasesCount,
    casesUnderVerification,
    casesResolved,
    casesRejected,
    casesMoreInfoRequested,
    casesOpen,
    totalAuditActions: auditLogs.length,
    averageResolutionHours,
    averageResolutionFormatted,
    completionRatePercent,
    recentActivity,
    methodologyNotice:
      'Deterministic Operational Metrics: Aggregated in real time from immutable case lifecycle records and append-only audit events. No opaque weighting or AI inference applied.',
  };
}
