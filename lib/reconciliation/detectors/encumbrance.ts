/**
 * Encumbrance Conflict Detector
 * Detects multiple active mortgages, bank liens, and overlapping charges on the parcel.
 */

import { DetectedConflict, ParcelBundle } from '../types';
import { StandardizedRecord } from '../standardizer';

export function detectMultipleEncumbrances(
  bundle: ParcelBundle,
  standardizedRecords: StandardizedRecord[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  const mortgageRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedRecordType.includes('mortgage') ||
        r.raw.payload?.charge_id !== undefined ||
        r.normalizedSource.includes('cersai') ||
        r.normalizedSource.includes('bank'))
  );

  const ecRecord = standardizedRecords.find(
    (r) =>
      r.raw.status === 'PRESENT' &&
      r.normalizedRecordType.includes('encumbrance')
  );

  const totalChargesInEC = ecRecord?.extractedChargesCount || 0;
  const totalMortgageRecords = mortgageRecords.length;

  if (totalMortgageRecords >= 2 || totalChargesInEC >= 2) {
    const recordIds = mortgageRecords.map((m) => m.raw.record_id);
    if (ecRecord) recordIds.push(ecRecord.raw.record_id);

    const sources = mortgageRecords.map((m) => m.raw.source);
    if (ecRecord) sources.push(ecRecord.raw.source);

    const lenders = mortgageRecords
      .map((m) => m.raw.payload?.lender || m.extractedOwner || 'Unknown Lender')
      .join(', ');

    conflicts.push({
      conflict_type: 'MULTIPLE_ENCUMBRANCE',
      evidence: {
        what: 'Multiple active encumbrances/mortgage charges detected',
        why: `Found ${Math.max(totalMortgageRecords, totalChargesInEC)} active mortgage charges on the parcel from ${lenders || 'financial institutions'}.`,
        source: Array.from(new Set(sources)),
        record_ids: recordIds,
        values: {
          total_active_charges: Math.max(totalMortgageRecords, totalChargesInEC),
          lenders: mortgageRecords.map((m) => ({
            lender: m.raw.payload?.lender,
            loan_amount: m.raw.payload?.loan_amount,
            charge_id: m.raw.payload?.charge_id,
            created_date: m.raw.payload?.created_date,
          })),
        },
      },
    });
  }

  return conflicts;
}
