/**
 * Open-World Data State Detector
 * Handles open-world states (UNAVAILABLE, NOT_FOUND, CONFIRMED_ABSENT)
 * Ensures missing information is never conflated with confirmed non-existence.
 */

import { DetectedConflict, ParcelBundle, RecordStatus } from '../types';
import { StandardizedRecord } from '../standardizer';

export function detectOpenWorldStates(
  bundle: ParcelBundle,
  standardizedRecords: StandardizedRecord[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  const nonPresentRecords = standardizedRecords.filter((r) => r.raw.status !== 'PRESENT');

  if (nonPresentRecords.length > 0) {
    const summary: Record<RecordStatus, string[]> = {
      PRESENT: [],
      NOT_FOUND: [],
      CONFIRMED_ABSENT: [],
      CONFLICTING: [],
      UNAVAILABLE: [],
    };

    nonPresentRecords.forEach((r) => {
      summary[r.raw.status].push(`${r.raw.source} (${r.raw.record_type})`);
    });

    const reasons: string[] = [];
    if (summary.UNAVAILABLE.length > 0) {
      reasons.push(`System unavailable for: ${summary.UNAVAILABLE.join(', ')}`);
    }
    if (summary.NOT_FOUND.length > 0) {
      reasons.push(`No records indexed/found for: ${summary.NOT_FOUND.join(', ')}`);
    }
    if (summary.CONFIRMED_ABSENT.length > 0) {
      reasons.push(`Confirmed absence verified for: ${summary.CONFIRMED_ABSENT.join(', ')}`);
    }
    if (summary.CONFLICTING.length > 0) {
      reasons.push(`Conflicting status reported for: ${summary.CONFLICTING.join(', ')}`);
    }

    conflicts.push({
      conflict_type: 'MISSING_RECORD_CONFLICT',
      evidence: {
        what: 'Missing, unavailable, or unindexed records identified in reconciliation',
        why: reasons.join(' | '),
        source: nonPresentRecords.map((r) => r.raw.source),
        record_ids: nonPresentRecords.map((r) => r.raw.record_id),
        values: {
          unavailable_sources: summary.UNAVAILABLE,
          not_found_sources: summary.NOT_FOUND,
          confirmed_absent_sources: summary.CONFIRMED_ABSENT,
          conflicting_sources: summary.CONFLICTING,
        },
      },
    });
  }

  return conflicts;
}
