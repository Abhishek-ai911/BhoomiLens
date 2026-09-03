/**
 * BhoomiLens Immutable Audit Service
 * Strictly records append-only audit trail entries in audit_logs.
 * Never modifies or deletes historical logs.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AuditAction, DatabaseAuditLog } from '../cases/types';

export interface RecordAuditParams {
  caseId: string | null;
  action: AuditAction | string;
  actorId?: string | null; // MUST be auth.users.id only
  occurredAt?: string;
  details?: Record<string, any> | null;
}

/**
 * Appends an immutable audit log row to the database.
 */
export async function recordAuditLog(
  supabase: SupabaseClient,
  params: RecordAuditParams
): Promise<DatabaseAuditLog> {
  const auditLogId = crypto.randomUUID();
  const occurredAt = params.occurredAt || new Date().toISOString();

  const row: DatabaseAuditLog = {
    audit_log_id: auditLogId,
    case_id: params.caseId,
    action: params.action,
    actor_id: params.actorId || null,
    occurred_at: occurredAt,
    details: params.details || null,
  };

  const { error } = await supabase.from('audit_logs').insert(row);
  if (error) {
    throw new Error(`Failed to record audit log: ${error.message}`);
  }

  return row;
}

/**
 * Fetches the complete immutable audit history for a specific case.
 */
export async function getAuditLogsForCase(
  supabase: SupabaseClient,
  caseId: string
): Promise<DatabaseAuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('case_id', caseId)
    .order('occurred_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch audit logs for case ${caseId}: ${error.message}`);
  }

  return data || [];
}
