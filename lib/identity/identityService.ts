/**
 * BhoomiLens Unified Land Identity Service
 * Resolves deterministic identity linkage (Parcel ↔ ULPIN ↔ Associated Person ↔ Masked Demo Aadhaar).
 *
 * NON-NEGOTIABLE PRIVACY & COMPLIANCE RULES:
 * 1. REAL AADHAAR NUMBERS ARE NEVER QUERIED, PROCESSED, STORED, OR DISPLAYED.
 * 2. All identifiers are synthetic demo strings (e.g., 'XXXX-XXXX-0004').
 * 3. Does NOT claim UIDAI verification (purely a demonstration of identity linkage architecture).
 * 4. Citizen portal displays only privacy-safe, heavily masked identity representations.
 */

import { DatabasePerson, DatabaseInterest, DatabaseRecord, DatabaseTransaction } from '../reconciliation/types';
import { formatLabel } from '../ui/formatters';

export interface AssociatedIdentity {
  personId: string;
  name: string;
  maskedAadhaarDemo: string;
  relationship: string;
  rawInterestType: string;
  share: number | null;
  status: string | null;
  isDeceased?: boolean;
}

export interface UnifiedLandIdentityBundle {
  ulpin: string;
  parcelId: string;
  associatedIdentities: AssociatedIdentity[];
  totalAssociatedPersons: number;
  isDemo: true;
  privacyNotice: string;
}

/**
 * Returns a deterministic, synthetic masked demo Aadhaar identifier.
 * Example: 'XXXX-XXXX-0004'
 */
export function getDemoAadhaarForPerson(personId: string, customMasked?: string | null): string {
  if (customMasked && customMasked.trim().length > 0) {
    return customMasked;
  }
  // Deterministic fallback derived from person UUID for test/offline resilience
  const suffix = personId.replace(/[^0-9a-fA-F]/g, '').slice(-4).padStart(4, '0');
  return `XXXX-XXXX-${suffix}`;
}

/**
 * Resolves all associated person identities for a parcel across its interests and records.
 */
export function resolveAssociatedIdentities(
  parcelId: string,
  ulpin: string,
  persons: DatabasePerson[],
  interests: DatabaseInterest[],
  records?: DatabaseRecord[],
  transactions?: DatabaseTransaction[]
): UnifiedLandIdentityBundle {
  const personMap = new Map<string, DatabasePerson>();
  persons.forEach((p) => personMap.set(p.person_id, p));

  const identityMap = new Map<string, AssociatedIdentity>();

  // 1. Process interests (primary statutory/revenue rights model)
  interests
    .filter((i) => i.parcel_id === parcelId)
    .forEach((i) => {
      const person = personMap.get(i.person_id);
      const name = person?.name || 'Unknown Entity';
      const maskedAadhaar = getDemoAadhaarForPerson(i.person_id, person?.masked_aadhaar);

      const relationship = formatLabel(i.interest_type);
      const isDeceased = i.status === 'DECEASED' || i.interest_type === 'ANCESTRAL_OWNER';

      if (!identityMap.has(i.person_id)) {
        identityMap.set(i.person_id, {
          personId: i.person_id,
          name,
          maskedAadhaarDemo: maskedAadhaar,
          relationship,
          rawInterestType: i.interest_type,
          share: i.share,
          status: i.status,
          isDeceased,
        });
      }
    });

  // 2. Fallback check for records if no interests found
  if (identityMap.size === 0 && records) {
    records
      .filter((r) => r.parcel_id === parcelId && r.person_id)
      .forEach((r) => {
        if (r.person_id && !identityMap.has(r.person_id)) {
          const person = personMap.get(r.person_id);
          if (person) {
            identityMap.set(r.person_id, {
              personId: r.person_id,
              name: person.name,
              maskedAadhaarDemo: getDemoAadhaarForPerson(r.person_id, person.masked_aadhaar),
              relationship: 'Record Associated Party',
              rawInterestType: 'RECORD_PARTY',
              share: null,
              status: r.status,
            });
          }
        }
      });
  }

  return {
    ulpin,
    parcelId,
    associatedIdentities: Array.from(identityMap.values()),
    totalAssociatedPersons: identityMap.size,
    isDemo: true,
    privacyNotice: 'Demo Aadhaar ID — Synthetic for SIH demonstration only. No real citizen Aadhaar is queried, verified, or stored.',
  };
}

/**
 * Creates a citizen-safe, privacy-preserving identity summary (no internal UUIDs, partially masked names).
 */
export function getCitizenIdentitySummary(bundle: UnifiedLandIdentityBundle): {
  isLinked: boolean;
  summaryText: string;
  identities: { maskedName: string; maskedAadhaarDemo: string; role: string }[];
} {
  if (bundle.associatedIdentities.length === 0) {
    return {
      isLinked: false,
      summaryText: 'No statutory identity links registered',
      identities: [],
    };
  }

  const identities = bundle.associatedIdentities.map((id) => {
    // Mask name for citizen privacy: e.g. "Harish Chandra" -> "Harish C."
    const parts = id.name.split(' ');
    const maskedName =
      parts.length > 1
        ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
        : id.name;

    return {
      maskedName,
      maskedAadhaarDemo: id.maskedAadhaarDemo,
      role: id.relationship,
    };
  });

  return {
    isLinked: true,
    summaryText: `${bundle.associatedIdentities.length} Associated Identity Link(s) Verified`,
    identities,
  };
}
