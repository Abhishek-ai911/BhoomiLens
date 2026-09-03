import React from 'react';
import { CaseStatus } from '@/lib/cases/types';

interface StatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config: Record<CaseStatus, { label: string; badgeClasses: string }> = {
    OPEN: {
      label: 'Open',
      badgeClasses: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    ASSIGNED: {
      label: 'Assigned',
      badgeClasses: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    UNDER_VERIFICATION: {
      label: 'Under Verification',
      badgeClasses: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    MORE_INFO_REQUESTED: {
      label: 'More Info Requested',
      badgeClasses: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    RESOLVED: {
      label: 'Resolved',
      badgeClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    REJECTED: {
      label: 'Rejected',
      badgeClasses: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  };

  const item = config[status] || {
    label: status,
    badgeClasses: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.badgeClasses} ${className}`}
    >
      {item.label}
    </span>
  );
}
