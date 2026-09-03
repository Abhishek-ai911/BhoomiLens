/**
 * Lifecycle Conflict Detector
 * Detects discrepancies involving deceased record holders, uncompleted succession, or invalid post-mortem transfers.
 */

import { DetectedConflict, ParcelBundle } from '../types';
import { StandardizedRecord } from '../standardizer';

export function detectLifecycleConflicts(
  bundle: ParcelBundle,
  standardizedRecords: StandardizedRecord[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  const deathRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedRecordType.includes('death') ||
        r.raw.payload?.deceased !== undefined ||
        r.raw.payload?.dod !== undefined)
  );

  const revenueRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedRecordType.includes('jamabandi') || r.normalizedSource.includes('revenue'))
  );

  for (const death of deathRecords) {
    const deceasedName = death.raw.payload?.deceased;
    const dod = death.raw.payload?.dod;
    const certNo = death.raw.payload?.cert_no;

    // Check if active revenue record still shows deceased person as current owner or active
    const activeJamabandi = revenueRecords.find(
      (r) =>
        r.extractedOwner &&
        deceasedName &&
        r.extractedOwner.toLowerCase().includes(deceasedName.toLowerCase())
    );

    const isDeceasedInInterests = bundle.interests.some(
      (i) => i.status === 'DECEASED' || i.interest_type === 'ANCESTRAL_OWNER'
    );

    if (activeJamabandi || isDeceasedInInterests) {
      const recordIds = [death.raw.record_id];
      if (activeJamabandi) recordIds.push(activeJamabandi.raw.record_id);

      conflicts.push({
        conflict_type: 'LIFECYCLE_CONFLICT',
        evidence: {
          what: 'Active land record lists deceased individual without finalized legal succession',
          why: `Civil death certificate (${certNo || 'N/A'}) confirms '${deceasedName}' passed away on ${dod || 'unknown date'}, but revenue record remains active and inheritance/succession is incomplete.`,
          source: [death.raw.source, activeJamabandi ? activeJamabandi.raw.source : 'Revenue'],
          record_ids: recordIds,
          values: {
            deceased_person: deceasedName,
            date_of_death: dod,
            certificate_no: certNo,
            record_status_on_jamabandi: activeJamabandi?.raw.payload?.status || 'ACTIVE_ON_RECORD',
          },
        },
      });
    }
  }

  return conflicts;
}
