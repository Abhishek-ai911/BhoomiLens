/**
 * BhoomiLens Scoring Module Types
 * Pure deterministic types for Clarity (0-100) and Priority (LOW, MEDIUM, HIGH, CRITICAL).
 */

import { ConflictType, RecordStatus } from '../reconciliation/types';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ScoreDeduction {
  code: string;
  category: 'CONFLICT' | 'OPEN_WORLD';
  points: number;
  reason: string;
}

export interface ClarityScoreResult {
  score: number; // Clamped to 0 - 100
  baseScore: number; // 100
  totalDeductions: number;
  breakdown: ScoreDeduction[];
}

export interface PriorityEvaluationResult {
  priority: PriorityLevel;
  reasons: string[];
  matchedRules: string[];
}

export interface ParcelScoreResult {
  clarity: ClarityScoreResult;
  priority: PriorityEvaluationResult;
}

export interface ScoringInput {
  conflicts: { conflict_type: ConflictType }[];
  open_world_states_summary?: Record<RecordStatus, number>;
}
