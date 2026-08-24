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
    <div className="bg-white/90 dark:bg-slate-950/75 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 text-xs font-bold uppercase tracking-wider mb-2">
            Specified Skilled Worker (特定技能) Sectors
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            SSW Industry Sectors &amp; Exam Requirements
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
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
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white transition-all shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Sector Category Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 py-2 text-xs rounded-xl transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black shadow-xs'
              : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white'
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
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white'
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
            className="rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl bg-slate-50/60 dark:bg-slate-900/80 p-6 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    sec.badge_color || 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {sec.name}
                </span>
                <span className="text-[11px] font-bold text-slate-400">CBT Format</span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-2">
                {sec.name}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4 font-normal">
                {sec.description}
              </p>

              {sec.key_topics && (
                <div className="space-y-1.5 mb-5 border-t border-slate-200/60 dark:border-slate-800 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Focus Areas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sec.key_topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-2 py-0.5 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Passing: <strong className="text-slate-900 dark:text-white">{sec.passing_score || '60%'}</strong>
              </span>

              <button
                onClick={() => setSelectedSectorModal(sec)}
                className="text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 cursor-pointer group-hover:underline"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sector Details Modal */}
      {selectedSectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedSectorModal.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSectorModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>{selectedSectorModal.description}</p>

              <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 p-4 rounded-2xl space-y-1 text-xs">
                <span className="font-extrabold text-amber-900 dark:text-amber-200 block">Exam Language &amp; Prerequisite:</span>
                <p className="text-amber-800 dark:text-amber-300">
                  Written test available in Japanese (with furigana). Requires JFT-Basic A2 certificate or JLPT N4.
                </p>
              </div>

              {selectedSectorModal.official_url && (
                <div className="pt-2">
                  <a
                    href={selectedSectorModal.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-md active:scale-95"
                  >
                    <span>Open Official Sector Evaluation Syllabus</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
