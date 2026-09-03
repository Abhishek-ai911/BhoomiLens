/**
 * Ownership Conflict Detector
 * Detects discrepancies between registered deeds, revenue jamabandi, and declared interests.
 */

import { DetectedConflict, ParcelBundle } from '../types';
import { normalizeString, StandardizedRecord } from '../standardizer';

export function detectOwnershipConflicts(
  bundle: ParcelBundle,
  standardizedRecords: StandardizedRecord[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  const registrationRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedSource.includes('registration') ||
        r.normalizedRecordType.includes('deed') ||
        r.normalizedRecordType.includes('sale'))
  );

  const revenueRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedSource.includes('revenue') ||
        r.normalizedRecordType.includes('jamabandi') ||
        r.normalizedRecordType.includes('ror'))
  );

  // Check 1: Direct comparison between active Registration records and Revenue records
  for (const reg of registrationRecords) {
    const regOwner = reg.extractedOwner;
    if (!regOwner) continue;

    for (const rev of revenueRecords) {
      const revOwner = rev.extractedOwner;
      if (!revOwner) continue;

      // If owners are different and neither is an authorized joint co-owner in partition deed
      if (normalizeString(regOwner) !== normalizeString(revOwner)) {
        // Exclude clean succession / transfer where mutation status explains pending transition (handled in mutation detector)
        // or check if there is an explicit unauthorized transfer or disputed ownership
        const isDisputed =
          reg.raw.payload?.unauthorized_ancestral_transfer ||
          bundle.interests.some((i) => i.status === 'DISPUTED') ||
          (!reg.raw.payload?.seller && !rev.raw.payload?.mutation_no);

        if (isDisputed || normalizeString(regOwner) !== normalizeString(revOwner)) {
          conflicts.push({
            conflict_type: 'OWNERSHIP_CONFLICT',
            evidence: {
              what: 'Ownership discrepancy between Registration and Revenue records',
              why: `Registration record (${reg.raw.payload?.deed_no || reg.raw.record_id}) lists '${regOwner}' while Revenue record (${rev.raw.payload?.khata_no || rev.raw.record_id}) lists '${revOwner}'.`,
              source: [reg.raw.source, rev.raw.source],
              record_ids: [reg.raw.record_id, rev.raw.record_id],
              values: {
                registration_owner: regOwner,
                revenue_owner: revOwner,
                registration_deed: reg.raw.payload?.deed_no,
                revenue_khata: rev.raw.payload?.khata_no,
              },
              comparison: {
                registration: regOwner,
                revenue: revOwner,
                match: false,
              },
            },
          });
          return conflicts; // One primary ownership conflict per pair is sufficient
        }
      }
    }
  }

  // Check 2: Disputed ownership interests
  const disputedInterests = bundle.interests.filter((i) => i.status === 'DISPUTED');
  if (disputedInterests.length > 0 && conflicts.length === 0) {
    const activeInterest = bundle.interests.find((i) => i.status === 'ACTIVE');
    const activePerson = bundle.persons.find((p) => p.person_id === activeInterest?.person_id);
    const disputedPerson = bundle.persons.find((p) => p.person_id === disputedInterests[0].person_id);

    conflicts.push({
      conflict_type: 'OWNERSHIP_CONFLICT',
      evidence: {
        what: 'Disputed ownership interests recorded on parcel',
        why: `Interest claims exist for both active holder '${activePerson?.name || 'Unknown'}' and disputed claimant '${disputedPerson?.name || 'Unknown'}'.`,
        source: ['InterestsRegistry'],
        record_ids: [],
        values: {
          active_holder: activePerson?.name,
          claimant: disputedPerson?.name,
        },
      },
    });
  }

  return conflicts;
}
