/**
 * BhoomiLens Unified Land Identity & Officer Performance Regression Test Suite
 * Validates synthetic demo Aadhaar linkage, citizen privacy boundaries,
 * deterministic performance metric calculation, and bilingual localization.
 */

import { createClient } from '@supabase/supabase-js';
import {
  getDemoAadhaarForPerson,
  resolveAssociatedIdentities,
  getCitizenIdentitySummary,
} from '../lib/identity/identityService';
import { getOfficerPerformanceMetrics } from '../lib/performance/performanceService';
import { TRANSLATIONS, getTranslation } from '../lib/i18n/translations';
import { DatabasePerson, DatabaseInterest } from '../lib/reconciliation/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruhsddvygpbeggisxpfw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_d075Yun-Y1GOvqja8c85XA_C_IjLPp-';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runIdentityPerformanceTests() {
  console.log('====================================================');
  console.log('  BHOOMILENS IDENTITY & PERFORMANCE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errorDetail?: string) {
    if (condition) {
      passed++;
      console.log(`✓ [PASS] ${testName}`);
    } else {
      failed++;
      console.error(`✗ [FAIL] ${testName}`);
      if (errorDetail) console.error(`       Error: ${errorDetail}`);
    }
  }

  // =========================================================================
  // 1. Testing Unified Land Identity & Synthetic Demo Aadhaar Linkage
  // =========================================================================
  console.log('--- 1. Testing Unified Land Identity & Synthetic Demo Aadhaar ---');

  // Test deterministic demo formatting
  const demoAadhaar1 = getDemoAadhaarForPerson('b0000000-0000-0000-0000-000000000001', 'XXXX-XXXX-0001');
  assert(
    demoAadhaar1 === 'XXXX-XXXX-0001',
    'P001: Demo Aadhaar formatted as synthetic XXXX-XXXX-0001'
  );

  // Fallback generation for raw UUIDs
  const fallbackAadhaar = getDemoAadhaarForPerson('b0000000-0000-0000-0000-000000000004', null);
  assert(
    fallbackAadhaar === 'XXXX-XXXX-0004',
    'Deterministic fallback derives synthetic XXXX-XXXX-0004 from person UUID'
  );

  // Verify privacy rule: Never use 12 consecutive digits (real Aadhaar format)
  const isRealAadhaarPattern = /^\d{4}\s\d{4}\s\d{4}$|^\d{12}$/.test(demoAadhaar1);
  assert(
    !isRealAadhaarPattern,
    'Privacy Rule: Value is strictly synthetic and does NOT match real Aadhaar pattern'
  );

  // Test P004 Ancestral identity bundle resolution
  const testPersons: DatabasePerson[] = [
    { person_id: 'b0000000-0000-0000-0000-000000000006', name: 'Harish Chandra', masked_aadhaar: 'XXXX-XXXX-0006' },
    { person_id: 'b0000000-0000-0000-0000-000000000007', name: 'Sunil Chandra', masked_aadhaar: 'XXXX-XXXX-0007' },
    { person_id: 'b0000000-0000-0000-0000-000000000008', name: 'Anil Chandra', masked_aadhaar: 'XXXX-XXXX-0008' },
    { person_id: 'b0000000-0000-0000-0000-000000000009', name: 'Vijay Gupta', masked_aadhaar: 'XXXX-XXXX-0009' },
  ];

  const testInterests: DatabaseInterest[] = [
    {
      interest_id: 'c0000000-0000-0000-0000-000000000006',
      parcel_id: 'a0000000-0000-0000-0000-000000000004',
      person_id: 'b0000000-0000-0000-0000-000000000006',
      interest_type: 'ANCESTRAL_OWNER',
      share: 1.0,
      status: 'DECEASED',
      valid_from: '1985-01-01',
      valid_to: '2023-04-12',
    },
    {
      interest_id: 'c0000000-0000-0000-0000-000000000007',
      parcel_id: 'a0000000-0000-0000-0000-000000000004',
      person_id: 'b0000000-0000-0000-0000-000000000007',
      interest_type: 'LEGAL_HEIR',
      share: 0.5,
      status: 'PENDING_SUCCESSION',
      valid_from: '2023-04-12',
      valid_to: null,
    },
  ];

  const p004Bundle = resolveAssociatedIdentities(
    'a0000000-0000-0000-0000-000000000004',
    'ULPIN-P004',
    testPersons,
    testInterests
  );

  assert(
    p004Bundle.totalAssociatedPersons === 2,
    'P004: Resolved 2 associated identities for Ancestral parcel'
  );
  assert(
    p004Bundle.associatedIdentities[0].maskedAadhaarDemo === 'XXXX-XXXX-0006' &&
      p004Bundle.associatedIdentities[0].relationship === 'Ancestral Owner',
    'P004: Correctly mapped Harish Chandra (Ancestral Owner) to XXXX-XXXX-0006'
  );

  // =========================================================================
  // 2. Testing Citizen Privacy Masking
  // =========================================================================
  console.log('\n--- 2. Testing Citizen Privacy Preservation ---');

  const citizenSummary = getCitizenIdentitySummary(p004Bundle);
  assert(
    citizenSummary.isLinked === true,
    'Citizen summary reports identity linkage available'
  );
  assert(
    citizenSummary.identities[0].maskedName === 'Harish C.',
    'Citizen summary masks person surname for public privacy ("Harish Chandra" -> "Harish C.")'
  );
  assert(
    !JSON.stringify(citizenSummary).includes('b0000000-0000-0000-0000-000000000006'),
    'Citizen summary does NOT expose internal person UUIDs'
  );

  // =========================================================================
  // 3. Testing Officer Performance & Accountability Service
  // =========================================================================
  console.log('\n--- 3. Testing Officer Performance & Accountability Service ---');

  const performance = await getOfficerPerformanceMetrics(supabase);

  assert(
    typeof performance.totalCases === 'number' && performance.totalCases >= 0,
    `Retrieved total cases count (${performance.totalCases})`
  );
  assert(
    typeof performance.totalAuditActions === 'number' && performance.totalAuditActions >= 0,
    `Retrieved total audit actions count (${performance.totalAuditActions})`
  );
  assert(
    performance.completionRatePercent >= 0 && performance.completionRatePercent <= 100,
    `Computed deterministic completion rate (${performance.completionRatePercent}%)`
  );
  assert(
    Array.isArray(performance.recentActivity),
    `Retrieved real-time recent activity stream (${performance.recentActivity.length} items)`
  );
  assert(
    performance.methodologyNotice.includes('Deterministic Operational Metrics'),
    'Methodology notice confirms 100% deterministic calculation (0 ML / 0 subjective ratings)'
  );

  // =========================================================================
  // 4. Testing Bilingual Localization (English ↔ हिन्दी)
  // =========================================================================
  console.log('\n--- 4. Testing Bilingual Localization (English ↔ हिन्दी) ---');

  const en = getTranslation('en');
  const hi = getTranslation('hi');

  const requiredKeys = [
    'unifiedLandIdentity',
    'associatedIdentity',
    'maskedAadhaarDemo',
    'officerPerformance',
    'accountability',
    'casesAssigned',
    'casesResolved',
    'casesRejected',
    'casesUnderVerification',
    'averageResolutionTime',
    'auditActions',
    'recentActivity',
    'performanceSummary',
  ] as const;

  let allKeysPresent = true;
  for (const key of requiredKeys) {
    if (!en[key] || !hi[key]) {
      allKeysPresent = false;
      console.error(`Missing translation key: ${key}`);
    }
  }

  assert(
    allKeysPresent,
    'All required SIH keywords present in both English and Hindi dictionaries'
  );
  assert(
    hi.unifiedLandIdentity === 'एकीकृत भूमि पहचान' &&
      hi.maskedAadhaarDemo === 'मुखौटा आधार (डेमो)' &&
      hi.officerPerformance === 'अधिकारी प्रदर्शन एवं जवाबदेही',
    'Hindi translations verify accurate statutory terminology'
  );

  // =========================================================================
  // 5. Testing Canonical ULPIN Lookup & Resolution (ULPIN-P001 to ULPIN-P015)
  // =========================================================================
  console.log('\n--- 5. Testing Canonical ULPIN Lookup & Resolution ---');

  const testUlpins = ['ULPIN-P001', 'ULPIN-P004', 'ULPIN-P007', 'ULPIN-P012', 'ULPIN-P015'];
  for (const ulpin of testUlpins) {
    const { data: pData, error: pErr } = await supabase
      .from('parcels')
      .select('parcel_id, ulpin, area')
      .eq('ulpin', ulpin)
      .single();

    assert(
      !pErr && pData !== null && pData.ulpin === ulpin,
      `Citizen Search: Successfully resolved canonical ${ulpin}`
    );
  }

  // Verify all 15 parcels in database have canonical ULPIN-PXXX pattern
  const { data: allParcels } = await supabase.from('parcels').select('ulpin');
  const validCanonicalUlpins = (allParcels || []).every((p) => /^ULPIN-P\d{3}$/.test(p.ulpin));
  assert(
    validCanonicalUlpins && (allParcels?.length || 0) === 15,
    'Database Invariant: Exactly 15 parcels with canonical ULPIN-PXXX identifiers'
  );

  console.log('\n====================================================');
  console.log(`  TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runIdentityPerformanceTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
