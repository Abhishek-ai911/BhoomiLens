/**
 * BhoomiLens Golden Scenarios (P001 - P015) Reconciliation Test Suite
 * Validates deterministic conflict and evidence generation.
 */

import { reconcileParcel } from '../lib/reconciliation/engine';
import { ParcelBundle } from '../lib/reconciliation/types';
import { createClient } from '@supabase/supabase-js';

// Load environment variables if available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruhsddvygpbeggisxpfw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_d075Yun-Y1GOvqja8c85XA_C_IjLPp-';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('====================================================');
  console.log('  BHOOMILENS DETERMINISTIC RECONCILIATION ENGINE');
  console.log('  Testing Golden Scenarios P001 - P015');
  console.log('====================================================\n');

  // Fetch all parcels from database
  const { data: parcels, error: pErr } = await supabase.from('parcels').select('*').order('ulpin');
  if (pErr || !parcels) {
    console.error('Failed to fetch parcels from Supabase:', pErr);
    process.exit(1);
  }

  const { data: allPersons } = await supabase.from('persons').select('*');
  const { data: allInterests } = await supabase.from('interests').select('*');
  const { data: allRecords } = await supabase.from('records').select('*');
  const { data: allTx } = await supabase.from('transactions').select('*');

  let passedCount = 0;
  let failedCount = 0;

  const testExpectations: Record<string, { desc: string; expectedConflicts: string[]; forbiddenConflicts?: string[] }> = {
    'ULPIN-P001': {
      desc: 'P001: Clean Parcel',
      expectedConflicts: [],
    },
    'ULPIN-P002': {
      desc: 'P002: Ownership Conflict',
      expectedConflicts: ['OWNERSHIP_CONFLICT'],
    },
    'ULPIN-P003': {
      desc: 'P003: Mutation Pending',
      expectedConflicts: ['MUTATION_CONFLICT'],
    },
    'ULPIN-P004': {
      desc: 'P004: Ancestral Ownership (HERO)',
      expectedConflicts: ['OWNERSHIP_CONFLICT', 'MUTATION_CONFLICT', 'LIFECYCLE_CONFLICT'],
    },
    'ULPIN-P005': {
      desc: 'P005: Area & Boundary Mismatch',
      expectedConflicts: ['AREA_MISMATCH', 'BOUNDARY_ANOMALY'],
    },
    'ULPIN-P006': {
      desc: 'P006: Land-Use Mismatch',
      expectedConflicts: ['LAND_USE_CONFLICT'],
    },
    'ULPIN-P007': {
      desc: 'P007: Government / Poramboke Risk',
      expectedConflicts: ['GOVERNMENT_LAND_RISK'],
    },
    'ULPIN-P008': {
      desc: 'P008: Missing / Unavailable Data',
      expectedConflicts: ['MISSING_RECORD_CONFLICT'],
    },
    'ULPIN-P009': {
      desc: 'P009: Court Dispute',
      expectedConflicts: ['COURT_CONFLICT'],
    },
    'ULPIN-P010': {
      desc: 'P010: Multiple Encumbrance',
      expectedConflicts: ['MULTIPLE_ENCUMBRANCE'],
    },
    'ULPIN-P011': {
      desc: 'P011: Transaction Velocity',
      expectedConflicts: ['UNUSUAL_TRANSACTION_VELOCITY'],
    },
    'ULPIN-P012': {
      desc: 'P012: Circular Transaction',
      expectedConflicts: ['CIRCULAR_TRANSACTION'],
    },
    'ULPIN-P013': {
      desc: 'P013: Recurring Entity Pattern',
      expectedConflicts: ['RECURRING_ENTITY'],
    },
    'ULPIN-P014': {
      desc: 'P014: Multiple Fractional Interests',
      expectedConflicts: [],
    },
    'ULPIN-P015': {
      desc: 'P015: Multiple Simultaneous Conflicts',
      expectedConflicts: ['OWNERSHIP_CONFLICT', 'AREA_MISMATCH', 'COURT_CONFLICT', 'TAX_CONFLICT'],
    },
  };

  for (const parcel of parcels) {
    const bundle: ParcelBundle = {
      parcel,
      persons: allPersons || [],
      interests: (allInterests || []).filter((i) => i.parcel_id === parcel.parcel_id),
      records: (allRecords || []).filter((r) => r.parcel_id === parcel.parcel_id),
      transactions: (allTx || []).filter((t) => t.parcel_id === parcel.parcel_id),
    };

    const result = reconcileParcel(bundle);
    const expected = testExpectations[parcel.ulpin];

    if (!expected) {
      console.warn(`[WARN] No test expectations for ${parcel.ulpin}`);
      continue;
    }

    const detectedTypes = result.conflicts.map((c) => c.conflict_type);
    let isSuccess = true;
    const errors: string[] = [];

    // Check that all expected conflicts are present
    for (const exp of expected.expectedConflicts) {
      if (!detectedTypes.includes(exp as any)) {
        isSuccess = false;
        errors.push(`Missing expected conflict: ${exp}`);
      }
    }

    // If expectedConflicts is empty, ensure total conflicts is 0
    if (expected.expectedConflicts.length === 0 && result.conflicts.length > 0) {
      isSuccess = false;
      errors.push(`Expected 0 conflicts but found: ${detectedTypes.join(', ')}`);
    }

    // Check evidence completeness for every detected conflict
    for (const conf of result.conflicts) {
      if (!conf.evidence.what || !conf.evidence.why || conf.evidence.source.length === 0) {
        isSuccess = false;
        errors.push(`Incomplete evidence on ${conf.conflict_type}`);
      }
    }

    if (isSuccess) {
      passedCount++;
      console.log(`✓ [PASS] ${expected.desc}`);
      console.log(`       Conflicts: ${detectedTypes.length > 0 ? detectedTypes.join(', ') : 'None (Clean)'}`);
      if (result.conflicts.length > 0) {
        console.log(`       Evidence Sample: "${result.conflicts[0].evidence.why}"`);
      }
    } else {
      failedCount++;
      console.error(`✗ [FAIL] ${expected.desc}`);
      errors.forEach((err) => console.error(`       Error: ${err}`));
      console.error(`       Detected: ${detectedTypes.join(', ')}`);
    }
    console.log('');
  }

  console.log('====================================================');
  console.log(`  TOTAL: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log('====================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
