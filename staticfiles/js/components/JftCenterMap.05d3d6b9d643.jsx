/**
 * React Component: JftCenterMap
 * Interactive React component for JFT-Basic Test Center finder in Bangladesh.
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
                c.district.toLowerCase().includes(query);
            return matchDistrict && matchQuery;
        });
    }, [centers, searchQuery, selectedDistrict]);

    // Initialize Leaflet Map once mounted
    useEffect(() => {
        const timer = setTimeout(() => {
            const mapContainer = document.getElementById('react-leaflet-jft-map');
            if (!mapContainer || typeof L === 'undefined' || leafletMap) return;

            const map = L.map('react-leaflet-jft-map').setView([23.78088, 90.41946], 7);
            
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
                                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 mb-1">${c.district}</span>
                                <strong class="text-sm font-bold text-slate-900 block mb-1">${c.name}</strong>
                                <p class="text-xs text-slate-600 mb-2">${c.address}</p>
                                <div class="text-xs text-slate-700 font-semibold pt-1 border-t border-slate-100">
                                    📞 ${c.phone}
                                </div>
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
                        React Dynamic Venue Explorer
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        Prometric JFT-Basic Bangladesh Venues
                    </h3>
                    <p class="text-sm text-slate-500 mt-1">Interactive React component mapped directly to Prometric test centers in Dhaka & Chittagong.</p>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter venue or address..."
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
                            All
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

            {/* Split View: Location Cards + Leaflet Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Venue Cards List */}
                <div className="lg:col-span-5 flex flex-col gap-3.5 max-h-[500px] overflow-y-auto pr-1.5">
                    {filteredCenters.map(center => (
                        <div
                            key={center.id}
                            onClick={() => handleSelectCenter(center)}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group ${activeCenter === center.id ? 'border-japan-red bg-gradient-to-r from-red-50/60 to-white shadow-md ring-1 ring-japan-red/30' : 'border-slate-200/80 hover:border-slate-300 bg-white hover:shadow-md'}`}
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-bold text-slate-900 group-hover:text-japan-red text-sm sm:text-base leading-snug transition-colors">
                                    {center.name}
                                </h4>
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200/60 flex-shrink-0">
                                    {center.district}
                                </span>
                            </div>

                            <p className="text-xs text-slate-600 mb-3 flex items-start gap-1.5">
                                <svg className="w-4 h-4 text-japan-red mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                {center.address}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-3 bg-slate-50/90 p-2.5 rounded-xl border border-slate-100">
                                <div><strong className="text-slate-800">Phone:</strong> {center.phone}</div>
                                <div><strong class="text-slate-800">Capacity:</strong> {center.capacity || '45 Terminals'}</div>
                            </div>

                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedCenterForModal(center); }}
                                    className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                    Booking Details ↗
                                </button>
                                <span className="text-xs font-bold text-japan-red group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                                    Locate on Map
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                </span>
                            </div>
                        </div>
                    ))}

                    {filteredCenters.length === 0 && (
                        <div className="p-10 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-sm font-semibold text-slate-600">No test centers match your search query.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedDistrict('ALL'); }}
                                className="mt-3 text-xs text-japan-red font-bold hover:underline"
                            >
                                Reset filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Leaflet Map */}
                <div className="lg:col-span-7 h-[500px] rounded-2xl overflow-hidden border border-slate-200/90 relative bg-slate-100 shadow-inner">
                    <div id="react-leaflet-jft-map" className="w-full h-full z-0"></div>
                </div>
            </div>

            {/* Booking Modal */}
            {selectedCenterForModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-extrabold text-slate-900">{selectedCenterForModal.name}</h3>
                            <button
                                onClick={() => setSelectedCenterForModal(null)}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-slate-600">
                            <p><strong>District:</strong> {selectedCenterForModal.district}</p>
                            <p><strong>Address:</strong> {selectedCenterForModal.address}</p>
                            <p><strong>Phone:</strong> {selectedCenterForModal.phone}</p>
                            <p><strong>Email:</strong> {selectedCenterForModal.email}</p>
                            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs">
                                <strong>Booking Instructions:</strong> {selectedCenterForModal.booking_note || selectedCenterForModal.booking_info}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedCenterForModal(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            >
                                Close
                            </button>
                            <a
                                href="https://www.prometric-jp.com/en/jftbasic/"
                                target="_blank"
                                rel="noopener"
                                className="px-5 py-2.5 rounded-xl bg-japan-red hover:bg-japan-redhover text-white font-bold text-xs shadow-md"
                            >
                                Book via Prometric ↗
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

window.JftCenterMap = JftCenterMap;
