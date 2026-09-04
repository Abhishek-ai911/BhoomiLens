import React from 'react';
import { PriorityLevel } from '@/lib/scoring/types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, className = '', size = 'md' }: PriorityBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const config: Record<PriorityLevel, { label: string; badgeClasses: string; dotColor: string }> = {
    CRITICAL: {
      label: 'Critical',
      badgeClasses: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-600/20',
      dotColor: 'bg-red-600',
    },
    HIGH: {
      label: 'High',
      badgeClasses: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-600/20',
      dotColor: 'bg-amber-600',
    },
    MEDIUM: {
      label: 'Medium',
      badgeClasses: 'bg-sky-50 text-sky-800 border-sky-200 ring-1 ring-sky-600/20',
      dotColor: 'bg-sky-600',
    },
    LOW: {
      label: 'Low',
      badgeClasses: 'bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-600/20',
      dotColor: 'bg-slate-500',
    },
  };

  const item = config[priority] || config.LOW;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-tight font-semibold ${item.badgeClasses} ${sizeClasses[size]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dotColor}`} aria-hidden="true" />
      {item.label}
    </span>
  );
}
