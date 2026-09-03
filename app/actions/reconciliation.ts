'use server';

import { createClient } from '@/utils/supabase/server';
import { reconcileParcel } from '@/lib/reconciliation/engine';
import { scoreParcel } from '@/lib/scoring/index';
import { syncReconciliationToDatabase } from '@/lib/cases/caseService';
import { ParcelBundle } from '@/lib/reconciliation/types';
import { revalidatePath } from 'next/cache';

/**
 * Idempotently reconciles all parcels in the database and synchronizes
 * detected conflicts and cases without creating duplicates.
 */
export async function syncAllParcelsAction() {
  try {
    const supabase = await createClient();

    const { data: parcels, error: pErr } = await supabase.from('parcels').select('*').order('ulpin');
    if (pErr || !parcels) {
      return { success: false, error: pErr?.message || 'Failed to fetch parcels' };
    }

    const { data: allPersons } = await supabase.from('persons').select('*');
    const { data: allInterests } = await supabase.from('interests').select('*');
    const { data: allRecords } = await supabase.from('records').select('*');
    const { data: allTx } = await supabase.from('transactions').select('*');

    let totalConflicts = 0;
    let totalCases = 0;

    for (const parcel of parcels) {
      const bundle: ParcelBundle = {
        parcel,
        persons: allPersons || [],
        interests: (allInterests || []).filter((i) => i.parcel_id === parcel.parcel_id),
        records: (allRecords || []).filter((r) => r.parcel_id === parcel.parcel_id),
        transactions: (allTx || []).filter((t) => t.parcel_id === parcel.parcel_id),
      };

      const reconciliation = reconcileParcel(bundle);
      const scores = scoreParcel({
        conflicts: reconciliation.conflicts,
        open_world_states_summary: reconciliation.open_world_states_summary,
      });

      const syncRes = await syncReconciliationToDatabase(
        supabase,
        parcel.parcel_id,
        reconciliation,
        scores
      );

      totalConflicts += syncRes.conflicts.length;
      totalCases += syncRes.cases.length;
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/queue');

    return {
      success: true,
      totalConflicts,
      totalCases,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unexpected synchronization error',
    };
  }
}
