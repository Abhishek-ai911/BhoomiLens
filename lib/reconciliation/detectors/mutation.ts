/**
 * Mutation Conflict Detector
 * Identifies pending, disputed, or inconsistent mutation states between registration and revenue records.
 */

import { DetectedConflict, ParcelBundle } from '../types';
import { StandardizedRecord } from '../standardizer';

export function detectMutationConflicts(
  bundle: ParcelBundle,
  standardizedRecords: StandardizedRecord[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  const mutationRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedRecordType.includes('mutation') ||
        r.raw.payload?.mutation_no !== undefined ||
        r.raw.payload?.mutation_type !== undefined)
  );

  const registrationDeeds = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedRecordType.includes('deed') || r.normalizedRecordType.includes('sale'))
  );

  for (const mut of mutationRecords) {
    const payload = mut.raw.payload || {};
    const status = (payload.status || mut.extractedMutationStatus || '').toUpperCase();

    if (status === 'PENDING' || status === 'DISPUTED' || status === 'UNMUTATED') {
      const regMatch = registrationDeeds.find(
        (r) => r.raw.payload?.deed_no || r.raw.payload?.seller || r.raw.payload?.buyer
      );

      const recordIds = [mut.raw.record_id];
      const sources = [mut.raw.source];
      if (regMatch) {
        recordIds.push(regMatch.raw.record_id);
        sources.push(regMatch.raw.source);
      }

      conflicts.push({
        conflict_type: 'MUTATION_CONFLICT',
        evidence: {
          what: `Revenue mutation is in ${status} status`,
          why: `Mutation (${payload.mutation_no || payload.mutation_type || 'Unnumbered'}) has status '${status}' and has not been finalized in revenue records.`,
          source: Array.from(new Set(sources)),
          record_ids: recordIds,
          values: {
            mutation_no: payload.mutation_no || null,
            mutation_type: payload.mutation_type || 'STANDARD_MUTATION',
            status,
            applicant: payload.applicant || null,
            applied_on: payload.applied_on || null,
          },
        },
      });
    }
  }

  // Also check if interest model flags PENDING_MUTATION
  const pendingInterests = bundle.interests.filter(
    (i) => i.status === 'PENDING_MUTATION' || i.status === 'PENDING_SUCCESSION'
  );
  if (pendingInterests.length > 0 && conflicts.length === 0) {
    conflicts.push({
      conflict_type: 'MUTATION_CONFLICT',
      evidence: {
        what: 'Pending mutation interest on parcel',
        why: 'One or more parcel interests are awaiting completion of revenue mutation.',
        source: ['InterestsRegistry'],
        record_ids: [],
        values: {
          pending_count: pendingInterests.length,
          interest_types: pendingInterests.map((i) => i.interest_type),
        },
      },
    });
  }

  return conflicts;
}
