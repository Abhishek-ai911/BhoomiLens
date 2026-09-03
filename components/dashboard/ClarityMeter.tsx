import React from 'react';

interface ClarityMeterProps {
  score: number;
  size?: 'sm' | 'md';
}

export function ClarityMeter({ score, size = 'md' }: ClarityMeterProps) {
  // Color tier based on score:
  // >= 80: High clarity (emerald)
  // 50-79: Medium clarity (amber)
  // < 50: Low clarity (rose)
  const getColors = (s: number) => {
    if (s >= 80) return { text: 'text-emerald-700', bg: 'bg-emerald-500', track: 'bg-emerald-100' };
    if (s >= 50) return { text: 'text-amber-700', bg: 'bg-amber-500', track: 'bg-amber-100' };
    return { text: 'text-rose-700', bg: 'bg-rose-500', track: 'bg-rose-100' };
  };

  const colors = getColors(score);

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full ${colors.bg}`}
            style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${colors.text}`}>{score}/100</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 min-w-[90px]">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-gray-500 font-medium">Clarity</span>
        <span className={`text-sm font-bold ${colors.text}`}>
          {score}
          <span className="text-xs font-normal text-gray-400">/100</span>
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colors.bg}`}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}
