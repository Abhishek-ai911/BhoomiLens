/**
 * Deterministic Priority Level Evaluator
 * Evaluates urgency for human officer review.
 * Strictly independent from Clarity.
 * Strict cascade: CRITICAL -> HIGH -> MEDIUM -> LOW.
 */

import { ConflictType } from '../reconciliation/types';
import { PriorityEvaluationResult, PriorityLevel, ScoringInput } from './types';

/**
 * Evaluates the Priority level for a reconciled parcel.
 * Pure deterministic function without external dependencies or AI.
 */
export function evaluatePriority(input: ScoringInput): PriorityEvaluationResult {
  const uniqueConflictTypes = new Set(
    (input.conflicts || []).map((c) => c.conflict_type)
  );

  const matchedRules: string[] = [];
  const reasons: string[] = [];

  // Substantive conflict types excluding open-world missing record notification
  const substantiveConflicts = Array.from(uniqueConflictTypes).filter(
    (t) => t !== 'MISSING_RECORD_CONFLICT'
  );
  const distinctConflictCount = substantiveConflicts.length;

  // 1. CRITICAL PRIORITY CHECKS
  if (uniqueConflictTypes.has('GOVERNMENT_LAND_RISK')) {
    matchedRules.push('CRITICAL_GOVERNMENT_LAND_RISK');
    reasons.push('Direct risk or encroachment claim on State/Poramboke public land.');
  }

  if (uniqueConflictTypes.has('COURT_CONFLICT')) {
    matchedRules.push('CRITICAL_ACTIVE_COURT_STAY');
    reasons.push('Active civil court injunction or stay order restraining property alienation.');
  }

  if (distinctConflictCount >= 4) {
    matchedRules.push('CRITICAL_COMPOUND_CONFLICTS');
    reasons.push(
      `Compound risk escalation: ${distinctConflictCount} distinct simultaneous active conflict types detected.`
    );
  }

  if (matchedRules.length > 0) {
    return {
      priority: 'CRITICAL',
      reasons,
      matchedRules,
    };
  }

  // 2. HIGH PRIORITY CHECKS
  if (uniqueConflictTypes.has('OWNERSHIP_CONFLICT')) {
    matchedRules.push('HIGH_OWNERSHIP_CONFLICT');
    reasons.push('Contested legal title between Registration and Revenue records.');
  }

  if (uniqueConflictTypes.has('LIFECYCLE_CONFLICT')) {
    matchedRules.push('HIGH_LIFECYCLE_CONFLICT');
    reasons.push('Deceased record holder active without approved legal heir succession.');
  }

  if (uniqueConflictTypes.has('CIRCULAR_TRANSACTION')) {
    matchedRules.push('HIGH_CIRCULAR_TRANSACTION');
    reasons.push('Closed transaction cycle detected in property transfer history.');
  }

  if (uniqueConflictTypes.has('MULTIPLE_ENCUMBRANCE')) {
    matchedRules.push('HIGH_MULTIPLE_ENCUMBRANCE');
    reasons.push('Multiple active mortgage charges registered across financial institutions.');
  }

  if (matchedRules.length > 0) {
    return {
      priority: 'HIGH',
      reasons,
      matchedRules,
    };
  }

  // 3. MEDIUM PRIORITY CHECKS
  if (uniqueConflictTypes.has('MUTATION_CONFLICT')) {
    matchedRules.push('MEDIUM_MUTATION_CONFLICT');
    reasons.push('Pending or inconsistent revenue mutation status.');
  }

  if (uniqueConflictTypes.has('AREA_MISMATCH')) {
    matchedRules.push('MEDIUM_AREA_MISMATCH');
    reasons.push('Discrepancy between registered deed area and cadastral survey measurement.');
  }

  if (uniqueConflictTypes.has('BOUNDARY_ANOMALY')) {
    matchedRules.push('MEDIUM_BOUNDARY_ANOMALY');
    reasons.push('Surveyor-reported boundary discrepancy or physical plot variance.');
  }

  if (uniqueConflictTypes.has('LAND_USE_CONFLICT')) {
    matchedRules.push('MEDIUM_LAND_USE_CONFLICT');
    reasons.push('Revenue land-use classification conflicts with town planning master plan.');
  }

  if (uniqueConflictTypes.has('TAX_CONFLICT')) {
    matchedRules.push('MEDIUM_TAX_CONFLICT');
    reasons.push('Delinquent unpaid municipal or revenue property tax assessment.');
  }

  if (uniqueConflictTypes.has('UNUSUAL_TRANSACTION_VELOCITY')) {
    matchedRules.push('MEDIUM_TRANSACTION_VELOCITY');
    reasons.push('High transaction velocity (3+ transfers within 12 months).');
  }

  if (uniqueConflictTypes.has('RECURRING_ENTITY')) {
    matchedRules.push('MEDIUM_RECURRING_ENTITY');
    reasons.push('Repeated intermediate entity in property transfer chain.');
  }

  if (matchedRules.length > 0) {
    return {
      priority: 'MEDIUM',
      reasons,
      matchedRules,
    };
  }

  // 4. LOW PRIORITY (Default clean parcel or uncontested parcel with missing data)
  return {
    priority: 'LOW',
    reasons: ['No active legal, administrative, or spatial conflict flags detected.'],
    matchedRules: ['LOW_ROUTINE_MONITORING'],
  };
}
