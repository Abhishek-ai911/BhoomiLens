import React from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { reconcileParcel } from '@/lib/reconciliation/engine';
import { scoreParcel } from '@/lib/scoring/index';
import { ParcelBundle } from '@/lib/reconciliation/types';
import { CitizenPortalView, PublicConflictSummary } from '@/components/citizen/CitizenPortalView';
import { formatConflictName } from '@/lib/ui/formatters';
import { resolveAssociatedIdentities, getCitizenIdentitySummary } from '@/lib/identity/identityService';
import { AshokaChakra } from '@/components/ui/AshokaChakra';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export const metadata = {
  title: 'Parcel Verification | BhoomiLens Citizen Portal',
};

const PUBLIC_CONFLICT_MAPPING: Record<
  string,
  { title: string; template: string }
> = {
  OWNERSHIP_CONFLICT: {
    title: 'Ownership Record Mismatch',
    template:
      'The registered sale deed and the revenue land register list differing primary titleholders. Official review is underway.',
  },
  MUTATION_CONFLICT: {
    title: 'Pending Mutation Notice',
    template:
      'A mutation application has been filed but has not yet been finalized in the official revenue record.',
  },
  LIFECYCLE_CONFLICT: {
    title: 'Succession & Title Devolution Review',
    template:
      'Record indicates title in the name of a deceased individual or post-demise transaction requiring legal heir verification.',
  },
  AREA_MISMATCH: {
    title: 'Area Measurement Variance',
    template:
      'A variance was detected between the area specified in registered deeds and the cadastral ground survey measurement.',
  },
  BOUNDARY_ANOMALY: {
    title: 'Cadastral Boundary Clarification',
    template:
      'Cadastral boundary coordinates require survey alignment with adjoining parcel maps.',
  },
  LAND_USE_CONFLICT: {
    title: 'Zoning / Land-Use Review',
    template:
      'Land utilization differs from master plan zoning or requires formal Section 143/90-A conversion order.',
  },
  GOVERNMENT_LAND_RISK: {
    title: 'Public / State Custody Notice',
    template:
      'Official settlement records categorize this land under government/community custody, warranting administrative verification.',
  },
  MISSING_RECORD_CONFLICT: {
    title: 'Departmental Record Synchronization Gap',
    template:
      'One or more departmental archives have not yet linked digital records for this parcel.',
  },
  COURT_CONFLICT: {
    title: 'Active Judicial Lis Pendens Notice',
    template:
      'An active judicial proceeding or civil court restraint applies to transactions on this parcel.',
  },
  MULTIPLE_ENCUMBRANCE: {
    title: 'Active Financial Charges',
    template:
      'Multiple financial institution encumbrance or mortgage charges are registered on this property.',
  },
  UNUSUAL_TRANSACTION_VELOCITY: {
    title: 'Transaction Frequency Review',
    template:
      'Multiple successive property transfers have occurred within a short time frame, undergoing standard officer audit.',
  },
  CIRCULAR_TRANSACTION: {
    title: 'Chain of Title Review',
    template:
      'Transaction history exhibits re-conveyance patterns undergoing standard title chain verification.',
  },
  RECURRING_ENTITY: {
    title: 'Intermediary Record Verification',
    template:
      'Property transactions involve recurring intermediary entities undergoing standard compliance review.',
  },
  TAX_CONFLICT: {
    title: 'Outstanding Local Dues Notice',
    template:
      'Outstanding municipal tax or revenue cesses are recorded for this property.',
  },
};

export default async function CitizenParcelPage({
  params,
}: {
  params: { ulpin: string };
}) {
  const { ulpin } = params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruhsddvygpbeggisxpfw.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_d075Yun-Y1GOvqja8c85XA_C_IjLPp-';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch parcel by ULPIN
  const { data: parcel, error: parcelErr } = await supabase
    .from('parcels')
    .select('*')
    .eq('ulpin', decodeURIComponent(ulpin).trim())
    .maybeSingle();

  if (parcelErr || !parcel) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/citizen" className="flex items-center gap-2.5">
              <AshokaChakra size={26} color="#1e3a8a" />
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  BhoomiLens
                </span>
                <span className="text-[10px] uppercase tracking-wider text-blue-900 font-bold -mt-0.5">
                  Citizen Portal • Bhu-Aadhaar Transparency
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
              >
                <span>Officer Login</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl font-bold">
            ?
          </div>
          <h1 className="text-2xl font-black text-slate-900">Parcel Not Found</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            No cadastral record was found matching ULPIN{' '}
            <strong className="font-mono text-slate-900">{decodeURIComponent(ulpin)}</strong>.
            Please verify the 14-digit Bhu-Aadhaar number or explore our standard test scenarios.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/citizen"
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition"
            >
              Back to ULPIN Search
            </Link>
            <Link
              href="/citizen/ULPIN-P001"
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              Try Clean Parcel (ULPIN-P001)
            </Link>
          </div>
        </main>

        <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center">
          <span>BhoomiLens Citizen Portal &copy; 2026</span>
        </footer>
      </div>
    );
  }

  // 2. Fetch associated parcel records for deterministic score calculation
  const { data: allPersons } = await supabase.from('persons').select('*');
  const { data: interests } = await supabase.from('interests').select('*').eq('parcel_id', parcel.parcel_id);
  const { data: records } = await supabase.from('records').select('*').eq('parcel_id', parcel.parcel_id);
  const { data: transactions } = await supabase.from('transactions').select('*').eq('parcel_id', parcel.parcel_id);

  const bundle: ParcelBundle = {
    parcel,
    persons: allPersons || [],
    interests: interests || [],
    records: records || [],
    transactions: transactions || [],
  };

  const reconciliation = reconcileParcel(bundle);
  const scores = scoreParcel({
    conflicts: reconciliation.conflicts,
    open_world_states_summary: reconciliation.open_world_states_summary,
  });

  const uniqueDepartments = new Set((records || []).map((r) => r.source));

  // Map conflicts to non-jargon citizen summaries
  const publicConflicts: PublicConflictSummary[] = reconciliation.conflicts.map((c) => {
    const mapping = PUBLIC_CONFLICT_MAPPING[c.conflict_type] || {
      title: formatConflictName(c.conflict_type),
      template: c.evidence.what,
    };

    return {
      conflict_type: c.conflict_type,
      public_title: mapping.title,
      public_description: mapping.template,
      sources_involved: c.evidence.source,
    };
  });

  const identityBundle = resolveAssociatedIdentities(
    parcel.parcel_id,
    parcel.ulpin,
    allPersons || [],
    interests || [],
    records || [],
    transactions || []
  );
  const identitySummary = getCitizenIdentitySummary(identityBundle);

  const citizenData = {
    parcel: {
      parcel_id: parcel.parcel_id,
      ulpin: parcel.ulpin,
      geometry: parcel.geometry,
      area: parcel.area,
      classification: parcel.classification,
    },
    clarityScore: scores.clarity.score,
    priorityLevel: scores.priority.priority,
    isClear: reconciliation.conflicts.length === 0,
    publicConflicts,
    indexedDepartmentsCount: uniqueDepartments.size,
    identitySummary,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/citizen" className="flex items-center gap-2.5">
            <AshokaChakra size={26} color="#1e3a8a" />
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900">
                BhoomiLens
              </span>
              <span className="text-[10px] uppercase tracking-wider text-blue-900 font-bold -mt-0.5">
                Citizen Portal • Bhu-Aadhaar Transparency
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
            >
              <span>Officer Login</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <CitizenPortalView data={citizenData} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>BhoomiLens Citizen Portal &copy; 2026 — Public Land Records Transparency</span>
          <span className="font-mono text-[11px] text-slate-400">Department of Land Resources / Revenue Dept</span>
        </div>
      </footer>
    </div>
  );
}
