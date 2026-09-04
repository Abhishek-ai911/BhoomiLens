/**
 * BhoomiLens Central UI Formatting Utility
 * Converts internal machine-readable tokens, enums, and identifiers into
 * clean, human-readable labels for UI presentation.
 *
 * IMPORTANT:
 * - Presentation ONLY. Never transforms database/backend values.
 * - Preserves ULPIN identifiers (e.g. ULPIN-P004).
 * - Preserves UUIDs and reference IDs.
 * - Handles null/undefined safely.
 */

const ACRONYMS = new Set(['ULPIN', 'GIS', 'NOC', 'ID', 'AI', 'II', 'III', 'IV', 'V', 'SIH']);

const CANONICAL_LABELS: Record<string, string> = {
  // Conflict Types
  OWNERSHIP_CONFLICT: 'Ownership Conflict',
  MUTATION_CONFLICT: 'Mutation Conflict',
  LIFECYCLE_CONFLICT: 'Lifecycle Conflict',
  AREA_MISMATCH: 'Area Mismatch',
  BOUNDARY_ANOMALY: 'Boundary Anomaly',
  LAND_USE_CONFLICT: 'Land Use Conflict',
  GOVERNMENT_LAND_RISK: 'Government Land Risk',
  COURT_CONFLICT: 'Court Conflict',
  TAX_CONFLICT: 'Tax Conflict',
  MULTIPLE_ENCUMBRANCE: 'Multiple Encumbrance',
  UNUSUAL_TRANSACTION_VELOCITY: 'Unusual Transaction Velocity',
  CIRCULAR_TRANSACTION: 'Circular Transaction',
  RECURRING_ENTITY: 'Recurring Entity',
  MISSING_RECORD_CONFLICT: 'Missing Record Conflict',

  // Case Statuses
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  UNDER_VERIFICATION: 'Under Verification',
  MORE_INFO_REQUESTED: 'More Info Requested',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',

  // Priority Levels
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',

  // Audit Actions
  CASE_CREATED: 'Case Created',
  CASE_ASSIGNED: 'Case Assigned',
  VERIFICATION_STARTED: 'Verification Started',
  MORE_INFO_REQUESTED_ACTION: 'More Info Requested',
  CASE_RESOLVED: 'Case Resolved',
  CASE_REJECTED: 'Case Rejected',
  RECONCILIATION_EVIDENCE_UPDATED: 'Reconciliation Evidence Updated',

  // Open-World Presence Statuses
  PRESENT: 'Present',
  NOT_FOUND: 'Not Found',
  CONFIRMED_ABSENT: 'Confirmed Absent',
  CONFLICTING: 'Conflicting',
  UNAVAILABLE: 'Unavailable',

  // Record Types
  JAMABANDI: 'Jamabandi',
  INDEX_II: 'Index II',
  SALE_DEED: 'Sale Deed',
  KHASRA_GIRDAWARI: 'Khasra Girdawari',
  NOC_CLEARANCE: 'NOC Clearance',
  MUTATION_REGISTER: 'Mutation Register',
  MASTER_PLAN_2031: 'Master Plan 2031',
  ENCUMBRANCE_CERTIFICATE: 'Encumbrance Certificate',
  TAX_ASSESSMENT: 'Tax Assessment',

  // Interest Types
  OWNERSHIP: 'Ownership',
  TITLE_CLAIM: 'Title Claim',
  MORTGAGE: 'Mortgage',
  POSSESSION: 'Possession',
  TENANCY: 'Tenancy',

  // Generic Statuses
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Converts a string to Title Case while preserving known acronyms.
 */
function toTitleCaseWord(word: string): string {
  const upper = word.toUpperCase();
  if (ACRONYMS.has(upper)) {
    return upper;
  }
  if (word.length === 0) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Universal UI Label Formatter.
 * Safely formats internal constants (with underscores, uppercase) into title case.
 * Does NOT alter ULPIN values or UUIDs.
 */
export function formatLabel(value?: string | null): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value).trim();
  if (str === '') return '';

  // Preserve ULPIN identifiers (e.g. ULPIN-P001, ULPIN-P004)
  if (str.startsWith('ULPIN-') || str.startsWith('ulpin-')) {
    return str;
  }

  // Preserve UUIDs
  if (UUID_REGEX.test(str)) {
    return str;
  }

  // Check canonical dictionary
  if (CANONICAL_LABELS[str]) {
    return CANONICAL_LABELS[str];
  }

  // Handle strings containing underscores or hyphens
  const words = str.split(/[_\\s-]+/);
  if (words.length > 1) {
    return words.map(toTitleCaseWord).join(' ');
  }

  // Single word
  return toTitleCaseWord(str);
}

/**
 * Format conflict type specifically (with canonical mapping).
 */
export function formatConflictName(type?: string | null): string {
  return formatLabel(type);
}

/**
 * Format case priority level (Critical, High, Medium, Low).
 */
export function formatPriority(priority?: string | null): string {
  return formatLabel(priority);
}

/**
 * Format case status (Open, Assigned, Under Verification, etc.).
 */
export function formatCaseStatus(status?: string | null): string {
  return formatLabel(status);
}

/**
 * Format presence status (Present, Not Found, Confirmed Absent, etc.).
 */
export function formatPresenceStatus(status?: string | null): string {
  return formatLabel(status);
}

/**
 * Format audit action (Case Created, Verification Started, etc.).
 */
export function formatAuditAction(action?: string | null): string {
  return formatLabel(action);
}
