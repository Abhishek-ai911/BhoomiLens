/**
 * Government / Poramboke Land Risk Detector
 * Identifies attempts to register, transact, or claim state-owned or communal poramboke land.
 */

import { DetectedConflict, ParcelBundle } from '../types';
import { StandardizedRecord } from '../standardizer';

export function detectGovernmentLandRisk(
  bundle: ParcelBundle,
  standardizedRecords: StandardizedRecord[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  const isGovParcel =
    bundle.parcel.classification?.toLowerCase().includes('government') ||
    bundle.parcel.classification?.toLowerCase().includes('poramboke') ||
    bundle.parcel.classification?.toLowerCase().includes('gair');

  const govtRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.raw.payload?.classification?.toLowerCase().includes('poramboke') ||
        r.raw.payload?.classification?.toLowerCase().includes('gair') ||
        r.raw.payload?.custodian?.toLowerCase().includes('state') ||
        r.raw.payload?.protected === true)
  );

  const privateClaims = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.raw.payload?.risk?.includes('GOVT') ||
        (r.normalizedRecordType.includes('deed') && !r.raw.payload?.custodian))
  );

  if ((isGovParcel || govtRecords.length > 0) && (privateClaims.length > 0 || bundle.interests.some(i => i.status === 'ENCROACHMENT_RISK'))) {
    const recordIds: string[] = [];
    const sources: string[] = [];

    govtRecords.forEach((r) => {
      recordIds.push(r.raw.record_id);
      sources.push(r.raw.source);
    });

    privateClaims.forEach((r) => {
      recordIds.push(r.raw.record_id);
      sources.push(r.raw.source);
    });

    conflicts.push({
      conflict_type: 'GOVERNMENT_LAND_RISK',
      evidence: {
        what: 'Private claim or transaction on protected Government / Poramboke land',
        why: 'Official records classify this parcel under State/Poramboke public custody, but private transactions or interest claims were detected.',
        source: Array.from(new Set(sources.length > 0 ? sources : ['Revenue', 'Registration'])),
        record_ids: recordIds,
        values: {
          parcel_classification: bundle.parcel.classification || 'Government/Poramboke',
          custodian: 'State Government',
          risk_flag: 'PRIVATE_SALE_ON_GOVT_LAND',
        },
      },
    });
  }

  return conflicts;
}
