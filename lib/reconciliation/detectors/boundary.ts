/**
 * Boundary Anomaly Detector
 * Identifies spatial boundary discrepancies and surveyor reported geometry anomalies.
 */

import { DetectedConflict, ParcelBundle } from '../types';
import { StandardizedRecord } from '../standardizer';

export function detectBoundaryAnomalies(
  bundle: ParcelBundle,
  standardizedRecords: StandardizedRecord[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  const surveyRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedSource.includes('survey') || r.normalizedRecordType.includes('cadastral'))
  );

  for (const surv of surveyRecords) {
    const payload = surv.raw.payload || {};
    const hasDiscrepancy =
      payload.boundary_discrepancy === true ||
      payload.boundary_status === 'MISMATCH' ||
      payload.difference_sqm !== undefined;

    if (hasDiscrepancy) {
      conflicts.push({
        conflict_type: 'BOUNDARY_ANOMALY',
        evidence: {
          what: 'Cadastral boundary anomaly or overlap reported',
          why: `Cadastral survey (${payload.survey_no || surv.raw.record_id}) indicates boundary discrepancy with physical ground limits or adjacent cadastral units.`,
          source: [surv.raw.source],
          record_ids: [surv.raw.record_id],
          values: {
            survey_no: payload.survey_no || null,
            gis_area_sqm: payload.gis_area_sqm || null,
            difference_sqm: payload.difference_sqm || null,
            boundary_status: payload.boundary_status || 'DISCREPANCY',
          },
        },
      });
    }
  }

  return conflicts;
}
