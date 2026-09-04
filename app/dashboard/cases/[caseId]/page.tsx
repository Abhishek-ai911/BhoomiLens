import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getCaseDetailById } from '@/lib/cases/caseService';
import { CaseDetailView } from '@/components/dashboard/CaseDetailView';

interface CasePageProps {
  params: {
    caseId: string;
  };
}

export default async function CaseDetailPage({ params }: CasePageProps) {
  const supabase = await createClient();
  const caseData = await getCaseDetailById(supabase, params.caseId);

  if (!caseData) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Case Record Not Found</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested case ID <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{params.caseId}</code> does not exist in the database or has been archived.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/queue"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm"
          >
            &larr; Return to Priority Queue
          </Link>
        </div>
      </div>
    );
  }

  return <CaseDetailView data={caseData} />;
}
