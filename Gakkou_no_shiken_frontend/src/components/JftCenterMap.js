'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Search, Building2, ExternalLink, ArrowRight } from 'lucide-react';

export default function JftCenterMap({ centersData = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [activeCenter, setActiveCenter] = useState(null);
  const [leafletMap, setLeafletMap] = useState(null);
  const [markers, setMarkers] = useState({});

  const centers = useMemo(() => {
    if (!centersData) return [];
    return typeof centersData === 'string' ? JSON.parse(centersData) : centersData;
  }, [centersData]);

  const districts = useMemo(() => {
    const set = new Set(centers.map((c) => c.district));
    return Array.from(set);
  }, [centers]);

  const filteredCenters = useMemo(() => {
    return centers.filter((c) => {
      const matchDistrict = selectedDistrict === 'ALL' || c.district === selectedDistrict;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query) ||
        (c.center_number && c.center_number.toLowerCase().includes(query)) ||
        (c.operator && c.operator.toLowerCase().includes(query)) ||
        c.district.toLowerCase().includes(query);
      return matchDistrict && matchQuery;
    });
  }, [centers, searchQuery, selectedDistrict]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window === 'undefined' || !window.L) return;
      const mapContainer = document.getElementById('react-leaflet-jft-map');
      if (!mapContainer || leafletMap) return;

      try {
        const L = window.L;
        const map = L.map('react-leaflet-jft-map').setView([23.765, 90.395], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const newMarkers = {};
        centers.forEach((c) => {
          if (c.latitude && c.longitude) {
            const marker = L.marker([c.latitude, c.longitude])
              .addTo(map)
              .bindPopup(`
                <div class="p-2 font-sans max-w-xs">
                  <div class="flex items-center gap-1 mb-1">
                    <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white">${
                      c.center_number || 'Center'
                    }</span>
                    <span class="text-[10px] text-slate-500 font-bold">${c.district}</span>
                  </div>
                  <strong class="text-sm font-bold text-slate-900 block mb-1 leading-snug">${c.name}</strong>
                  <p class="text-xs text-slate-600 mb-2">${c.address}</p>
                  <p class="text-[11px] text-slate-500 font-semibold mb-2">Operator: ${c.operator}</p>
                  ${
                    c.google_map_url
                      ? `<a href="${c.google_map_url}" target="_blank" rel="noopener" class="inline-block text-[10px] font-bold bg-slate-900 text-white px-2 py-1 rounded">Google Maps ↗</a>`
                      : ''
                  }
                </div>
              `);

            marker.on('click', () => {
              setActiveCenter(c.id);
            });

            newMarkers[c.id] = marker;
          }
        });

        setLeafletMap(map);
        setMarkers(newMarkers);
      } catch (err) {
        console.error('Error initializing map:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [centers, leafletMap]);

  const handleSelectCenter = (center) => {
    setActiveCenter(center.id);
    if (leafletMap && center.latitude && center.longitude) {
      leafletMap.flyTo([center.latitude, center.longitude], 14, { duration: 1.2 });
      if (markers[center.id]) {
        markers[center.id].openPopup();
      }
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-950/75 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-colors duration-300">
      {/* Component Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-rose-950/60 text-japan-red dark:text-rose-300 border border-red-100 dark:border-rose-800/60 text-xs font-extrabold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-japan-red animate-pulse"></span>
            Official Prometric Bangladesh Test Centers
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Prometric Bangladesh Exam Centers (BDJ01 &amp; BDJ02)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official test venues in Bangladesh for JFT-Basic and SSW Skills Evaluation Exams.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search BDJ01, BDJ02, address..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-japan-red/20 focus:border-japan-red focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
            <button
              onClick={() => setSelectedDistrict('ALL')}
              className={`px-3.5 py-1.5 text-xs rounded-xl transition-all cursor-pointer ${
                selectedDistrict === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({centers.length})
            </button>
            {districts.map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistrict(dist)}
                className={`px-3.5 py-1.5 text-xs rounded-xl transition-all cursor-pointer ${
                  selectedDistrict === dist
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split View: Venue Cards List + Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Venue Cards List */}
        <div className="lg:col-span-5 flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1.5 custom-scrollbar">
          {filteredCenters.map((center) => (
            <div
              key={center.id}
              onClick={() => handleSelectCenter(center)}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                activeCenter === center.id
                  ? 'border-japan-red dark:border-rose-500 bg-gradient-to-r from-red-50/60 to-white dark:from-rose-950/40 dark:to-slate-900 shadow-md ring-1 ring-japan-red/30'
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/90 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-japan-red text-white shadow-xs">
                  {center.center_number || 'BDJ01'}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {center.district}
                </span>
              </div>

              <h4 className="font-extrabold text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 text-base leading-snug transition-colors mb-1">
                {center.name}
              </h4>

              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Operating Company: <strong>{center.operator}</strong></span>
              </p>

              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 flex items-start gap-1.5 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80">
                <MapPin className="w-4 h-4 text-japan-red dark:text-rose-400 mt-0.5 flex-shrink-0" />
                <span>{center.address}</span>
              </p>

              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                {center.google_map_url ? (
                  <a
                    href={center.google_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl transition-all shadow-xs"
                  >
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Prometric Verified</span>
                )}

                <span className="text-xs font-bold text-japan-red dark:text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Show on Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}

          {filteredCenters.length === 0 && (
            <div className="p-10 text-center bg-slate-50/80 dark:bg-slate-900/80 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No test centers match your query.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDistrict('ALL');
                }}
                className="mt-3 text-xs text-japan-red dark:text-rose-400 font-bold hover:underline cursor-pointer"
              >
                Reset search
              </button>
            </div>
          )}
        </div>

        {/* Right: Leaflet Map */}
        <div className="lg:col-span-7 h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-900 shadow-inner">
          <div id="react-leaflet-jft-map" className="w-full h-full z-0"></div>
        </div>
      </div>
    </div>
  );
}
