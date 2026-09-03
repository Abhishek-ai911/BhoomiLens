import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { getOfficerPriorityQueue } from '@/lib/cases/caseService';
import { OfficerDashboardClient } from '@/components/dashboard/OfficerDashboardClient';
import { OfficerQueueItem } from '@/lib/cases/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
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
    <OfficerDashboardClient
      initialQueue={queueItems}
      fetchError={fetchError}
    />
  );
}
