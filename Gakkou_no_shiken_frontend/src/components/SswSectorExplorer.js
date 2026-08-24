'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, ExternalLink, FileText, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function SswSectorExplorer({ sectorsData = [] }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectorModal, setSelectedSectorModal] = useState(null);

  const sectors = useMemo(() => {
    if (!sectorsData) return [];
    return typeof sectorsData === 'string' ? JSON.parse(sectorsData) : sectorsData;
  }, [sectorsData]);

  const filteredSectors = useMemo(() => {
    return sectors.filter((sec) => {
      const matchFilter = activeFilter === 'ALL' || sec.id === activeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        sec.name.toLowerCase().includes(query) ||
        sec.description.toLowerCase().includes(query);
      return matchFilter && matchQuery;
    });
  }, [sectors, activeFilter, searchQuery]);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl shadow-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 text-xs font-bold uppercase tracking-wider mb-2">
            Specified Skilled Worker (特定技能) Sectors
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            SSW Industry Sectors &amp; Exam Requirements
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Filter by sector category to view exam subjects, passing scores, and study syllabus links.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sector name..."
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Sector Category Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-2 rounded-2xl border border-slate-200/70">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 py-2 text-xs rounded-xl transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-white text-slate-900 font-black shadow-xs'
              : 'text-slate-600 font-semibold hover:text-slate-900'
          }`}
        >
          All Sectors ({sectors.length})
        </button>
        {sectors.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveFilter(sec.id)}
            className={`px-4 py-2 text-xs rounded-xl transition-all cursor-pointer ${
              activeFilter === sec.id
                ? 'bg-white text-slate-900 font-black shadow-xs'
                : 'text-slate-600 font-semibold hover:text-slate-900'
            }`}
          >
            {sec.name}
          </button>
        ))}
      </div>

      {/* Sectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSectors.map((sec) => (
          <div
            key={sec.id}
            className="rounded-3xl border border-slate-200/90 hover:border-amber-400 hover:shadow-xl bg-slate-50/60 p-6 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    sec.badge_color || 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {sec.name}
                </span>
                <span className="text-[11px] font-bold text-slate-400">CBT Format</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">{sec.description}</p>

              <div className="space-y-2 mb-5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                  Exam Sections:
                </span>
                <ul className="space-y-1.5">
                  {sec.test_components.map((comp, idx) => (
                    <li key={idx} className="text-xs text-slate-700 font-medium flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Passing Standard:</span>
                <strong className="text-slate-900 font-black bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {sec.passing_mark}
                </strong>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSectorModal(sec)}
                  className="flex-1 text-center py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Syllabus Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {sec.sample_pdf && (
                  <a
                    href={sec.sample_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-extrabold transition-all flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Popup */}
      {selectedSectorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-black text-slate-900">{selectedSectorModal.name}</h3>
              <button
                onClick={() => setSelectedSectorModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <p>{selectedSectorModal.description}</p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <strong className="text-slate-900 font-bold block mb-2">Required Language Prerequisite:</strong>
                <p className="text-xs text-slate-700 font-semibold">{selectedSectorModal.language_required}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900">
                <strong className="font-bold block mb-1">Passing Mark Threshold:</strong>
                <p className="text-xs">{selectedSectorModal.passing_mark}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedSectorModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <a
                href={selectedSectorModal.study_guide_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs shadow-md flex items-center gap-1.5"
              >
                <span>Open Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
