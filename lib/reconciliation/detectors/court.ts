/**
 * Court Dispute Detector
 * Identifies active litigation, temporary injunctions, stay orders, and attachment orders.
 */

import { DetectedConflict, ParcelBundle } from '../types';
import { StandardizedRecord } from '../standardizer';

export function detectCourtDisputes(
  bundle: ParcelBundle,
  standardizedRecords: StandardizedRecord[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  const courtRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedSource.includes('court') ||
        r.normalizedRecordType.includes('court') ||
        r.extractedCourtStay)
  );

  for (const court of courtRecords) {
    const payload = court.raw.payload || {};
    const suitNo = payload.suit_no || 'Unspecified';
    const courtName = payload.court || court.raw.source;
    const stayStatus = payload.stay_status || payload.order_type || 'ACTIVE';

    conflicts.push({
      conflict_type: 'COURT_CONFLICT',
      evidence: {
        what: 'Active court dispute or judicial injunction on parcel',
        why: `Judicial record indicates active case '${suitNo}' from '${courtName}' with status '${stayStatus}'.`,
        source: [court.raw.source],
        record_ids: [court.raw.record_id],
        values: {
          suit_no: suitNo,
          court: courtName,
          stay_status: stayStatus,
          order_type: payload.order_type || 'INJUNCTION',
          subject: payload.subject || null,
        },
      },
    });
  }

  // Also check if interest status reflects LITIGATION
  const litigationInterests = bundle.interests.filter((i) => i.status === 'LITIGATION');
  if (litigationInterests.length > 0 && conflicts.length === 0) {
    conflicts.push({
      conflict_type: 'COURT_CONFLICT',
      evidence: {
        what: 'Litigation flags on parcel interests',
        why: 'One or more ownership interests are subject to pending judicial dispute.',
        source: ['InterestsRegistry'],
        record_ids: [],
        values: {
          litigation_interests_count: litigationInterests.length,
        },
      },
    });
  }

  return conflicts;
}
