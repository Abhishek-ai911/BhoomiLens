/**
 * BhoomiLens Record Standardizer
 * Normalizes comparable values across diverse sources without mutating source records.
 */

import { DatabaseRecord } from './types';

export interface StandardizedRecord {
  raw: DatabaseRecord;
  normalizedSource: string;
  normalizedRecordType: string;
  extractedOwner: string | null;
  extractedArea: number | null;
  extractedLandUse: string | null;
  extractedTaxStatus: string | null;
  extractedTaxDues: number | null;
  extractedMutationStatus: string | null;
  extractedCourtStay: boolean;
  extractedChargesCount: number;
}

export function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function standardizeRecord(record: DatabaseRecord): StandardizedRecord {
  const payload = record.payload || {};

  // Extract owner/party names
  let extractedOwner: string | null = null;
  if (payload.owner) {
    extractedOwner = String(payload.owner);
  } else if (payload.buyer) {
    extractedOwner = String(payload.buyer);
  } else if (payload.applicant) {
    extractedOwner = String(payload.applicant);
  } else if (payload.taxpayer) {
    extractedOwner = String(payload.taxpayer);
  }

  // Extract area
  let extractedArea: number | null = null;
  if (typeof payload.area === 'number') {
    extractedArea = payload.area;
  } else if (typeof payload.deed_area_sqm === 'number') {
    extractedArea = payload.deed_area_sqm;
  } else if (typeof payload.gis_area_sqm === 'number') {
    extractedArea = payload.gis_area_sqm;
  } else if (typeof payload.area === 'string') {
    const parsed = parseFloat(payload.area);
    if (!isNaN(parsed)) extractedArea = parsed;
  }

  // Extract land use
  let extractedLandUse: string | null = null;
  if (payload.land_use) {
    extractedLandUse = String(payload.land_use);
  } else if (payload.zoning) {
    extractedLandUse = String(payload.zoning);
  } else if (payload.classification) {
    extractedLandUse = String(payload.classification);
  }

  // Extract tax
  let extractedTaxStatus: string | null = null;
  let extractedTaxDues: number | null = null;
  if (payload.dues !== undefined) {
    extractedTaxDues = Number(payload.dues);
    extractedTaxStatus = payload.status ? String(payload.status) : null;
  }

  // Extract mutation
  let extractedMutationStatus: string | null = null;
  if (record.record_type.toUpperCase().includes('MUTATION') || payload.mutation_no) {
    extractedMutationStatus = payload.status ? String(payload.status).toUpperCase() : 'PENDING';
  }

  // Extract court stay
  let extractedCourtStay = false;
  if (
    record.record_type.toUpperCase().includes('COURT') ||
    payload.stay_status === 'ACTIVE' ||
    payload.stay_status === 'ACTIVE_INJUNCTION' ||
    payload.order_type === 'TEMPORARY_INJUNCTION'
  ) {
    extractedCourtStay = true;
  }

  // Extract charges
  let extractedChargesCount = 0;
  if (payload.total_registered_charges !== undefined) {
    extractedChargesCount = Number(payload.total_registered_charges);
  } else if (record.record_type.toUpperCase().includes('MORTGAGE')) {
    extractedChargesCount = 1;
  }

  return {
    raw: record,
    normalizedSource: normalizeString(record.source),
    normalizedRecordType: normalizeString(record.record_type),
    extractedOwner,
    extractedArea,
    extractedLandUse,
    extractedTaxStatus,
    extractedTaxDues,
    extractedMutationStatus,
    extractedCourtStay,
    extractedChargesCount,
  };
}

export function standardizeBundleRecords(records: DatabaseRecord[]): StandardizedRecord[] {
  return records.map(standardizeRecord);
}
