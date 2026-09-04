/**
 * BhoomiLens Reconciliation Engine Types
 * Pure TypeScript definitions for deterministic reconciliation, standardization, and evidence.
 */

export type RecordStatus =
  | 'PRESENT'
  | 'NOT_FOUND'
  | 'CONFIRMED_ABSENT'
  | 'CONFLICTING'
  | 'UNAVAILABLE';

export interface DatabaseParcel {
  parcel_id: string;
  ulpin: string;
  geometry: unknown | null;
  area: number | null;
  classification: string | null;
}

export interface DatabasePerson {
  person_id: string;
  name: string;
  masked_aadhaar?: string | null;
}

export interface DatabaseInterest {
  interest_id: string;
  parcel_id: string;
  person_id: string;
  interest_type: string;
  share: number | null;
  status: string | null;
  valid_from: string | null;
  valid_to: string | null;
}

export interface DatabaseRecord {
  record_id: string;
  parcel_id: string;
  person_id: string | null;
  record_type: string;
  source: string;
  payload: Record<string, any> | null;
  status: RecordStatus;
  valid_from: string | null;
  valid_to: string | null;
  recorded_at: string;
}

export interface DatabaseTransaction {
  transaction_id: string;
  parcel_id: string;
  from_person_id: string;
  to_person_id: string;
  occurred_at: string;
}

export interface DatabaseAuthorityRule {
  authority_rule_id: string;
  jurisdiction: string;
  attribute: string;
  source: string;
}

export interface ParcelBundle {
  parcel: DatabaseParcel;
  persons: DatabasePerson[];
  interests: DatabaseInterest[];
  records: DatabaseRecord[];
  transactions: DatabaseTransaction[];
  authorityRules?: DatabaseAuthorityRule[];
}

export type ConflictType =
  | 'OWNERSHIP_CONFLICT'
  | 'MUTATION_CONFLICT'
  | 'LIFECYCLE_CONFLICT'
  | 'AREA_MISMATCH'
  | 'BOUNDARY_ANOMALY'
  | 'LAND_USE_CONFLICT'
  | 'GOVERNMENT_LAND_RISK'
  | 'COURT_CONFLICT'
  | 'TAX_CONFLICT'
  | 'MULTIPLE_ENCUMBRANCE'
  | 'UNUSUAL_TRANSACTION_VELOCITY'
  | 'CIRCULAR_TRANSACTION'
  | 'RECURRING_ENTITY'
  | 'MISSING_RECORD_CONFLICT';

export interface ConflictEvidence {
  what: string;
  why: string;
  source: string[];
  record_ids: string[];
  values: Record<string, unknown>;
  comparison?: Record<string, unknown>;
  authority?: string;
}

export interface DetectedConflict {
  conflict_type: ConflictType;
  evidence: ConflictEvidence;
}

export interface ReconciliationResult {
  ulpin: string;
  parcel_id: string;
  conflicts: DetectedConflict[];
  total_conflicts: number;
  evaluated_records_count: number;
  open_world_states_summary: Record<RecordStatus, number>;
}
