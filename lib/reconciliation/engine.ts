/**
 * BhoomiLens Deterministic Reconciliation Engine
 * Pure deterministic pipeline: Records -> Standardization -> Reconciliation -> Conflict -> Evidence
 */

import { ParcelBundle, ReconciliationResult, DetectedConflict, RecordStatus } from './types';
import { standardizeBundleRecords } from './standardizer';
import { detectOwnershipConflicts } from './detectors/ownership';
import { detectMutationConflicts } from './detectors/mutation';
import { detectLifecycleConflicts } from './detectors/lifecycle';
import { detectAreaMismatch } from './detectors/area';
import { detectBoundaryAnomalies } from './detectors/boundary';
import { detectLandUseConflicts } from './detectors/landUse';
import { detectGovernmentLandRisk } from './detectors/governmentRisk';
import { detectCourtDisputes } from './detectors/court';
import { detectTaxConflicts } from './detectors/tax';
import { detectMultipleEncumbrances } from './detectors/encumbrance';
import { detectTransactionPatterns } from './detectors/transactions';
import { detectOpenWorldStates } from './detectors/openWorld';

/**
 * Reconciles all records, interests, transactions, and metadata for a single parcel bundle.
 * Pure deterministic logic. Does NOT use AI, ML, or probabilistic guessing.
 */
export function reconcileParcel(bundle: ParcelBundle): ReconciliationResult {
  const standardizedRecords = standardizeBundleRecords(bundle.records || []);

  const openWorldSummary: Record<RecordStatus, number> = {
    PRESENT: 0,
    NOT_FOUND: 0,
    CONFIRMED_ABSENT: 0,
    CONFLICTING: 0,
    UNAVAILABLE: 0,
  };

  standardizedRecords.forEach((r) => {
    openWorldSummary[r.raw.status] = (openWorldSummary[r.raw.status] || 0) + 1;
  });

  const allConflicts: DetectedConflict[] = [
    ...detectOwnershipConflicts(bundle, standardizedRecords),
    ...detectMutationConflicts(bundle, standardizedRecords),
    ...detectLifecycleConflicts(bundle, standardizedRecords),
    ...detectAreaMismatch(bundle, standardizedRecords),
    ...detectBoundaryAnomalies(bundle, standardizedRecords),
    ...detectLandUseConflicts(bundle, standardizedRecords),
    ...detectGovernmentLandRisk(bundle, standardizedRecords),
    ...detectCourtDisputes(bundle, standardizedRecords),
    ...detectTaxConflicts(bundle, standardizedRecords),
    ...detectMultipleEncumbrances(bundle, standardizedRecords),
    ...detectTransactionPatterns(bundle),
    ...detectOpenWorldStates(bundle, standardizedRecords),
  ];

  return {
    ulpin: bundle.parcel.ulpin,
    parcel_id: bundle.parcel.parcel_id,
    conflicts: allConflicts,
    total_conflicts: allConflicts.length,
    evaluated_records_count: standardizedRecords.length,
    open_world_states_summary: openWorldSummary,
  };
}
