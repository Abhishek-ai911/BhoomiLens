/**
 * Tax Conflict Detector
 * Identifies property tax arrears, delinquent dues, and tax assessment mismatches.
 */

import { DetectedConflict, ParcelBundle } from '../types';
import { StandardizedRecord } from '../standardizer';

export function detectTaxConflicts(
  bundle: ParcelBundle,
  standardizedRecords: StandardizedRecord[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  const taxRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedSource.includes('tax') ||
        r.normalizedRecordType.includes('tax') ||
        r.extractedTaxDues !== null)
  );

  for (const tax of taxRecords) {
    const dues = tax.extractedTaxDues || 0;
    const status = (tax.extractedTaxStatus || '').toUpperCase();

    if (dues > 0 || status.includes('DELINQUENT') || status.includes('UNPAID')) {
      conflicts.push({
        conflict_type: 'TAX_CONFLICT',
        evidence: {
          what: 'Delinquent unpaid property tax dues',
          why: `Municipal/Revenue tax assessment records show unpaid dues of ₹${dues.toLocaleString('en-IN')} with status '${status || 'UNPAID'}'.`,
          source: [tax.raw.source],
          record_ids: [tax.raw.record_id],
          values: {
            taxpayer: tax.extractedOwner || null,
            assessment_year: tax.raw.payload?.assessment_year || null,
            dues_amount: dues,
            status: status || 'UNPAID',
          },
        },
      });
    }
  }

  return conflicts;
}
