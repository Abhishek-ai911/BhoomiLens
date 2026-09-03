/**
 * BhoomiLens Clarity & Priority Scoring Test Suite
 * Validates deterministic scoring against GOLDEN_TESTS.md and specification invariants.
 */

import { calculateClarity } from '../lib/scoring/clarity';
import { evaluatePriority } from '../lib/scoring/priority';
import { scoreParcel } from '../lib/scoring/index';
import { reconcileParcel } from '../lib/reconciliation/engine';
import { ParcelBundle } from '../lib/reconciliation/types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruhsddvygpbeggisxpfw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_d075Yun-Y1GOvqja8c85XA_C_IjLPp-';

const supabase = createClient(supabaseUrl, supabaseKey);

interface GoldenScoreExpectation {
  desc: string;
  expectedClarity: number;
  expectedPriority: string;
}

const GOLDEN_EXPECTATIONS: Record<string, GoldenScoreExpectation> = {
  'ULPIN-P001': { desc: 'P001: Clean Parcel', expectedClarity: 100, expectedPriority: 'LOW' },
  'ULPIN-P002': { desc: 'P002: Ownership Conflict', expectedClarity: 75, expectedPriority: 'HIGH' },
  'ULPIN-P003': { desc: 'P003: Mutation Pending', expectedClarity: 80, expectedPriority: 'MEDIUM' },
  'ULPIN-P004': { desc: 'P004: Ancestral Ownership (HERO)', expectedClarity: 41, expectedPriority: 'HIGH' },
  'ULPIN-P005': { desc: 'P005: Area & Boundary Mismatch', expectedClarity: 70, expectedPriority: 'MEDIUM' },
  'ULPIN-P006': { desc: 'P006: Land-Use Mismatch', expectedClarity: 85, expectedPriority: 'MEDIUM' },
  'ULPIN-P007': { desc: 'P007: Government / Poramboke Risk', expectedClarity: 70, expectedPriority: 'CRITICAL' },
  'ULPIN-P008': { desc: 'P008: Missing / Unavailable Data', expectedClarity: 75, expectedPriority: 'LOW' },
  'ULPIN-P009': { desc: 'P009: Court Dispute', expectedClarity: 80, expectedPriority: 'CRITICAL' },
  'ULPIN-P010': { desc: 'P010: Multiple Encumbrance', expectedClarity: 85, expectedPriority: 'HIGH' },
  'ULPIN-P011': { desc: 'P011: Transaction Velocity', expectedClarity: 80, expectedPriority: 'MEDIUM' },
  'ULPIN-P012': { desc: 'P012: Circular Transaction', expectedClarity: 70, expectedPriority: 'HIGH' },
  'ULPIN-P013': { desc: 'P013: Recurring Entity', expectedClarity: 90, expectedPriority: 'MEDIUM' },
  'ULPIN-P014': { desc: 'P014: Multiple Interests', expectedClarity: 100, expectedPriority: 'LOW' },
  'ULPIN-P015': { desc: 'P015: Simultaneous Conflicts', expectedClarity: 30, expectedPriority: 'CRITICAL' },
};

async function runScoringTests() {
  console.log('====================================================');
  console.log('  BHOOMILENS DETERMINISTIC SCORING TEST SUITE');
  console.log('  Testing Clarity & Priority for P001 - P015');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Fetch live parcels from Supabase and test reconciliation -> scoring pipeline
  const { data: parcels } = await supabase.from('parcels').select('*').order('ulpin');
  const { data: allPersons } = await supabase.from('persons').select('*');
  const { data: allInterests } = await supabase.from('interests').select('*');
  const { data: allRecords } = await supabase.from('records').select('*');
  const { data: allTx } = await supabase.from('transactions').select('*');

  if (!parcels) {
    console.error('Failed to load parcels from database');
    process.exit(1);
  }

  for (const parcel of parcels) {
    const bundle: ParcelBundle = {
      parcel,
      persons: allPersons || [],
      interests: (allInterests || []).filter((i) => i.parcel_id === parcel.parcel_id),
      records: (allRecords || []).filter((r) => r.parcel_id === parcel.parcel_id),
      transactions: (allTx || []).filter((t) => t.parcel_id === parcel.parcel_id),
    };

    const reconciliation = reconcileParcel(bundle);
    const score = scoreParcel({
      conflicts: reconciliation.conflicts,
      open_world_states_summary: reconciliation.open_world_states_summary,
    });

    const expected = GOLDEN_EXPECTATIONS[parcel.ulpin];
    if (!expected) continue;

    const clarityMatches = score.clarity.score === expected.expectedClarity;
    const priorityMatches = score.priority.priority === expected.expectedPriority;

    if (clarityMatches && priorityMatches) {
      passed++;
      console.log(`✓ [PASS] ${expected.desc}`);
      console.log(`       Clarity: ${score.clarity.score}/100 (Expected: ${expected.expectedClarity}/100)`);
      console.log(`       Priority: ${score.priority.priority} (Expected: ${expected.expectedPriority})`);
    } else {
      failed++;
      console.error(`✗ [FAIL] ${expected.desc}`);
      if (!clarityMatches) {
        console.error(`       Clarity Mismatch: Got ${score.clarity.score}/100, Expected ${expected.expectedClarity}/100`);
        console.error(`       Breakdown:`, score.clarity.breakdown);
      }
      if (!priorityMatches) {
        console.error(`       Priority Mismatch: Got ${score.priority.priority}, Expected ${expected.expectedPriority}`);
        console.error(`       Reasons:`, score.priority.reasons);
      }
    }
    console.log('');
  }

  // 2. Invariant Unit Tests
  console.log('--- Running Specific Invariant Unit Tests ---');

  // Invariant 1: Clarity clamping (never below 0, never above 100)
  const clampedLow = calculateClarity({
    conflicts: [
      { conflict_type: 'GOVERNMENT_LAND_RISK' },
      { conflict_type: 'OWNERSHIP_CONFLICT' },
      { conflict_type: 'COURT_CONFLICT' },
      { conflict_type: 'CIRCULAR_TRANSACTION' },
      { conflict_type: 'MUTATION_CONFLICT' },
      { conflict_type: 'AREA_MISMATCH' },
    ],
  });
  if (clampedLow.score === 0) {
    passed++;
    console.log('✓ [PASS] Invariant: Clarity clamped to 0 on massive deductions');
  } else {
    failed++;
    console.error(`✗ [FAIL] Invariant: Clarity below 0 not clamped: ${clampedLow.score}`);
  }

  // Invariant 2: CONFIRMED_ABSENT has zero deduction
  const confirmedAbsentClarity = calculateClarity({
    conflicts: [],
    open_world_states_summary: {
      PRESENT: 2,
      CONFIRMED_ABSENT: 5,
      NOT_FOUND: 0,
      UNAVAILABLE: 0,
      CONFLICTING: 0,
    },
  });
  if (confirmedAbsentClarity.score === 100) {
    passed++;
    console.log('✓ [PASS] Invariant: CONFIRMED_ABSENT causes zero deduction (100/100)');
  } else {
    failed++;
    console.error(`✗ [FAIL] Invariant: CONFIRMED_ABSENT deducted points: ${confirmedAbsentClarity.score}`);
  }

  // Invariant 3: NOT_FOUND = -10, UNAVAILABLE = -15
  const openWorldClarity = calculateClarity({
    conflicts: [],
    open_world_states_summary: {
      PRESENT: 1,
      CONFIRMED_ABSENT: 0,
      NOT_FOUND: 1,
      UNAVAILABLE: 1,
      CONFLICTING: 0,
    },
  });
  if (openWorldClarity.score === 75 && openWorldClarity.totalDeductions === 25) {
    passed++;
    console.log('✓ [PASS] Invariant: NOT_FOUND (-10) and UNAVAILABLE (-15) sum to -25 (75/100)');
  } else {
    failed++;
    console.error(`✗ [FAIL] Invariant: Open world deductions mismatch: ${openWorldClarity.score}`);
  }

  // Invariant 4: MISSING_RECORD_CONFLICT has zero additional deduction
  const missingRecordConflictClarity = calculateClarity({
    conflicts: [{ conflict_type: 'MISSING_RECORD_CONFLICT' }],
    open_world_states_summary: {
      PRESENT: 1,
      CONFIRMED_ABSENT: 0,
      NOT_FOUND: 1,
      UNAVAILABLE: 0,
      CONFLICTING: 0,
    },
  });
  if (missingRecordConflictClarity.score === 90) {
    passed++;
    console.log('✓ [PASS] Invariant: MISSING_RECORD_CONFLICT has zero extra deduction (90/100)');
  } else {
    failed++;
    console.error(`✗ [FAIL] Invariant: MISSING_RECORD_CONFLICT caused extra deduction: ${missingRecordConflictClarity.score}`);
  }

  // Invariant 5: 3 conflicts does NOT automatically become CRITICAL (e.g. P004 remains HIGH)
  const threeConflictsPriority = evaluatePriority({
    conflicts: [
      { conflict_type: 'OWNERSHIP_CONFLICT' },
      { conflict_type: 'MUTATION_CONFLICT' },
      { conflict_type: 'LIFECYCLE_CONFLICT' },
    ],
  });
  if (threeConflictsPriority.priority === 'HIGH') {
    passed++;
    console.log('✓ [PASS] Invariant: 3 conflicts does NOT escalate to CRITICAL (remains HIGH)');
  } else {
    failed++;
    console.error(`✗ [FAIL] Invariant: 3 conflicts evaluated to: ${threeConflictsPriority.priority}`);
  }

  // Invariant 6: 4 distinct simultaneous conflicts becomes CRITICAL
  const fourConflictsPriority = evaluatePriority({
    conflicts: [
      { conflict_type: 'OWNERSHIP_CONFLICT' },
      { conflict_type: 'MUTATION_CONFLICT' },
      { conflict_type: 'AREA_MISMATCH' },
      { conflict_type: 'LAND_USE_CONFLICT' },
    ],
  });
  if (fourConflictsPriority.priority === 'CRITICAL') {
    passed++;
    console.log('✓ [PASS] Invariant: 4 distinct conflicts escalates to CRITICAL');
  } else {
    failed++;
    console.error(`✗ [FAIL] Invariant: 4 distinct conflicts did not become CRITICAL: ${fourConflictsPriority.priority}`);
  }

  // Invariant 7: Priority does not change when only Clarity changes
  const priorityA = evaluatePriority({ conflicts: [{ conflict_type: 'MUTATION_CONFLICT' }] });
  const priorityB = evaluatePriority({
    conflicts: [{ conflict_type: 'MUTATION_CONFLICT' }],
    open_world_states_summary: { PRESENT: 1, CONFIRMED_ABSENT: 1, NOT_FOUND: 0, UNAVAILABLE: 0, CONFLICTING: 0 },
  });
  if (priorityA.priority === priorityB.priority && priorityA.priority === 'MEDIUM') {
    passed++;
    console.log('✓ [PASS] Invariant: Priority is completely independent from Clarity');
  } else {
    failed++;
    console.error('✗ [FAIL] Invariant: Priority changed with clarity inputs');
  }

  console.log('\n====================================================');
  console.log(`  TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runScoringTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
