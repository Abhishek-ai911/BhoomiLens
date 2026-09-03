/**
 * Deterministic Clarity Score Calculator
 * Calculates clarity on a 0-100 scale representing data consistency and completeness.
 * Strictly non-LLM, pure functional calculation.
 */

import { ConflictType, RecordStatus } from '../reconciliation/types';
import { ClarityScoreResult, ScoreDeduction, ScoringInput } from './types';

export const CONFLICT_DEDUCTIONS: Record<ConflictType, number> = {
  GOVERNMENT_LAND_RISK: 30,
  OWNERSHIP_CONFLICT: 25,
  COURT_CONFLICT: 20,
  CIRCULAR_TRANSACTION: 20,
  MUTATION_CONFLICT: 20,
  AREA_MISMATCH: 15,
  BOUNDARY_ANOMALY: 15,
  LAND_USE_CONFLICT: 15,
  MULTIPLE_ENCUMBRANCE: 15,
  LIFECYCLE_CONFLICT: 14,
  UNUSUAL_TRANSACTION_VELOCITY: 10,
  RECURRING_ENTITY: 10,
  TAX_CONFLICT: 10,
  MISSING_RECORD_CONFLICT: 0, // Handled exclusively via open-world state deductions
};

export const OPEN_WORLD_DEDUCTIONS: Record<RecordStatus, number> = {
  PRESENT: 0,
  CONFIRMED_ABSENT: 0,
  NOT_FOUND: 10,
  UNAVAILABLE: 15,
  CONFLICTING: 0,
};

/**
 * Calculates the Clarity score for a reconciled parcel.
 * Pure deterministic function without external dependencies or AI.
 */
export function calculateClarity(input: ScoringInput): ClarityScoreResult {
  const baseScore = 100;
  const breakdown: ScoreDeduction[] = [];
  let totalDeductions = 0;

  // 1. Conflict Deductions (unique per conflict type present on parcel)
  const uniqueConflictTypes = Array.from(
    new Set((input.conflicts || []).map((c) => c.conflict_type))
  );

  for (const cType of uniqueConflictTypes) {
    const deduction = CONFLICT_DEDUCTIONS[cType] ?? 0;
    if (deduction > 0) {
      breakdown.push({
        code: cType,
        category: 'CONFLICT',
        points: deduction,
        reason: `Detected conflict: ${cType}`,
      });
      totalDeductions += deduction;
    }
  }

  // 2. Open-World Incompleteness Deductions
  if (input.open_world_states_summary) {
    const notFoundCount = input.open_world_states_summary.NOT_FOUND || 0;
    if (notFoundCount > 0) {
      const deduction = notFoundCount * OPEN_WORLD_DEDUCTIONS.NOT_FOUND;
      breakdown.push({
        code: 'OPEN_WORLD_NOT_FOUND',
        category: 'OPEN_WORLD',
        points: deduction,
        reason: `${notFoundCount} record(s) searched but unindexed/not found (-${OPEN_WORLD_DEDUCTIONS.NOT_FOUND} each)`,
      });
      totalDeductions += deduction;
    }

    const unavailableCount = input.open_world_states_summary.UNAVAILABLE || 0;
    if (unavailableCount > 0) {
      const deduction = unavailableCount * OPEN_WORLD_DEDUCTIONS.UNAVAILABLE;
      breakdown.push({
        code: 'OPEN_WORLD_UNAVAILABLE',
        category: 'OPEN_WORLD',
        points: deduction,
        reason: `${unavailableCount} source system(s) offline/unavailable (-${OPEN_WORLD_DEDUCTIONS.UNAVAILABLE} each)`,
      });
      totalDeductions += deduction;
    }
  }

  const rawScore = baseScore - totalDeductions;
  const finalScore = Math.max(0, Math.min(100, rawScore));

  return {
    score: finalScore,
    baseScore,
    totalDeductions,
    breakdown,
  };
}
