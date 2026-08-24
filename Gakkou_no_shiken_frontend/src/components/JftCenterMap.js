'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import {
  MapPin,
  Search,
  Building2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Calendar,
  AlertTriangle,
  FileCheck2,
  Compass,
  ListOrdered,
  Navigation,
} from 'lucide-react';

const DEFAULT_BANGLADESH_CENTERS = [
  {
    id: 1,
    center_number: 'BDJ01',
    name: 'Universal Testing Center (UTC) Dhaka - Dhanmondi',
    operator: 'Universal Testing Services Bangladesh',
    district: 'Dhaka',
    address: 'House #32, Road #27 (Old), Road #16 (New), Dhanmondi R/A, Dhaka-1209',
    latitude: 23.7508,
    longitude: 90.3752,
    google_map_url: 'https://maps.google.com/?q=Dhanmondi+Dhaka+Bangladesh',
  },
  {
    id: 2,
    center_number: 'BDJ02',
    name: 'Universal Testing Center (UTC) Dhaka - Banani',
    operator: 'Universal Testing Services Bangladesh',
    district: 'Dhaka',
    address: 'Plot #56, Block #D, Road #11, Banani C/A, Dhaka-1213',
    latitude: 23.7937,
    longitude: 90.4048,
    google_map_url: 'https://maps.google.com/?q=Banani+Dhaka+Bangladesh',
  },
];

export default function JftCenterMap({ centersData = [] }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [activeCenter, setActiveCenter] = useState(1);
  const [activeViewTab, setActiveViewTab] = useState('map'); // 'map' or 'checklist'
  const [leafletMap, setLeafletMap] = useState(null);
  const [markers, setMarkers] = useState({});

  const centers = useMemo(() => {
    let parsed = [];
    if (centersData) {
      parsed = typeof centersData === 'string' ? JSON.parse(centersData) : centersData;
    }
    if (!parsed || parsed.length === 0) {
      return DEFAULT_BANGLADESH_CENTERS;
    }
    return parsed;
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
                      ? `<a href="${c.google_map_url}" target="_blank" rel="noopener" class="inline-block text-[10px] font-bold bg-slate-900 text-white px-2 py-1 rounded">Open in Google Maps ↗</a>`
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
        console.warn('Leaflet initialization notice:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [centers, leafletMap, activeViewTab]);

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
            <span>Prometric Bangladesh Test Centers</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('test_centers_title')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('test_centers_desc')}
          </p>
        </div>

        {/* Filter & View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_centers')}
              className="w-full sm:w-60 pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-japan-red/20 focus:border-japan-red text-slate-900 dark:text-white transition-all shadow-xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* View Mode Toggle: Interactive Map vs Checklist Guide */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <button
              onClick={() => setActiveViewTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                activeViewTab === 'map'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-japan-red" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setActiveViewTab('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                activeViewTab === 'checklist'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-amber-500" />
              <span>Venue Checklist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Split View: Venue Cards List + Interactive Map / Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Venue Cards List */}
        <div className="lg:col-span-5 flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredCenters.map((center) => (
            <div
              key={center.id}
              onClick={() => handleSelectCenter(center)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                activeCenter === center.id
                  ? 'border-japan-red dark:border-rose-500 bg-gradient-to-r from-red-50/60 to-white dark:from-rose-950/40 dark:to-slate-900 shadow-md ring-1 ring-japan-red/30'
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/90 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-japan-red text-white shadow-xs">
                  {center.center_number || 'BDJ01'}
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {center.district}
                </span>
              </div>

              <h4 className="font-extrabold text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 text-sm sm:text-base leading-snug transition-colors mb-1">
                {center.name}
              </h4>

              <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Operator: <strong>{center.operator}</strong></span>
              </p>

              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 flex items-start gap-1.5 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80">
                <MapPin className="w-3.5 h-3.5 text-japan-red dark:text-rose-400 mt-0.5 flex-shrink-0" />
                <span>{center.address}</span>
              </p>

              <div className="mt-2 flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                {center.google_map_url ? (
                  <a
                    href={center.google_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl transition-all shadow-xs"
                  >
                    <Navigation className="w-3 h-3 text-rose-400" />
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Prometric Verified</span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleSelectCenter(center);
                    setActiveViewTab('map');
                  }}
                  className="text-xs font-bold text-japan-red dark:text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 cursor-pointer"
                >
                  <span>Pin on Map</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Dynamic Interactive Map OR Venue Checklist */}
        <div className="lg:col-span-7 h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-900 shadow-inner flex flex-col justify-between">
          {activeViewTab === 'map' ? (
            <div className="relative w-full h-full">
              <div id="react-leaflet-jft-map" className="w-full h-full z-0"></div>

              {/* Floating Quick Action Overlay on Map */}
              <div className="absolute top-3 left-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  Dhaka Prometric Testing Hub (BDJ01 &amp; BDJ02)
                </span>
              </div>
            </div>
          ) : (
            /* Venue Checklist & Voucher Guide */
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar h-full bg-slate-50/90 dark:bg-slate-900/90 animate-fade-in">
              <div className="space-y-1 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-black uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Mandatory Venue Protocols</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  {t('checklist_title')}
                </h4>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <strong className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/80 text-japan-red text-xs font-black flex items-center justify-center">1</span>
                    <span>Original Valid Passport</span>
                  </strong>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                    {t('checklist_passport')} NID cards or photocopies are strictly not accepted by Prometric invigilators.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <strong className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 text-xs font-black flex items-center justify-center">2</span>
                    <span>Printed Prometric Voucher Ticket</span>
                  </strong>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                    {t('checklist_voucher')} Bring a physical A4 printout of your exam confirmation email.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <strong className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 text-xs font-black flex items-center justify-center">3</span>
                    <span>30 Minutes Prior Arrival</span>
                  </strong>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                    {t('checklist_arrive')} Lockers are provided at Dhanmondi and Banani test centers for personal bags and phones.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                  <strong className="text-sm font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>{t('voucher_guide_title')}</span>
                  </strong>
                  <p className="text-xs text-indigo-900/80 dark:text-indigo-300 leading-relaxed">
                    {t('voucher_guide_desc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
