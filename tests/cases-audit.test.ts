/**
 * BhoomiLens Cases, Human Review & Audit Regression Test Suite
 * Tests conflict persistence, idempotency, state transitions, audit trail integrity, and queue ordering.
 */

import { createClient } from '@supabase/supabase-js';
import { reconcileParcel } from '../lib/reconciliation/engine';
import { scoreParcel } from '../lib/scoring/index';
import { ParcelBundle } from '../lib/reconciliation/types';
import {
  syncReconciliationToDatabase,
  transitionCaseStatus,
  getOfficerPriorityQueue,
} from '../lib/cases/caseService';
import { getAuditLogsForCase } from '../lib/audit/auditService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruhsddvygpbeggisxpfw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_d075Yun-Y1GOvqja8c85XA_C_IjLPp-';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCasesAuditTests() {
  console.log('====================================================');
  console.log('  BHOOMILENS CASE + HUMAN REVIEW + AUDIT TEST SUITE');
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

  // Clean up previous test artifacts for test parcels to guarantee clean test isolation
  const testUlpinList = ['ULPIN-P004', 'ULPIN-P003', 'ULPIN-P007', 'ULPIN-P015'];
  const { data: testParcels } = await supabase.from('parcels').select('parcel_id').in('ulpin', testUlpinList);
  const testParcelIds = (testParcels || []).map((p) => p.parcel_id);

  if (testParcelIds.length > 0) {
    const { data: oldConflicts } = await supabase.from('conflicts').select('conflict_id').in('parcel_id', testParcelIds);
    const oldConflictIds = (oldConflicts || []).map((c) => c.conflict_id);

    if (oldConflictIds.length > 0) {
      const { data: oldCases } = await supabase.from('cases').select('case_id').in('conflict_id', oldConflictIds);
      const oldCaseIds = (oldCases || []).map((c) => c.case_id);

      if (oldCaseIds.length > 0) {
        await supabase.from('audit_logs').delete().in('case_id', oldCaseIds);
        await supabase.from('cases').delete().in('case_id', oldCaseIds);
      }
      await supabase.from('conflicts').delete().in('conflict_id', oldConflictIds);
    }
  }

  // Fetch P004 bundle (Ancestral Ownership — HERO)
  const { data: p004Parcel } = await supabase.from('parcels').select('*').eq('ulpin', 'ULPIN-P004').single();
  if (!p004Parcel) {
    console.error('Failed to load P004 from database');
    process.exit(1);
  }

  const { data: allPersons } = await supabase.from('persons').select('*');
  const { data: p004Interests } = await supabase.from('interests').select('*').eq('parcel_id', p004Parcel.parcel_id);
  const { data: p004Records } = await supabase.from('records').select('*').eq('parcel_id', p004Parcel.parcel_id);
  const { data: p004Tx } = await supabase.from('transactions').select('*').eq('parcel_id', p004Parcel.parcel_id);

  const p004Bundle: ParcelBundle = {
    parcel: p004Parcel,
    persons: allPersons || [],
    interests: p004Interests || [],
    records: p004Records || [],
    transactions: p004Tx || [],
  };

  const p004Reconciliation = reconcileParcel(p004Bundle);
  const p004Score = scoreParcel({
    conflicts: p004Reconciliation.conflicts,
    open_world_states_summary: p004Reconciliation.open_world_states_summary,
  });

  // TEST 1: Initial Conflict & Case Synchronization
  console.log('--- 1. Testing Conflict & Case Persistence ---');
  const syncResult1 = await syncReconciliationToDatabase(
    supabase,
    p004Parcel.parcel_id,
    p004Reconciliation,
    p004Score
  );

  assert(
    syncResult1.conflicts.length === 3,
    'Persisted all 3 detected conflicts for P004',
    `Expected 3 conflicts, got ${syncResult1.conflicts.length}`
  );

  assert(
    syncResult1.cases.length === 3,
    'Created exactly one case per detected conflict (3 cases)',
    `Expected 3 cases, got ${syncResult1.cases.length}`
  );

  // TEST 2: Idempotency on Repeated Synchronization
  console.log('\n--- 2. Testing Idempotency on Repeated Synchronization ---');
  const syncResult2 = await syncReconciliationToDatabase(
    supabase,
    p004Parcel.parcel_id,
    p004Reconciliation,
    p004Score
  );

  assert(
    syncResult2.created_conflicts_count === 0 && syncResult2.reused_conflicts_count === 3,
    'Repeated sync created 0 duplicate conflicts and reused all 3 existing conflicts',
    `Created: ${syncResult2.created_conflicts_count}, Reused: ${syncResult2.reused_conflicts_count}`
  );

  assert(
    syncResult2.created_cases_count === 0 && syncResult2.reused_cases_count === 3,
    'Repeated sync created 0 duplicate cases and reused all 3 existing cases',
    `Created: ${syncResult2.created_cases_count}, Reused: ${syncResult2.reused_cases_count}`
  );

  // Pick one case to test full state machine transitions
  const testCase = syncResult1.cases[0];
  const mockOfficerId = '11111111-2222-3333-4444-555555555555'; // Valid UUID representing auth.users.id
  const mockActorId = '99999999-8888-7777-6666-555555555555'; // Valid UUID representing officer auth.users.id

  // TEST 3: State Machine: OPEN -> ASSIGNED
  console.log('\n--- 3. Testing Case State Machine ---');
  const assignResult = await transitionCaseStatus(supabase, {
    caseId: testCase.case_id,
    action: 'ASSIGN',
    actorId: mockActorId,
    payload: { officerId: mockOfficerId, note: 'Assigned to Tehsildar' },
  });

  assert(
    assignResult.success && assignResult.case?.status === 'ASSIGNED' && assignResult.case.assigned_to === mockOfficerId,
    'Action ASSIGN: OPEN -> ASSIGNED with valid officer auth.users.id',
    assignResult.error
  );

  // TEST 4: State Machine: ASSIGNED -> UNDER_VERIFICATION
  const startVerifResult = await transitionCaseStatus(supabase, {
    caseId: testCase.case_id,
    action: 'START_VERIFICATION',
    actorId: mockActorId,
    payload: { note: 'Commenced field inspection at site' },
  });

  assert(
    startVerifResult.success && startVerifResult.case?.status === 'UNDER_VERIFICATION',
    'Action START_VERIFICATION: ASSIGNED -> UNDER_VERIFICATION',
    startVerifResult.error
  );

  // TEST 5: State Machine: UNDER_VERIFICATION -> MORE_INFO_REQUESTED
  const moreInfoResult = await transitionCaseStatus(supabase, {
    caseId: testCase.case_id,
    action: 'REQUEST_MORE_INFO',
    actorId: mockActorId,
    payload: { queryDetails: 'Requesting certified copy of legal heir succession certificate' },
  });

  assert(
    moreInfoResult.success && moreInfoResult.case?.status === 'MORE_INFO_REQUESTED',
    'Action REQUEST_MORE_INFO: UNDER_VERIFICATION -> MORE_INFO_REQUESTED',
    moreInfoResult.error
  );

  // Resume verification
  await transitionCaseStatus(supabase, {
    caseId: testCase.case_id,
    action: 'START_VERIFICATION',
    actorId: mockActorId,
    payload: { note: 'Documents received, resuming verification' },
  });

  // TEST 6: Invalid Transition Rejection
  const invalidTransition = await transitionCaseStatus(supabase, {
    caseId: testCase.case_id,
    action: 'START_VERIFICATION', // Already in UNDER_VERIFICATION
    actorId: mockActorId,
  });

  assert(
    !invalidTransition.success,
    'Invalid transition correctly rejected (START_VERIFICATION from UNDER_VERIFICATION)',
    invalidTransition.error
  );

  // TEST 7: Enforcement of required resolution justification
  const emptyResolve = await transitionCaseStatus(supabase, {
    caseId: testCase.case_id,
    action: 'RESOLVE',
    actorId: mockActorId,
    payload: { resolutionNote: '' }, // empty note
  });

  assert(
    !emptyResolve.success,
    'Empty resolution justification correctly rejected',
    emptyResolve.error
  );

  // TEST 8: State Machine: UNDER_VERIFICATION -> RESOLVED
  const resolveResult = await transitionCaseStatus(supabase, {
    caseId: testCase.case_id,
    action: 'RESOLVE',
    actorId: mockActorId,
    payload: {
      resolutionNote: 'Succession certificate verified from Civil Court record. Revenue mutation approved.',
    },
  });

  assert(
    resolveResult.success && resolveResult.case?.status === 'RESOLVED',
    'Action RESOLVE: UNDER_VERIFICATION -> RESOLVED with valid justification',
    resolveResult.error
  );

  // TEST 9: Terminal State Protection
  const terminalReopenAttempt = await transitionCaseStatus(supabase, {
    caseId: testCase.case_id,
    action: 'ASSIGN',
    actorId: mockActorId,
    payload: { officerId: mockOfficerId },
  });

  assert(
    !terminalReopenAttempt.success,
    'Action on terminal RESOLVED case correctly blocked',
    terminalReopenAttempt.error
  );

  // TEST 10: Rerun Reconciliation on RESOLVED case
  console.log('\n--- 4. Testing Rerun Behavior on Resolved Cases ---');
  const syncResult3 = await syncReconciliationToDatabase(
    supabase,
    p004Parcel.parcel_id,
    p004Reconciliation,
    p004Score
  );

  const resolvedCaseAfterRerun = syncResult3.cases.find((c) => c.case_id === testCase.case_id);
  assert(
    resolvedCaseAfterRerun?.status === 'RESOLVED',
    'Reconciliation rerun preserves existing RESOLVED case status (no silent reopening or duplication)',
    `Status after rerun: ${resolvedCaseAfterRerun?.status}`
  );

  // TEST 11: Audit Trail Verification
  console.log('\n--- 5. Testing Audit Log Integrity ---');
  const auditLogs = await getAuditLogsForCase(supabase, testCase.case_id);
  const loggedActions = auditLogs.map((a) => a.action);

  assert(
    auditLogs.length >= 5,
    `Recorded complete immutable audit history (${auditLogs.length} entries)`,
    `Logged actions: ${loggedActions.join(', ')}`
  );

  assert(
    loggedActions.includes('CASE_CREATED') &&
      loggedActions.includes('CASE_ASSIGNED') &&
      loggedActions.includes('VERIFICATION_STARTED') &&
      loggedActions.includes('MORE_INFO_REQUESTED') &&
      loggedActions.includes('CASE_RESOLVED'),
    'Audit history contains all expected lifecycle action records',
    `Logged actions: ${loggedActions.join(', ')}`
  );

  const createLog = auditLogs.find((a) => a.action === 'CASE_CREATED');
  assert(
    createLog?.details?.initial_clarity === 41 && createLog?.details?.initial_priority === 'HIGH',
    'CASE_CREATED audit log captured exact initial clarity (41) and priority (HIGH)',
    JSON.stringify(createLog?.details)
  );

  // TEST 12: Sync all other golden parcels to test Priority Queue
  console.log('\n--- 6. Testing Officer Priority Queue Ordering ---');
  const { data: allParcels } = await supabase.from('parcels').select('*');
  for (const p of (allParcels || []).filter((p) => p.ulpin === 'ULPIN-P007' || p.ulpin === 'ULPIN-P015' || p.ulpin === 'ULPIN-P003')) {
    const { data: pInterests } = await supabase.from('interests').select('*').eq('parcel_id', p.parcel_id);
    const { data: pRecords } = await supabase.from('records').select('*').eq('parcel_id', p.parcel_id);
    const { data: pTx } = await supabase.from('transactions').select('*').eq('parcel_id', p.parcel_id);

    const b: ParcelBundle = {
      parcel: p,
      persons: allPersons || [],
      interests: pInterests || [],
      records: pRecords || [],
      transactions: pTx || [],
    };
    const r = reconcileParcel(b);
    const s = scoreParcel({ conflicts: r.conflicts, open_world_states_summary: r.open_world_states_summary });
    await syncReconciliationToDatabase(supabase, p.parcel_id, r, s);
  }

  const queue = await getOfficerPriorityQueue(supabase);

  assert(queue.length > 0, `Retrieved officer priority queue (${queue.length} items)`);

  // Verify CRITICAL items precede HIGH and MEDIUM items in the queue
  let lastPriorityRank = 0;
  let isSortedCorrectly = true;
  const PRIO_RANK: Record<string, number> = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };

  for (let i = 0; i < queue.length; i++) {
    const currentRank = PRIO_RANK[queue[i].priority] || 99;
    if (currentRank < lastPriorityRank) {
      isSortedCorrectly = false;
      break;
    }
    lastPriorityRank = currentRank;
  }

  assert(
    isSortedCorrectly,
    'Officer Queue Ordering: CRITICAL before HIGH before MEDIUM before LOW',
    queue.map((q) => `${q.parcel.ulpin} (${q.priority}, Clarity: ${q.clarity})`).join(' -> ')
  );

  // Verify lower clarity appears first within the same priority
  const criticalItems = queue.filter((q) => q.priority === 'CRITICAL');
  let clarityAscending = true;
  for (let i = 1; i < criticalItems.length; i++) {
    if (criticalItems[i].clarity < criticalItems[i - 1].clarity) {
      clarityAscending = false;
      break;
    }
  }

  assert(
    clarityAscending,
    'Queue secondary sort: Lower clarity scores appear first within same priority tier',
    criticalItems.map((c) => `${c.parcel.ulpin} (Clarity: ${c.clarity})`).join(', ')
  );

  console.log('\n====================================================');
  console.log(`  TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCasesAuditTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
