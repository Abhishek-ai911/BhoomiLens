import React from 'react';
import { OfficerQueueItem } from '@/lib/cases/types';

interface SummaryCardsProps {
  queueItems: OfficerQueueItem[];
  selectedPriority: string;
  onSelectPriority: (priority: string) => void;
}

export function SummaryCards({
  queueItems,
  selectedPriority,
  onSelectPriority,
}: SummaryCardsProps) {
  const totalCases = queueItems.length;
  const criticalCount = queueItems.filter((q) => q.priority === 'CRITICAL').length;
  const highCount = queueItems.filter((q) => q.priority === 'HIGH').length;
  const mediumCount = queueItems.filter((q) => q.priority === 'MEDIUM').length;
  const lowCount = queueItems.filter((q) => q.priority === 'LOW').length;

  const cards = [
    {
      id: 'ALL',
      title: 'Total Active Cases',
      count: totalCases,
      subtitle: 'In officer verification queue',
      colorClasses: 'border-slate-200 text-slate-900 bg-white hover:border-slate-300 hover:shadow-md',
      activeClasses: 'ring-2 ring-slate-800 border-slate-800 bg-slate-50 shadow-md',
      badgeBg: 'bg-slate-100 text-slate-700',
      icon: (
        <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'CRITICAL',
      title: 'Critical Priority',
      count: criticalCount,
      subtitle: 'Immediate action required',
      colorClasses: 'border-red-200 text-red-950 bg-white hover:border-red-300 hover:shadow-md',
      activeClasses: 'ring-2 ring-red-600 border-red-600 bg-red-50/60 shadow-md',
      badgeBg: 'bg-red-100 text-red-800',
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      id: 'HIGH',
      title: 'High Priority',
      count: highCount,
      subtitle: 'Elevated conflict attention',
      colorClasses: 'border-amber-200 text-amber-950 bg-white hover:border-amber-300 hover:shadow-md',
      activeClasses: 'ring-2 ring-amber-600 border-amber-600 bg-amber-50/60 shadow-md',
      badgeBg: 'bg-amber-100 text-amber-800',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'MEDIUM',
      title: 'Medium Priority',
      count: mediumCount,
      subtitle: 'Standard verification queue',
      colorClasses: 'border-sky-200 text-sky-950 bg-white hover:border-sky-300 hover:shadow-md',
      activeClasses: 'ring-2 ring-sky-600 border-sky-600 bg-sky-50/60 shadow-md',
      badgeBg: 'bg-sky-100 text-sky-800',
      icon: (
        <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'LOW',
      title: 'Low Priority',
      count: lowCount,
      subtitle: 'Routine/clean records',
      colorClasses: 'border-slate-200 text-slate-900 bg-white hover:border-slate-300 hover:shadow-md',
      activeClasses: 'ring-2 ring-slate-600 border-slate-600 bg-slate-50 shadow-md',
      badgeBg: 'bg-slate-100 text-slate-700',
      icon: (
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const isSelected = selectedPriority === card.id;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectPriority(card.id)}
            className={`flex flex-col p-4 rounded-xl border text-left transition-all duration-150 ${
              isSelected ? card.activeClasses : card.colorClasses
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.badgeBg}`}>{card.icon}</div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mt-1">
              {card.count}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">{card.subtitle}</p>
          </button>
        );
      })}
    </div>
  );
}
