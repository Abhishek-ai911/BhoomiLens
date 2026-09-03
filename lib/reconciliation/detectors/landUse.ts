/**
 * Land Use Conflict Detector
 * Detects discrepancies between current revenue land classification and municipal/master plan zoning.
 */

import { DetectedConflict, ParcelBundle } from '../types';
import { normalizeString, StandardizedRecord } from '../standardizer';

export function detectLandUseConflicts(
  bundle: ParcelBundle,
  standardizedRecords: StandardizedRecord[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  const revenueRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedSource.includes('revenue') || r.normalizedRecordType.includes('jamabandi')) &&
      r.extractedLandUse
  );

  const planningRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedSource.includes('planning') ||
        r.normalizedRecordType.includes('master_plan') ||
        r.normalizedRecordType.includes('zoning')) &&
      r.extractedLandUse
  );

  for (const rev of revenueRecords) {
    const revUse = rev.extractedLandUse!;

    for (const plan of planningRecords) {
      const planZoning = plan.extractedLandUse!;
      const unapproved =
        plan.raw.payload?.conversion_status === 'UNAPPROVED' ||
        normalizeString(revUse) !== normalizeString(planZoning);

      if (unapproved && normalizeString(revUse) !== normalizeString(planZoning)) {
        conflicts.push({
          conflict_type: 'LAND_USE_CONFLICT',
          evidence: {
            what: 'Land-use mismatch between Revenue classification and Town Planning zoning',
            why: `Revenue records categorize the land as '${revUse}' while Town Planning Master Plan (${plan.raw.payload?.master_plan_code || 'General'}) designates it as '${planZoning}' without approved conversion.`,
            source: [rev.raw.source, plan.raw.source],
            record_ids: [rev.raw.record_id, plan.raw.record_id],
            values: {
              revenue_classification: revUse,
              planning_zoning: planZoning,
              conversion_status: plan.raw.payload?.conversion_status || 'NOT_FOUND',
            },
            comparison: {
              revenue: revUse,
              planning: planZoning,
            },
          },
        });
        return conflicts;
      }
    }
  }

  return conflicts;
}
