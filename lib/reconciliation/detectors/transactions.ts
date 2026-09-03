/**
 * Transaction Pattern Detector
 * Deterministic detection for:
 * 1. Unusual Transaction Velocity (3+ transactions within 12 months)
 * 2. Circular Transactions (Cycle in transaction graph)
 * 3. Recurring Entity Patterns
 */

import { DetectedConflict, ParcelBundle } from '../types';

export function detectTransactionPatterns(bundle: ParcelBundle): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];
  const transactions = [...bundle.transactions].sort(
    (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()
  );

  if (transactions.length === 0) return conflicts;

  const personMap = new Map<string, string>();
  bundle.persons.forEach((p) => personMap.set(p.person_id, p.name));

  // 1. Transaction Velocity (3+ transactions within 12 months)
  const MS_IN_YEAR = 365.25 * 24 * 60 * 60 * 1000;
  for (let i = 0; i < transactions.length; i++) {
    const startTime = new Date(transactions[i].occurred_at).getTime();
    const windowTx = transactions.slice(i).filter((t) => {
      const tTime = new Date(t.occurred_at).getTime();
      return tTime - startTime <= MS_IN_YEAR;
    });

    if (windowTx.length >= 3) {
      const parties = windowTx.map((t) => ({
        from: personMap.get(t.from_person_id) || t.from_person_id,
        to: personMap.get(t.to_person_id) || t.to_person_id,
        date: t.occurred_at,
      }));

      conflicts.push({
        conflict_type: 'UNUSUAL_TRANSACTION_VELOCITY',
        evidence: {
          what: 'Unusual transaction velocity detected (3+ transfers within 12 months)',
          why: `${windowTx.length} ownership transfers occurred within a 12-month period. Enhanced human officer review recommended.`,
          source: ['TransactionsRegistry'],
          record_ids: [],
          values: {
            transaction_count_in_window: windowTx.length,
            time_window_months: 12,
            transactions: parties,
          },
        },
      });
      break; // One velocity flag per parcel is sufficient
    }
  }

  // 2. Circular Transactions (Cycle Detection in Directed Graph)
  // Build adjacency list
  const adj = new Map<string, string[]>();
  transactions.forEach((t) => {
    if (!adj.has(t.from_person_id)) adj.set(t.from_person_id, []);
    adj.get(t.from_person_id)!.push(t.to_person_id);
  });

  const visited = new Set<string>();
  const recStack = new Set<string>();
  let hasCycle = false;
  let cyclePath: string[] = [];

  function dfs(node: string, currentPath: string[]): boolean {
    visited.add(node);
    recStack.add(node);
    currentPath.push(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...currentPath])) return true;
      } else if (recStack.has(neighbor)) {
        hasCycle = true;
        cyclePath = [...currentPath, neighbor];
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  for (const personId of Array.from(adj.keys())) {
    if (!visited.has(personId)) {
      if (dfs(personId, [])) break;
    }
  }

  if (hasCycle && cyclePath.length > 0) {
    const cycleNames = cyclePath.map((id) => personMap.get(id) || id).join(' -> ');
    conflicts.push({
      conflict_type: 'CIRCULAR_TRANSACTION',
      evidence: {
        what: 'Circular transaction pattern detected',
        why: `Transactions form a closed loop (${cycleNames}). Enhanced investigation recommended.`,
        source: ['TransactionsRegistry'],
        record_ids: [],
        values: {
          cycle_path: cycleNames,
          involved_parties: cyclePath.map((id) => personMap.get(id) || id),
        },
      },
    });
  }

  // 3. Recurring Entity Pattern
  // Detect if an entity (e.g. broker/firm) is involved in multiple transactions on the parcel as intermediate buyer and seller
  const fromCounts = new Map<string, number>();
  const toCounts = new Map<string, number>();

  transactions.forEach((t) => {
    fromCounts.set(t.from_person_id, (fromCounts.get(t.from_person_id) || 0) + 1);
    toCounts.set(t.to_person_id, (toCounts.get(t.to_person_id) || 0) + 1);
  });

  for (const [personId, fCount] of Array.from(fromCounts.entries())) {
    const tCount = toCounts.get(personId) || 0;
    // Intermediary participating both as buyer and seller on the same parcel
    if (fCount >= 1 && tCount >= 1 && !hasCycle) {
      const entityName = personMap.get(personId) || personId;
      conflicts.push({
        conflict_type: 'RECURRING_ENTITY',
        evidence: {
          what: 'Recurring entity identified in parcel transaction chain',
          why: `Entity '${entityName}' appears repeatedly as intermediary transferee and transferor in parcel transactions.`,
          source: ['TransactionsRegistry'],
          record_ids: [],
          values: {
            entity_name: entityName,
            transfers_as_seller: fCount,
            transfers_as_buyer: tCount,
          },
        },
      });
      break;
    }
  }

  return conflicts;
}
