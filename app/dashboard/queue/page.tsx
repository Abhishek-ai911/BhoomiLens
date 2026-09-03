import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { getOfficerPriorityQueue } from '@/lib/cases/caseService';
import { OfficerDashboardClient } from '@/components/dashboard/OfficerDashboardClient';
import { OfficerQueueItem } from '@/lib/cases/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Priority Queue — BhoomiLens Officer Portal',
  description: 'Deterministic Land-Record Priority Queue',
};

export default async function PriorityQueuePage() {
  let queueItems: OfficerQueueItem[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = await createClient();
    queueItems = await getOfficerPriorityQueue(supabase);
  } catch (err: any) {
    console.error('Error loading officer priority queue:', err);
    fetchError = err?.message || 'Unable to connect to database';
  }

  return (
    <div className="space-y-6">
      <OfficerDashboardClient
        initialQueue={queueItems}
        fetchError={fetchError}
      />
    </div>
  );
}
