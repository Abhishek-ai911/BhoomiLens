/**
 * BhoomiLens Scoring Module Public API
 */

export * from './types';
export * from './clarity';
export * from './priority';

import { ScoringInput, ParcelScoreResult } from './types';
import { calculateClarity } from './clarity';
import { evaluatePriority } from './priority';

/**
 * Calculates both Clarity and Priority for a reconciled parcel.
 * Pure deterministic calculation.
 */
export function scoreParcel(input: ScoringInput): ParcelScoreResult {
  return {
    clarity: calculateClarity(input),
    priority: evaluatePriority(input),
  };
}
