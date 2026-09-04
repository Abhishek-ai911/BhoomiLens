/**
 * BhoomiLens Case Management & Workflow Service
 * Handles idempotent conflict/case persistence, state transitions, and officer queue ordering.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ReconciliationResult, ParcelBundle } from '../reconciliation/types';
import { ParcelScoreResult } from '../scoring/types';
import { scoreParcel } from '../scoring/index';
import { reconcileParcel } from '../reconciliation/engine';
import { recordAuditLog } from '../audit/auditService';
import {
  ActionPayload,
  CaseAction,
  CaseDetailData,
  CaseStatus,
  CaseTransitionResult,
  DatabaseCase,
  DatabaseConflict,
  OfficerQueueItem,
  SyncReconciliationResult,
} from './types';

const PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

/**
 * Idempotently synchronizes detected conflicts and cases to the database.
 * Matches existing conflicts by (parcel_id, conflict_type).
 * Never creates duplicate conflicts or duplicate cases on repeated execution.
 */
export async function syncReconciliationToDatabase(
  supabase: SupabaseClient,
  parcelId: string,
  reconciliation: ReconciliationResult,
  scores: ParcelScoreResult
): Promise<SyncReconciliationResult> {
  // 1. Fetch existing conflicts for this parcel
  const { data: existingConflictsData, error: cErr } = await supabase
    .from('conflicts')
    .select('*')
    .eq('parcel_id', parcelId);

  if (cErr) {
    throw new Error(`Failed to fetch existing conflicts: ${cErr.message}`);
  }

  const existingConflicts: DatabaseConflict[] = existingConflictsData || [];
  const existingMap = new Map<string, DatabaseConflict>();
  existingConflicts.forEach((c) => existingMap.set(c.conflict_type, c));

  let createdConflictsCount = 0;
  let reusedConflictsCount = 0;
  let createdCasesCount = 0;
  let reusedCasesCount = 0;

  const resultConflicts: DatabaseConflict[] = [];
  const resultCases: DatabaseCase[] = [];

  for (const detected of reconciliation.conflicts) {
    let conflictId: string;
    let conflictRow: DatabaseConflict;

    const existingConflict = existingMap.get(detected.conflict_type);

    if (existingConflict) {
      // Reuse existing conflict
      conflictId = existingConflict.conflict_id;
      reusedConflictsCount++;

      // Check if evidence changed
      const evidenceChanged =
        JSON.stringify(existingConflict.evidence) !== JSON.stringify(detected.evidence);

      if (evidenceChanged) {
        await supabase
          .from('conflicts')
          .update({ evidence: detected.evidence })
          .eq('conflict_id', conflictId);
      }

      conflictRow = {
        conflict_id: conflictId,
        parcel_id: parcelId,
        conflict_type: detected.conflict_type,
        evidence: detected.evidence,
      };
    } else {
      // Create new conflict
      conflictId = crypto.randomUUID();
      conflictRow = {
        conflict_id: conflictId,
        parcel_id: parcelId,
        conflict_type: detected.conflict_type,
        evidence: detected.evidence,
      };

      const { error: insErr } = await supabase.from('conflicts').insert(conflictRow);
      if (insErr) {
        throw new Error(`Failed to insert conflict: ${insErr.message}`);
      }
      createdConflictsCount++;
    }

    resultConflicts.push(conflictRow);

    // 2. Fetch existing case for this conflict
    const { data: existingCaseData, error: caseErr } = await supabase
      .from('cases')
      .select('*')
      .eq('conflict_id', conflictId)
      .maybeSingle();

    if (caseErr) {
      throw new Error(`Failed to check existing case: ${caseErr.message}`);
    }

    if (existingCaseData) {
      // Reuse existing case (preserve existing status and assignment)
      reusedCasesCount++;
      resultCases.push(existingCaseData);

      // If case was already resolved/rejected and evidence has changed, log audit note
      if (
        (existingCaseData.status === 'RESOLVED' || existingCaseData.status === 'REJECTED') &&
        existingConflict &&
        JSON.stringify(existingConflict.evidence) !== JSON.stringify(detected.evidence)
      ) {
        await recordAuditLog(supabase, {
          caseId: existingCaseData.case_id,
          action: 'RECONCILIATION_EVIDENCE_UPDATED',
          actorId: null,
          details: {
            parcel_id: parcelId,
            conflict_type: detected.conflict_type,
            previous_evidence: existingConflict.evidence,
            new_evidence: detected.evidence,
            current_case_status: existingCaseData.status,
            notice: 'New contradictory evidence detected post-resolution; preserved historical case decision.',
          },
        });
      }
    } else {
      // Create new case
      const caseId = crypto.randomUUID();
      const now = new Date().toISOString();
      const newCaseRow: DatabaseCase = {
        case_id: caseId,
        conflict_id: conflictId,
        assigned_to: null,
        status: 'OPEN',
        created_at: now,
        updated_at: now,
      };

      const { error: insCaseErr } = await supabase.from('cases').insert(newCaseRow);
      if (insCaseErr) {
        throw new Error(`Failed to create case: ${insCaseErr.message}`);
      }

      createdCasesCount++;
      resultCases.push(newCaseRow);

      // Record CASE_CREATED audit log
      await recordAuditLog(supabase, {
        caseId: caseId,
        action: 'CASE_CREATED',
        actorId: null,
        details: {
          parcel_id: parcelId,
          conflict_type: detected.conflict_type,
          initial_clarity: scores.clarity.score,
          initial_priority: scores.priority.priority,
        },
      });
    }
  }

  return {
    parcel_id: parcelId,
    created_conflicts_count: createdConflictsCount,
    reused_conflicts_count: reusedConflictsCount,
    created_cases_count: createdCasesCount,
    reused_cases_count: reusedCasesCount,
    conflicts: resultConflicts,
    cases: resultCases,
  };
}

/**
 * Validates and executes an officer state transition on a case.
 * Enforces strict state machine rules and writes an immutable audit log.
 */
export async function transitionCaseStatus(
  supabase: SupabaseClient,
  params: {
    caseId: string;
    action: CaseAction;
    actorId?: string | null; // MUST be auth.users.id only
    payload?: ActionPayload;
  }
): Promise<CaseTransitionResult> {
  const { caseId, action, actorId, payload } = params;

  // 1. Fetch current case
  const { data: currentCase, error: fetchErr } = await supabase
    .from('cases')
    .select('*')
    .eq('case_id', caseId)
    .single();

  if (fetchErr || !currentCase) {
    return { success: false, error: `Case not found: ${caseId}` };
  }

  const prevStatus: CaseStatus = currentCase.status;
  let newStatus: CaseStatus;
  let newAssignedTo: string | null = currentCase.assigned_to;
  let auditAction: string;
  let auditDetails: Record<string, any> = {
    previous_status: prevStatus,
  };

  switch (action) {
    case 'ASSIGN': {
      if (!payload?.officerId || typeof payload.officerId !== 'string' || payload.officerId.trim() === '') {
        return { success: false, error: 'Officer ID (auth.users.id) is required for assignment.' };
      }
      if (prevStatus === 'RESOLVED' || prevStatus === 'REJECTED') {
        return { success: false, error: `Cannot assign a case in terminal status '${prevStatus}'.` };
      }

      newStatus = prevStatus === 'OPEN' ? 'ASSIGNED' : prevStatus;
      newAssignedTo = payload.officerId.trim();
      auditAction = 'CASE_ASSIGNED';
      auditDetails = {
        ...auditDetails,
        new_status: newStatus,
        previous_assigned_to: currentCase.assigned_to,
        new_assigned_to: newAssignedTo,
        note: payload.note || null,
      };
      break;
    }

    case 'START_VERIFICATION': {
      if (prevStatus !== 'ASSIGNED' && prevStatus !== 'MORE_INFO_REQUESTED') {
        return {
          success: false,
          error: `Cannot start verification from '${prevStatus}'. Case must be in 'ASSIGNED' or 'MORE_INFO_REQUESTED' status.`,
        };
      }
      newStatus = 'UNDER_VERIFICATION';
      auditAction = 'VERIFICATION_STARTED';
      auditDetails = {
        ...auditDetails,
        new_status: newStatus,
        note: payload?.note || null,
      };
      break;
    }

    case 'RESOLVE': {
      if (prevStatus !== 'UNDER_VERIFICATION') {
        return {
          success: false,
          error: `Cannot resolve case from '${prevStatus}'. Case must be 'UNDER_VERIFICATION'.`,
        };
      }
      if (!payload?.resolutionNote || payload.resolutionNote.trim() === '') {
        return {
          success: false,
          error: 'A resolution note/justification is required to resolve a case.',
        };
      }
      newStatus = 'RESOLVED';
      auditAction = 'CASE_RESOLVED';
      auditDetails = {
        ...auditDetails,
        new_status: newStatus,
        resolution_note: payload.resolutionNote.trim(),
      };
      break;
    }

    case 'REJECT': {
      if (prevStatus !== 'UNDER_VERIFICATION') {
        return {
          success: false,
          error: `Cannot reject case from '${prevStatus}'. Case must be 'UNDER_VERIFICATION'.`,
        };
      }
      if (!payload?.rejectionReason || payload.rejectionReason.trim() === '') {
        return {
          success: false,
          error: 'A rejection reason/justification is required to reject a case.',
        };
      }
      newStatus = 'REJECTED';
      auditAction = 'CASE_REJECTED';
      auditDetails = {
        ...auditDetails,
        new_status: newStatus,
        rejection_reason: payload.rejectionReason.trim(),
      };
      break;
    }

    case 'REQUEST_MORE_INFO': {
      if (prevStatus !== 'UNDER_VERIFICATION') {
        return {
          success: false,
          error: `Cannot request more information from '${prevStatus}'. Case must be 'UNDER_VERIFICATION'.`,
        };
      }
      if (!payload?.queryDetails || payload.queryDetails.trim() === '') {
        return {
          success: false,
          error: 'Specific query details are required when requesting more information.',
        };
      }
      newStatus = 'MORE_INFO_REQUESTED';
      auditAction = 'MORE_INFO_REQUESTED';
      auditDetails = {
        ...auditDetails,
        new_status: newStatus,
        query_details: payload.queryDetails.trim(),
      };
      break;
    }

    default:
      return { success: false, error: `Unsupported case action: ${action}` };
  }

  const now = new Date().toISOString();
  const { data: updatedCase, error: updateErr } = await supabase
    .from('cases')
    .update({
      status: newStatus,
      assigned_to: newAssignedTo,
      updated_at: now,
    })
    .eq('case_id', caseId)
    .select('*')
    .single();

  if (updateErr || !updatedCase) {
    return { success: false, error: `Failed to update case status: ${updateErr?.message}` };
  }

  // Record audit log
  const auditLog = await recordAuditLog(supabase, {
    caseId: caseId,
    action: auditAction,
    actorId: actorId || null,
    occurredAt: now,
    details: auditDetails,
  });

  return {
    success: true,
    case: updatedCase,
    auditLogId: auditLog.audit_log_id,
  };
}

/**
 * Fetches the officer priority queue sorted deterministically:
 * 1. Priority tier: CRITICAL -> HIGH -> MEDIUM -> LOW
 * 2. Ascending Clarity (lowest clarity first)
 * 3. Earliest case created_at first
 */
export async function getOfficerPriorityQueue(
  supabase: SupabaseClient,
  filters?: {
    status?: CaseStatus | CaseStatus[];
    priority?: string;
    assignedTo?: string;
  }
): Promise<OfficerQueueItem[]> {
  // 1. Fetch cases with conflicts
  let casesQuery = supabase.from('cases').select('*');

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      casesQuery = casesQuery.in('status', filters.status);
    } else {
      casesQuery = casesQuery.eq('status', filters.status);
    }
  }

  if (filters?.assignedTo) {
    casesQuery = casesQuery.eq('assigned_to', filters.assignedTo);
  }

  const { data: casesData, error: casesErr } = await casesQuery;
  if (casesErr || !casesData) {
    throw new Error(`Failed to load cases: ${casesErr?.message}`);
  }

  // 2. Fetch all conflicts
  const { data: conflictsData } = await supabase.from('conflicts').select('*');
  const conflictMap = new Map<string, DatabaseConflict>();
  (conflictsData || []).forEach((c) => conflictMap.set(c.conflict_id, c));

  // 3. Fetch all parcels and records to compute real-time scores
  const { data: parcelsData } = await supabase.from('parcels').select('*');
  const parcelMap = new Map<string, any>();
  (parcelsData || []).forEach((p) => parcelMap.set(p.parcel_id, p));

  const { data: allPersons } = await supabase.from('persons').select('*');
  const { data: allInterests } = await supabase.from('interests').select('*');
  const { data: allRecords } = await supabase.from('records').select('*');
  const { data: allTx } = await supabase.from('transactions').select('*');

  // Compute scores per parcel
  const parcelScores = new Map<string, ParcelScoreResult>();
  for (const parcel of parcelsData || []) {
    const bundle: ParcelBundle = {
      parcel,
      persons: allPersons || [],
      interests: (allInterests || []).filter((i) => i.parcel_id === parcel.parcel_id),
      records: (allRecords || []).filter((r) => r.parcel_id === parcel.parcel_id),
      transactions: (allTx || []).filter((t) => t.parcel_id === parcel.parcel_id),
    };
    const recon = reconcileParcel(bundle);
    const score = scoreParcel({
      conflicts: recon.conflicts,
      open_world_states_summary: recon.open_world_states_summary,
    });
    parcelScores.set(parcel.parcel_id, score);
  }

  const queueItems: OfficerQueueItem[] = [];

  for (const c of casesData) {
    const conflict = conflictMap.get(c.conflict_id);
    if (!conflict) continue;

    const parcel = parcelMap.get(conflict.parcel_id);
    if (!parcel) continue;

    const score = parcelScores.get(parcel.parcel_id) || {
      clarity: { score: 100, baseScore: 100, totalDeductions: 0, breakdown: [] },
      priority: { priority: 'LOW', reasons: [], matchedRules: [] },
    };

    if (filters?.priority && score.priority.priority !== filters.priority) {
      continue;
    }

    queueItems.push({
      case_id: c.case_id,
      status: c.status,
      assigned_to: c.assigned_to,
      created_at: c.created_at,
      updated_at: c.updated_at,
      conflict: {
        conflict_id: conflict.conflict_id,
        conflict_type: conflict.conflict_type,
        evidence: conflict.evidence,
      },
      parcel: {
        parcel_id: parcel.parcel_id,
        ulpin: parcel.ulpin,
        area: parcel.area,
        classification: parcel.classification,
      },
      clarity: score.clarity.score,
      priority: score.priority.priority,
    });
  }

  // Sort queue:
  // 1. Priority: CRITICAL (1) -> HIGH (2) -> MEDIUM (3) -> LOW (4)
  // 2. Ascending Clarity (lowest clarity first)
  // 3. Earliest case created_at first
  queueItems.sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority] || 99;
    const pB = PRIORITY_ORDER[b.priority] || 99;
    if (pA !== pB) return pA - pB;

    if (a.clarity !== b.clarity) return a.clarity - b.clarity;

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return queueItems;
}

/**
 * Retrieves the complete deterministic case detail data including
 * parcel information, conflict evidence, source records, interests,
 * transactions, and real-time scores for the Case Detail View.
 */
export async function getCaseDetailById(
  supabase: SupabaseClient,
  caseId: string
): Promise<CaseDetailData | null> {
  // 1. Fetch case
  const { data: caseRow, error: caseErr } = await supabase
    .from('cases')
    .select('*')
    .eq('case_id', caseId)
    .maybeSingle();

  if (caseErr || !caseRow) {
    return null;
  }

  // 2. Fetch associated conflict
  const { data: conflictRow, error: confErr } = await supabase
    .from('conflicts')
    .select('*')
    .eq('conflict_id', caseRow.conflict_id)
    .maybeSingle();

  if (confErr || !conflictRow) {
    return null;
  }

  // 3. Fetch associated parcel
  const { data: parcelRow, error: parcelErr } = await supabase
    .from('parcels')
    .select('*')
    .eq('parcel_id', conflictRow.parcel_id)
    .maybeSingle();

  if (parcelErr || !parcelRow) {
    return null;
  }

  // 4. Fetch all persons (to resolve party names across interests, records, transactions)
  const { data: personsData } = await supabase.from('persons').select('*');
  const personsList = personsData || [];
  const personMap = new Map<string, string>();
  personsList.forEach((p) => personMap.set(p.person_id, p.name));

  // 5. Fetch all interests for this parcel
  const { data: interestsData } = await supabase
    .from('interests')
    .select('*')
    .eq('parcel_id', parcelRow.parcel_id);

  const mappedInterests = (interestsData || []).map((i) => ({
    interest_id: i.interest_id,
    parcel_id: i.parcel_id,
    person_id: i.person_id,
    person_name: personMap.get(i.person_id) || 'Unknown Party',
    interest_type: i.interest_type,
    share: i.share,
    status: i.status,
    valid_from: i.valid_from,
    valid_to: i.valid_to,
  }));

  // 6. Fetch all records for this parcel
  const { data: recordsData } = await supabase
    .from('records')
    .select('*')
    .eq('parcel_id', parcelRow.parcel_id)
    .order('recorded_at', { ascending: false });

  const mappedRecords = (recordsData || []).map((r) => ({
    record_id: r.record_id,
    parcel_id: r.parcel_id,
    person_id: r.person_id,
    person_name: r.person_id ? personMap.get(r.person_id) || null : null,
    record_type: r.record_type,
    source: r.source,
    payload: r.payload,
    status: r.status,
    valid_from: r.valid_from,
    valid_to: r.valid_to,
    recorded_at: r.recorded_at,
  }));

  // 7. Fetch all transactions for this parcel
  const { data: txData } = await supabase
    .from('transactions')
    .select('*')
    .eq('parcel_id', parcelRow.parcel_id)
    .order('occurred_at', { ascending: false });

  const mappedTx = (txData || []).map((t) => ({
    transaction_id: t.transaction_id,
    parcel_id: t.parcel_id,
    from_person_id: t.from_person_id,
    from_person_name: personMap.get(t.from_person_id) || 'Unknown Entity',
    to_person_id: t.to_person_id,
    to_person_name: personMap.get(t.to_person_id) || 'Unknown Entity',
    occurred_at: t.occurred_at,
  }));

  // 8. Fetch all conflicts for this parcel
  const { data: allConflictsData } = await supabase
    .from('conflicts')
    .select('*')
    .eq('parcel_id', parcelRow.parcel_id);

  // 9. Recompute deterministic scores in real-time
  const bundle: ParcelBundle = {
    parcel: parcelRow,
    persons: personsList,
    interests: interestsData || [],
    records: recordsData || [],
    transactions: txData || [],
  };

  const reconciliation = reconcileParcel(bundle);
  const scores = scoreParcel({
    conflicts: reconciliation.conflicts,
    open_world_states_summary: reconciliation.open_world_states_summary,
  });

  return {
    case: caseRow,
    conflict: conflictRow,
    parcel: {
      parcel_id: parcelRow.parcel_id,
      ulpin: parcelRow.ulpin,
      geometry: parcelRow.geometry,
      area: parcelRow.area,
      classification: parcelRow.classification,
    },
    persons: personsList,
    interests: mappedInterests,
    records: mappedRecords,
    transactions: mappedTx,
    scores,
    allParcelConflicts: allConflictsData || [],
  };
}

