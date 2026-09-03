/**
 * BhoomiLens Reconciliation Engine Public API
 */

export * from './types';
export * from './standardizer';
export * from './engine';

import { SupabaseClient } from '@supabase/supabase-js';
import { ParcelBundle, ReconciliationResult } from './types';
import { reconcileParcel } from './engine';

/**
 * Loads a complete parcel bundle from Supabase and runs deterministic reconciliation.
 */
export async function fetchAndReconcileParcel(
  supabase: SupabaseClient,
  ulpinOrParcelId: string
): Promise<ReconciliationResult | null> {
  // 1. Fetch parcel
  let parcelQuery = supabase.from('parcels').select('*');
  if (ulpinOrParcelId.includes('-') && ulpinOrParcelId.length === 36) {
    parcelQuery = parcelQuery.eq('parcel_id', ulpinOrParcelId);
  } else {
    parcelQuery = parcelQuery.eq('ulpin', ulpinOrParcelId);
  }

  const { data: parcelData, error: parcelError } = await parcelQuery.single();
  if (parcelError || !parcelData) {
    return null;
  }

  const parcelId = parcelData.parcel_id;

  // 2. Fetch interests
  const { data: interestsData } = await supabase
    .from('interests')
    .select('*')
    .eq('parcel_id', parcelId);

  // 3. Fetch persons
  const { data: personsData } = await supabase.from('persons').select('*');

  // 4. Fetch records
  const { data: recordsData } = await supabase
    .from('records')
    .select('*')
    .eq('parcel_id', parcelId);

  // 5. Fetch transactions
  const { data: txData } = await supabase
    .from('transactions')
    .select('*')
    .eq('parcel_id', parcelId);

  // 6. Fetch authority rules
  const { data: authData } = await supabase.from('authority_rules').select('*');

  const bundle: ParcelBundle = {
    parcel: parcelData,
    persons: personsData || [],
    interests: interestsData || [],
    records: recordsData || [],
    transactions: txData || [],
    authorityRules: authData || [],
  };

  return reconcileParcel(bundle);
}
