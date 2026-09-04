'use client';

import React, { useState, useEffect } from 'react';
import { ConflictEvidence, ConflictType } from '@/lib/reconciliation/types';
import { PriorityLevel } from '@/lib/scoring/types';
import { generateCaseExplanation, ExplanationResult } from '@/lib/ai/explanationService';

interface AiExplanationCardProps {
  conflictType: ConflictType;
  evidence: ConflictEvidence;
  clarity: number;
  priority: PriorityLevel;
  ulpin: string;
  classification?: string | null;
}

export function AiExplanationCard({
  conflictType,
  evidence,
  clarity,
  priority,
  ulpin,
  classification,
}: AiExplanationCardProps) {
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    generateCaseExplanation({
      conflictType,
      evidence,
      clarity,
      priority,
      ulpin,
      classification,
    })
      .then((res) => {
        if (isMounted) {
          setExplanation(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [conflictType, evidence, clarity, priority, ulpin, classification]);

  if (loading || !explanation) {
    return (
      <div className="bg-gradient-to-br from-indigo-900/10 via-slate-900/5 to-slate-900/10 rounded-2xl border border-indigo-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-xs font-bold text-indigo-900">Synthesizing Decision Support Briefing...</span>
        </div>
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-5/6" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-900/60 p-5 shadow-md space-y-4">
      {/* Header & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
          <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            <span>Decision Support Briefing</span>
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
            {explanation.isAiGenerated ? 'Gemini 1.5 Flash' : 'Deterministic Engine'}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Non-Authoritative
          </span>
        </div>
      </div>

      {/* 1. Executive Summary */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
          1. Executive Summary
        </span>
        <p className="text-xs text-slate-200 leading-relaxed font-normal">
          {explanation.summary}
        </p>
      </div>

      {/* 2. Key Risk & Impact Analysis */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
          2. Legal & Risk Analysis
        </span>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-800">
          {explanation.riskAnalysis}
        </p>
      </div>

      {/* 3. Recommended Officer Actions */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
          3. Recommended Verification Steps
        </span>
        <ul className="space-y-1.5">
          {explanation.recommendedActions.map((act, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-200 flex items-start gap-2 bg-slate-800/40 p-2 rounded-lg border border-slate-800/60"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-tight">{act}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Statutory Disclaimer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="leading-tight">{explanation.disclaimer}</span>
        <span className="font-mono text-[9px] text-slate-500">{ulpin}</span>
      </div>
    </div>
  );
}
