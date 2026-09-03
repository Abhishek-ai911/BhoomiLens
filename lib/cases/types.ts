/**
 * BhoomiLens Case & Human Review Module Types
 * Strictly enforces valid statuses, officer actions, and audit schemas.
 */

import { ConflictEvidence, ConflictType } from '../reconciliation/types';
import { PriorityLevel } from '../scoring/types';

export type CaseStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'UNDER_VERIFICATION'
  | 'RESOLVED'
  | 'REJECTED'
  | 'MORE_INFO_REQUESTED';

export type CaseAction =
  | 'ASSIGN'
  | 'START_VERIFICATION'
  | 'RESOLVE'
  | 'REJECT'
  | 'REQUEST_MORE_INFO';

export type AuditAction =
  | 'CASE_CREATED'
  | 'CASE_ASSIGNED'
  | 'VERIFICATION_STARTED'
  | 'MORE_INFO_REQUESTED'
  | 'CASE_RESOLVED'
  | 'CASE_REJECTED'
  | 'RECONCILIATION_EVIDENCE_UPDATED';

export interface DatabaseConflict {
  conflict_id: string;
  parcel_id: string;
  conflict_type: ConflictType;
  evidence: ConflictEvidence;
}

export interface DatabaseCase {
  case_id: string;
  conflict_id: string;
  assigned_to: string | null; // MUST be auth.users.id, NEVER persons.person_id
  status: CaseStatus;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAuditLog {
  audit_log_id: string;
  case_id: string | null;
  action: AuditAction | string;
  actor_id: string | null; // MUST be auth.users.id, NEVER persons.person_id
  occurred_at: string;
  details: Record<string, any> | null;
}

export interface ActionPayload {
  officerId?: string; // auth.users.id for assignment
  note?: string; // verification or query note
  resolutionNote?: string; // required for RESOLVE
  rejectionReason?: string; // required for REJECT
  queryDetails?: string; // required for REQUEST_MORE_INFO
}

export interface CaseTransitionResult {
  success: boolean;
  case?: DatabaseCase;
  auditLogId?: string;
  error?: string;
}

export interface OfficerQueueItem {
  case_id: string;
  status: CaseStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  conflict: {
    conflict_id: string;
    conflict_type: ConflictType;
    evidence: ConflictEvidence;
  };
  parcel: {
    parcel_id: string;
    ulpin: string;
    area: number | null;
    classification: string | null;
  };
  clarity: number;
  priority: PriorityLevel;
}

export interface SyncReconciliationResult {
  parcel_id: string;
  created_conflicts_count: number;
  reused_conflicts_count: number;
  created_cases_count: number;
  reused_cases_count: number;
  conflicts: DatabaseConflict[];
  cases: DatabaseCase[];
}
