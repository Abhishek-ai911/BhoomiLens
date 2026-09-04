import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { getOfficerPerformanceMetrics, OfficerPerformanceSummary } from '@/lib/performance/performanceService';
import { PerformanceView } from '@/components/dashboard/PerformanceView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Officer Performance & Accountability — BhoomiLens',
  description: 'Deterministic Officer Performance & Statutory Accountability Metrics',
};

export default async function PerformancePage() {
  const supabase = await createClient();
  let metrics: OfficerPerformanceSummary;

  try {
    metrics = await getOfficerPerformanceMetrics(supabase);
  } catch (err) {
    console.error('Failed to load performance metrics:', err);
    metrics = {
      totalCases: 0,
      casesAssigned: 0,
      casesUnderVerification: 0,
      casesResolved: 0,
      casesRejected: 0,
      casesMoreInfoRequested: 0,
      casesOpen: 0,
      totalAuditActions: 0,
      averageResolutionHours: 0,
      averageResolutionFormatted: 'N/A',
      completionRatePercent: 0,
      recentActivity: [],
      methodologyNotice:
        'Deterministic Operational Metrics: Aggregated in real time from immutable case lifecycle records and append-only audit events.',
    };
  }

  return <PerformanceView data={metrics} />;
}
