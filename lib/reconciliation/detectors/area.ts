/**
 * Area Mismatch Detector
 * Compares reported parcel areas across registered deeds, cadastral survey, and revenue records.
 */

import { DetectedConflict, ParcelBundle } from '../types';
import { StandardizedRecord } from '../standardizer';

export function detectAreaMismatch(
  bundle: ParcelBundle,
  standardizedRecords: StandardizedRecord[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  const registrationRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedSource.includes('registration') || r.normalizedRecordType.includes('deed')) &&
      r.extractedArea !== null
  );

  const surveyRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedSource.includes('survey') || r.normalizedRecordType.includes('cadastral')) &&
      r.extractedArea !== null
  );

  const revenueRecords = standardizedRecords.filter(
    (r) =>
      r.raw.status === 'PRESENT' &&
      (r.normalizedSource.includes('revenue') || r.normalizedRecordType.includes('jamabandi')) &&
      r.extractedArea !== null
  );

  // Compare Registration Area vs Survey Area
  for (const reg of registrationRecords) {
    const regArea = reg.extractedArea!;

    for (const surv of surveyRecords) {
      const survArea = surv.extractedArea!;
      const diff = Math.abs(regArea - survArea);
      const relativeDiff = diff / Math.max(regArea, survArea);

      // Flag if area difference exceeds 1% and > 5 sqm
      if (relativeDiff > 0.01 && diff > 5) {
        conflicts.push({
          conflict_type: 'AREA_MISMATCH',
          evidence: {
            what: 'Area discrepancy between Registered Deed and Cadastral Survey',
            why: `Registered deed specifies ${regArea} sq.m whereas Cadastral Survey GIS measurement reports ${survArea} sq.m (variance of ${diff} sq.m).`,
            source: [reg.raw.source, surv.raw.source],
            record_ids: [reg.raw.record_id, surv.raw.record_id],
            values: {
              deed_area_sqm: regArea,
              survey_area_sqm: survArea,
              variance_sqm: Number((survArea - regArea).toFixed(2)),
            },
            comparison: {
              registered_area: regArea,
              surveyed_area: survArea,
              difference: Number((survArea - regArea).toFixed(2)),
            },
          },
        });
        return conflicts;
      }
    }

    // Compare Registration Area vs Revenue Area (if no survey record)
    if (surveyRecords.length === 0) {
      for (const rev of revenueRecords) {
        const revArea = rev.extractedArea!;
        const diff = Math.abs(regArea - revArea);
        const relativeDiff = diff / Math.max(regArea, revArea);

        if (relativeDiff > 0.01 && diff > 5) {
          conflicts.push({
            conflict_type: 'AREA_MISMATCH',
            evidence: {
              what: 'Area discrepancy between Registered Deed and Revenue Jamabandi',
              why: `Registered deed specifies ${regArea} sq.m whereas Revenue record specifies ${revArea} sq.m (variance of ${diff} sq.m).`,
              source: [reg.raw.source, rev.raw.source],
              record_ids: [reg.raw.record_id, rev.raw.record_id],
              values: {
                deed_area_sqm: regArea,
                revenue_area_sqm: revArea,
                variance_sqm: Number((revArea - regArea).toFixed(2)),
              },
            },
          });
          return conflicts;
        }
      }
    }
  }

  return conflicts;
}
