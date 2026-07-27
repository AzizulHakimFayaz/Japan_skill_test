/**
 * React Component: JftCenterMap
 * Interactive React component for official Prometric Test Centers in Bangladesh (BDJ01 & BDJ02).
 */

const { useState, useMemo, useEffect } = React;

function JftCenterMap({ centersData }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('ALL');
    const [activeCenter, setActiveCenter] = useState(null);
    const [selectedCenterForModal, setSelectedCenterForModal] = useState(null);
    const [leafletMap, setLeafletMap] = useState(null);
    const [markers, setMarkers] = useState({});

    // Parse data
    const centers = useMemo(() => {
        if (!centersData) return [];
        return typeof centersData === 'string' ? JSON.parse(centersData) : centersData;
    }, [centersData]);

    // Unique districts
    const districts = useMemo(() => {
        const set = new Set(centers.map(c => c.district));
        return Array.from(set);
    }, [centers]);

    // Filtered list
    const filteredCenters = useMemo(() => {
        return centers.filter(c => {
            const matchDistrict = selectedDistrict === 'ALL' || c.district === selectedDistrict;
            const query = searchQuery.toLowerCase().trim();
            const matchQuery = !query || 
                c.name.toLowerCase().includes(query) || 
                c.address.toLowerCase().includes(query) ||
                (c.center_number && c.center_number.toLowerCase().includes(query)) ||
                (c.operator && c.operator.toLowerCase().includes(query)) ||
                c.district.toLowerCase().includes(query);
            return matchDistrict && matchQuery;
        });
    }, [centers, searchQuery, selectedDistrict]);

    // Initialize Leaflet Map
    useEffect(() => {
        const timer = setTimeout(() => {
            const mapContainer = document.getElementById('react-leaflet-jft-map');
            if (!mapContainer || typeof L === 'undefined' || leafletMap) return;

            // Center on Dhaka, Bangladesh
            const map = L.map('react-leaflet-jft-map').setView([23.765, 90.395], 12);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            const newMarkers = {};
            centers.forEach(c => {
                if (c.latitude && c.longitude) {
                    const marker = L.marker([c.latitude, c.longitude])
                        .addTo(map)
                        .bindPopup(`
                            <div class="p-2 font-sans max-w-xs">
                                <div class="flex items-center gap-1 mb-1">
                                    <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white">${c.center_number || 'Center'}</span>
                                    <span class="text-[10px] text-slate-500 font-bold">${c.district}</span>
                                </div>
                                <strong class="text-sm font-bold text-slate-900 block mb-1 leading-snug">${c.name}</strong>
                                <p class="text-xs text-slate-600 mb-2">${c.address}</p>
                                <p class="text-[11px] text-slate-500 font-semibold mb-2">Operator: ${c.operator}</p>
                                ${c.google_map_url ? `<a href="${c.google_map_url}" target="_blank" rel="noopener" class="inline-block text-[10px] font-bold bg-slate-900 text-white px-2 py-1 rounded">📍 Google Maps ↗</a>` : ''}
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
        }, 100);

        return () => clearTimeout(timer);
    }, [centers]);

    // Pan map to center when selected
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
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-200/40">
            {/* Component Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6 pb-6 border-b border-slate-100">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-japan-red border border-red-100 text-xs font-extrabold uppercase tracking-wider mb-2">
                        <span className="w-2 h-2 rounded-full bg-japan-red animate-pulse"></span>
                        Official Prometric Bangladesh Test Centers
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        Prometric Bangladesh Exam Centers (BDJ01 & BDJ02)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Official test venues in Bangladesh for JFT-Basic and SSW Skills Evaluation Exams.</p>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search BDJ01, BDJ02, address..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-japan-red/20 focus:border-japan-red focus:bg-white transition-all shadow-xs"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
                        </svg>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70">
                        <button
                            onClick={() => setSelectedDistrict('ALL')}
                            className={`px-3.5 py-1.5 text-xs rounded-xl transition-all ${selectedDistrict === 'ALL' ? 'bg-white text-slate-900 font-extrabold shadow-xs' : 'text-slate-600 font-semibold hover:text-slate-900'}`}
                        >
                            All ({centers.length})
                        </button>
                        {districts.map(dist => (
                            <button
                                key={dist}
                                onClick={() => setSelectedDistrict(dist)}
                                className={`px-3.5 py-1.5 text-xs rounded-xl transition-all ${selectedDistrict === dist ? 'bg-white text-slate-900 font-extrabold shadow-xs' : 'text-slate-600 font-semibold hover:text-slate-900'}`}
                            >
                                {dist}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Split View: Official Center Cards + Leaflet Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Venue Cards List */}
                <div className="lg:col-span-5 flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1.5">
                    {filteredCenters.map(center => (
                        <div
                            key={center.id}
                            onClick={() => handleSelectCenter(center)}
                            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group ${activeCenter === center.id ? 'border-japan-red bg-gradient-to-r from-red-50/60 to-white shadow-md ring-1 ring-japan-red/30' : 'border-slate-200/90 hover:border-slate-300 bg-white hover:shadow-md'}`}
                        >
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-japan-red text-white shadow-xs">
                                    {center.center_number || 'BDJ01'}
                                </span>
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {center.district}
                                </span>
                            </div>

                            <h4 className="font-extrabold text-slate-900 group-hover:text-japan-red text-base leading-snug transition-colors mb-1">
                                {center.name}
                            </h4>

                            <p className="text-xs font-semibold text-indigo-700 mb-2">
                                🏢 Operating Company: <strong>{center.operator}</strong>
                            </p>

                            <p className="text-xs text-slate-600 mb-3 flex items-start gap-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <svg className="w-4 h-4 text-japan-red mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                {center.address}
                            </p>

                            <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100">
                                {center.google_map_url ? (
                                    <a
                                        href={center.google_map_url}
                                        target="_blank"
                                        rel="noopener"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl transition-all shadow-xs"
                                    >
                                        📍 GoogleMap ↗
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate-400">Prometric Verified</span>
                                )}

                                <span className="text-xs font-bold text-japan-red group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                                    Show on Map
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                </span>
                            </div>
                        </div>
                    ))}

                    {filteredCenters.length === 0 && (
                        <div className="p-10 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-sm font-semibold text-slate-600">No test centers match your query.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedDistrict('ALL'); }}
                                className="mt-3 text-xs text-japan-red font-bold hover:underline"
                            >
                                Reset search
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Leaflet Map */}
                <div className="lg:col-span-7 h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 relative bg-slate-100 shadow-inner">
                    <div id="react-leaflet-jft-map" className="w-full h-full z-0"></div>
                </div>
            </div>
        </div>
    );
}

window.JftCenterMap = JftCenterMap;
