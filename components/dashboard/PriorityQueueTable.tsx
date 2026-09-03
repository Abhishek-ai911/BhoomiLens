'use client';

import React, { useState, useMemo } from 'react';
import { OfficerQueueItem } from '@/lib/cases/types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { ClarityMeter } from './ClarityMeter';

interface PriorityQueueTableProps {
  items: OfficerQueueItem[];
  selectedPriority: string;
  onSelectPriority: (priority: string) => void;
  isLoading?: boolean;
}

export function formatConflictName(type: string): string {
  const map: Record<string, string> = {
    GOVERNMENT_LAND_RISK: 'Government / Poramboke Land Risk',
    OWNERSHIP_CONFLICT: 'Ownership Mismatch',
    COURT_CONFLICT: 'Active Court Dispute / Stay',
    CIRCULAR_TRANSACTION: 'Circular Transaction Pattern',
    MUTATION_CONFLICT: 'Pending / Inconsistent Mutation',
    AREA_MISMATCH: 'Area Variance Discrepancy',
    BOUNDARY_ANOMALY: 'Spatial / Boundary Anomaly',
    LAND_USE_CONFLICT: 'Land-Use Classification Mismatch',
    MULTIPLE_ENCUMBRANCE: 'Multiple Active Encumbrances',
    LIFECYCLE_CONFLICT: 'Lifecycle / Succession Inconsistency',
    UNUSUAL_TRANSACTION_VELOCITY: 'High Transaction Velocity',
    RECURRING_ENTITY: 'Recurring Intermediary Entity',
    TAX_CONFLICT: 'Tax Assessment Conflict',
    MISSING_RECORD_CONFLICT: 'Unindexed / Missing Record State',
  };
  return map[type] || type.replace(/_/g, ' ');
}

export function PriorityQueueTable({
  items,
  selectedPriority,
  onSelectPriority,
  isLoading = false,
}: PriorityQueueTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // Filter items based on priority, status, and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Priority filter
      if (selectedPriority !== 'ALL' && item.priority !== selectedPriority) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesUlpin = item.parcel.ulpin.toLowerCase().includes(query);
        const matchesCaseId = item.case_id.toLowerCase().includes(query);
        const matchesConflict = item.conflict.conflict_type.toLowerCase().includes(query);
        const matchesWhy = item.conflict.evidence.why.toLowerCase().includes(query);
        const matchesClassification = (item.parcel.classification || '').toLowerCase().includes(query);

        if (!matchesUlpin && !matchesCaseId && !matchesConflict && !matchesWhy && !matchesClassification) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedPriority, statusFilter, searchTerm]);

  const toggleExpand = (caseId: string) => {
    setExpandedCaseId((prev) => (prev === caseId ? null : caseId));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-50/50">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Officer Priority Queue</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {filteredItems.length} {filteredItems.length === 1 ? 'case' : 'cases'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministically ordered: Priority tier &rarr; Lowest clarity first &rarr; Earliest creation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ULPIN, Case ID..."
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 text-slate-900 bg-white"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 text-slate-700 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNDER_VERIFICATION">Under Verification</option>
            <option value="MORE_INFO_REQUESTED">More Info Requested</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Priority Quick Filter */}
          {selectedPriority !== 'ALL' && (
            <button
              onClick={() => onSelectPriority('ALL')}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Clear Priority Filter ({selectedPriority}) &times;
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-slate-800 mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading priority queue data...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">No active cases in queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {items.length === 0
              ? 'All parcel records are currently verified or no pending conflict cases exist in the database.'
              : 'No cases match your active search and filter criteria.'}
          </p>
          {(searchTerm || statusFilter !== 'ALL' || selectedPriority !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                onSelectPriority('ALL');
              }}
              className="mt-4 text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-800 text-white hover:bg-slate-700"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* Data Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Priority & Tier</th>
                <th className="py-3 px-4">Clarity</th>
                <th className="py-3 px-4">Parcel (ULPIN)</th>
                <th className="py-3 px-4">Detected Conflict</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredItems.map((item) => {
                const isExpanded = expandedCaseId === item.case_id;
                const formattedConflict = formatConflictName(item.conflict.conflict_type);
                const createdDate = new Date(item.created_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <React.Fragment key={item.case_id}>
                    <tr
                      className={`transition-colors hover:bg-slate-50/80 cursor-pointer ${
                        isExpanded ? 'bg-slate-50/90 font-medium' : ''
                      }`}
                      onClick={() => toggleExpand(item.case_id)}
                    >
                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={item.priority} />
                      </td>

                      {/* Clarity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ClarityMeter score={item.clarity} />
                      </td>

                      {/* Parcel ULPIN */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-900 text-xs tracking-tight">
                            {item.parcel.ulpin}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {item.parcel.classification || 'Unclassified'}{' '}
                            {item.parcel.area ? `• ${item.parcel.area} sq.m` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Conflict */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col max-w-xs sm:max-w-sm">
                          <span className="font-semibold text-slate-900 text-xs">
                            {formattedConflict}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate mt-0.5" title={item.conflict.evidence.why}>
                            {item.conflict.evidence.why}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {createdDate}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(item.case_id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-colors"
                        >
                          <span>{isExpanded ? 'Hide' : 'Evidence'}</span>
                          <svg
                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Evidence Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <td colSpan={7} className="p-4 sm:p-5">
                          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Deterministic Evidence Package
                                </span>
                                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                  Case: {item.case_id}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                Conflict ID: <span className="font-mono">{item.conflict.conflict_id}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Left column: Summary & Details */}
                              <div className="space-y-2">
                                <div>
                                  <span className="font-semibold text-slate-700 block mb-0.5">What was detected:</span>
                                  <p className="text-slate-900 bg-slate-50 p-2 rounded border border-slate-100">
                                    {item.conflict.evidence.what}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-700 block mb-0.5">Why it requires review:</span>
                                  <p className="text-slate-900 bg-slate-50 p-2 rounded border border-slate-100">
                                    {item.conflict.evidence.why}
                                  </p>
                                </div>
                              </div>

                              {/* Right column: Sources, Records & Authority */}
                              <div className="space-y-2">
                                <div>
                                  <span className="font-semibold text-slate-700 block mb-0.5">Authoritative Sources Cited:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.conflict.evidence.source.map((src, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium text-[11px]">
                                        {src}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {item.conflict.evidence.record_ids.length > 0 && (
                                  <div>
                                    <span className="font-semibold text-slate-700 block mb-0.5">Record References:</span>
                                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                                      {item.conflict.evidence.record_ids.map((recId, i) => (
                                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                          {recId}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {item.conflict.evidence.authority && (
                                  <div>
                                    <span className="font-semibold text-slate-700 block mb-0.5">Applicable Authority Rule:</span>
                                    <span className="text-slate-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block font-medium">
                                      {item.conflict.evidence.authority}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
