'use server';

import { createClient } from '@/utils/supabase/server';
import { transitionCaseStatus } from '@/lib/cases/caseService';
import { CaseAction, ActionPayload } from '@/lib/cases/types';
import { revalidatePath } from 'next/cache';

/**
 * Server action to execute officer case state transitions.
 * Strictly authenticates the officer server-side and invokes the canonical transitionCaseStatus().
 */
export async function transitionCaseAction(params: {
  caseId: string;
  action: CaseAction;
  payload?: ActionPayload;
}) {
  try {
    const { caseId, action, payload } = params;

    if (!caseId || typeof caseId !== 'string' || caseId.trim() === '') {
      return { success: false, error: 'Case ID is required.' };
    }

    if (!action || typeof action !== 'string') {
      return { success: false, error: 'Case action is required.' };
    }

    const supabase = await createClient();

    // 1. Authenticate the current Supabase user strictly using the server client
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user || !user.id) {
      return {
        success: false,
        error: 'Authentication required. Please log in as an authorized officer to perform case actions.',
      };
    }

    const authUserId = user.id;

    // 2. Prepare payload for transition (strictly enforce server-side authenticated identity)
    const actionPayload: ActionPayload = payload ? { ...payload } : {};

    if (action === 'ASSIGN') {
      // For ASSIGN, officerId MUST be the authenticated Supabase Auth user ID (NEVER client-supplied, NEVER a person_id)
      actionPayload.officerId = authUserId;
    }

    // 3. Call canonical transitionCaseStatus from lib/cases/caseService.ts
    const result = await transitionCaseStatus(supabase, {
      caseId: caseId.trim(),
      action,
      actorId: authUserId,
      payload: actionPayload,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to execute case transition.',
      };
    }

    // 4. Revalidate cache for queue and case details
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/queue');
    revalidatePath(`/dashboard/cases/${caseId}`);

    return {
      success: true,
      case: result.case,
      auditLogId: result.auditLogId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred during case transition.',
    };
  }
}
