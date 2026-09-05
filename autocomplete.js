/**
 * Quicktaxi Free OpenStreetMap / Photon Address Autocomplete & Auto-Distance Engine
 * Free source provider: OpenStreetMap (via Photon by Komoot & OSM Nominatim) + Project OSRM Routing
 * No API key required. Completely free and open-source.
 */

(function() {
    // Curated local directory of top Coimbatore hubs & South India outstation destinations for zero-latency instant match
    const LOCAL_PRESETS = [
        { name: "Gandhipuram Central Bus Stand", subtitle: "Gandhipuram, Coimbatore, Tamil Nadu", lat: 11.0183, lon: 76.9678, type: "bus_station" },
        { name: "Coimbatore International Airport (CJB)", subtitle: "Civil Aerodrome Post, Peelamedu, Coimbatore", lat: 11.0300, lon: 77.0434, type: "aeroway" },
        { name: "Coimbatore Junction Railway Station (CBE)", subtitle: "Gopalapuram, Coimbatore, Tamil Nadu", lat: 10.9980, lon: 76.9670, type: "railway" },
        { name: "RS Puram (R.S. Puram)", subtitle: "West Coimbatore, Tamil Nadu", lat: 11.0085, lon: 76.9500, type: "suburb" },
        { name: "Peelamedu", subtitle: "Avinashi Road, Coimbatore, Tamil Nadu", lat: 11.0267, lon: 77.0116, type: "suburb" },
        { name: "Singanallur Bus Terminus", subtitle: "Trichy Road, Singanallur, Coimbatore", lat: 10.9984, lon: 77.0267, type: "bus_station" },
        { name: "Ukkadam Bus Stand", subtitle: "Ukkadam, Coimbatore, Tamil Nadu", lat: 10.9912, lon: 76.9602, type: "bus_station" },
        { name: "Saravanampatti (IT Corridor)", subtitle: "Sathy Road, Coimbatore, Tamil Nadu", lat: 11.0797, lon: 76.9997, type: "suburb" },
        { name: "Saibaba Colony", subtitle: "Mettupalayam Road, Coimbatore, Tamil Nadu", lat: 11.0289, lon: 76.9428, type: "suburb" },
        { name: "Hopes College", subtitle: "Avinashi Road, Peelamedu, Coimbatore", lat: 11.0285, lon: 77.0210, type: "landmark" },
        { name: "Isha Yoga Center (Dhyanalinga)", subtitle: "Velliangiri Foothills, Ishana Vihar, Coimbatore", lat: 10.9760, lon: 76.7402, type: "temple" },
        { name: "Marudhamalai Murugan Temple", subtitle: "Maruthamalai Hill Road, Coimbatore", lat: 11.0461, lon: 76.8519, type: "temple" },
        { name: "Vadavalli", subtitle: "West Coimbatore, Tamil Nadu", lat: 11.0264, lon: 76.9048, type: "suburb" },
        { name: "Perur Pateeswarar Temple", subtitle: "Perur, Siruvani Main Road, Coimbatore", lat: 10.9702, lon: 76.9189, type: "temple" },
        { name: "Thudiyalur", subtitle: "Mettupalayam Road, Coimbatore North", lat: 11.0805, lon: 76.9366, type: "suburb" },
        { name: "Ganapathy", subtitle: "Sathy Road, Coimbatore, Tamil Nadu", lat: 11.0360, lon: 76.9782, type: "suburb" },
        { name: "Ramanathapuram", subtitle: "Trichy Road, Coimbatore, Tamil Nadu", lat: 10.9961, lon: 76.9890, type: "suburb" },
        { name: "Kuniyamuthur", subtitle: "Palakkad Road, Coimbatore, Tamil Nadu", lat: 10.9575, lon: 76.9536, type: "suburb" },
        { name: "Kovaipudur", subtitle: "South West Coimbatore, Tamil Nadu", lat: 10.9404, lon: 76.9405, type: "suburb" },
        { name: "Malumichampatti", subtitle: "Pollachi Main Road, Coimbatore", lat: 10.9067, lon: 76.9942, type: "suburb" },
        { name: "Sulur Air Force Base", subtitle: "Sulur, Coimbatore Outer, Tamil Nadu", lat: 11.0189, lon: 77.1264, type: "suburb" },
        { name: "Pollachi Junction", subtitle: "Pollachi, Coimbatore District, Tamil Nadu", lat: 10.6609, lon: 77.0089, type: "city" },
        { name: "Mettupalayam Railway Station", subtitle: "Nilgiri Mountain Foothills, Coimbatore Dist", lat: 11.3013, lon: 76.9472, type: "city" },
        { name: "Ooty (Udhagamandalam)", subtitle: "Nilgiris Hill Station, Tamil Nadu (90 KM)", lat: 11.4102, lon: 76.7032, type: "hill_station" },
        { name: "Coonoor (Sim's Park)", subtitle: "Nilgiris, Tamil Nadu (75 KM)", lat: 11.3530, lon: 76.7959, type: "hill_station" },
        { name: "Kodaikanal (Princess of Hill Stations)", subtitle: "Dindigul District, Tamil Nadu (175 KM)", lat: 10.2381, lon: 77.4892, type: "hill_station" },
        { name: "Munnar (Tea Valley)", subtitle: "Idukki District, Kerala (160 KM)", lat: 10.0889, lon: 77.0595, type: "hill_station" },
        { name: "Valparai (Anamalai Hills)", subtitle: "Coimbatore District, Tamil Nadu (105 KM)", lat: 10.3262, lon: 76.9554, type: "hill_station" },
        { name: "Yercaud (Shevaroy Hills)", subtitle: "Salem District, Tamil Nadu (190 KM)", lat: 11.7753, lon: 78.2093, type: "hill_station" },
        { name: "Bangalore (Bengaluru)", subtitle: "Karnataka (360 KM via NH 44 / 544)", lat: 12.9716, lon: 77.5946, type: "metro" },
        { name: "Chennai (Central / Airport)", subtitle: "Tamil Nadu (500 KM via NH 544 / 48)", lat: 13.0827, lon: 80.2707, type: "metro" },
        { name: "Salem Junction", subtitle: "Salem, Tamil Nadu (165 KM)", lat: 11.6643, lon: 78.1460, type: "city" },
        { name: "Madurai (Meenakshi Amman)", subtitle: "Madurai, Tamil Nadu (215 KM)", lat: 9.9252, lon: 78.1198, type: "city" },
        { name: "Tiruppur (Textile City)", subtitle: "Tiruppur, Tamil Nadu (55 KM)", lat: 11.1085, lon: 77.3411, type: "city" },
        { name: "Erode Junction", subtitle: "Erode, Tamil Nadu (100 KM)", lat: 11.3410, lon: 77.7172, type: "city" },
        { name: "Palakkad Town", subtitle: "Kerala (55 KM via Walayar)", lat: 10.7867, lon: 76.6548, type: "city" },
        { name: "Mysore (Mysuru)", subtitle: "Karnataka (200 KM via Dimbam Ghat)", lat: 12.2958, lon: 76.6394, type: "city" },
        { name: "Kochi (Cochin Airport)", subtitle: "Nedumbassery, Kerala (190 KM)", lat: 10.1518, lon: 76.3930, type: "city" }
    ];

    // CSS styling injected into page
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        .autocomplete-container {
            position: relative;
            width: 100%;
        }
        .autocomplete-dropdown {
            display: none;
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            right: 0;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.12);
            max-height: 290px;
            overflow-y: auto;
            z-index: 10005;
        }
        .autocomplete-dropdown.show {
            display: block;
        }
        .autocomplete-item {
            padding: 10px 14px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            cursor: pointer;
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.15s;
        }
        .autocomplete-item:last-child {
            border-bottom: none;
        }
        .autocomplete-item:hover, .autocomplete-item.active {
            background: #fffbeb;
        }
        .autocomplete-item i {
            color: #d97706;
            margin-top: 3px;
            font-size: 0.95rem;
            flex-shrink: 0;
        }
        .autocomplete-text {
            flex: 1;
            min-width: 0;
        }
        .autocomplete-name {
            font-weight: 700;
            font-size: 0.9rem;
            color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .autocomplete-name span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .autocomplete-sub {
            font-size: 0.75rem;
            color: #64748b;
            line-height: 1.35;
            margin-top: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .autocomplete-badge {
            font-size: 0.65rem;
            padding: 2px 6px;
            border-radius: 4px;
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
            font-weight: 700;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .autocomplete-footer {
            padding: 8px 14px;
            font-size: 0.72rem;
            color: #64748b;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
        }
        .autocomplete-footer a {
            color: #d97706;
            text-decoration: none;
        }
        .loc-detect-btn {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: #fffbeb;
            border: 1px solid #fde68a;
            color: #92400e;
            cursor: pointer;
            font-size: 0.82rem;
            padding: 6px 10px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 5px;
            font-weight: 800;
            transition: all 0.2s;
            z-index: 2;
        }
        .loc-detect-btn:hover {
            background: #f59e0b;
            color: #ffffff;
            border-color: #d97706;
        }
        .loc-detect-btn.loading i {
            animation: fa-spin 1s infinite linear;
        }
        .dist-badge-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            margin-top: 6px;
            animation: fadeIn 0.3s ease;
        }
        .dist-badge-chip i {
            color: #16a34a;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-3px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styleEl);

    // Debounce utility
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Haversine formula distance calculation (as failover)
    function calculateHaversineKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c * 1.28); // 1.28 road tortuosity winding factor for road driving
    }

    // Free distance calculation using Project OSRM
    async function updateDrivingDistance() {
        const fromInput = document.getElementById('fromCity');
        const toInput = document.getElementById('toCity');
        const kmInput = document.getElementById('manualKm');
        if (!fromInput || !toInput || !kmInput) return;

        const fromLat = fromInput.dataset.lat;
        const fromLon = fromInput.dataset.lon;
        const toLat = toInput.dataset.lat;
        const toLon = toInput.dataset.lon;

        if (!fromLat || !fromLon || !toLat || !toLon) return;

        // Display loading indication on distance input
        const origPlaceholder = kmInput.placeholder;
        kmInput.placeholder = "Calculating road distance...";

        try {
            // First attempt: Server-side proxy with Project OSRM
            let distanceKm = null;
            let source = "OpenStreetMap / OSRM";

            try {
                const res = await fetch(`/api/distance?fromLat=${fromLat}&fromLon=${fromLon}&toLat=${toLat}&toLon=${toLon}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.distanceKm) {
                        distanceKm = data.distanceKm;
                    }
                }
            } catch (e) {
                // Ignore and try direct OSRM
            }

            if (!distanceKm) {
                // Direct call to Project OSRM free demo server
                try {
                    const directRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`);
                    if (directRes.ok) {
                        const directData = await directRes.json();
                        if (directData.routes && directData.routes.length > 0) {
                            distanceKm = Math.round(directData.routes[0].distance / 1000);
                        }
                    }
                } catch (e) {
                    // Fallback to Haversine
                }
            }

            // Fallback to Haversine * 1.28 road metric if online routing fails
            if (!distanceKm) {
                distanceKm = calculateHaversineKm(parseFloat(fromLat), parseFloat(fromLon), parseFloat(toLat), parseFloat(toLon));
                source = "Road Metric";
            }

            kmInput.value = distanceKm;
            kmInput.placeholder = origPlaceholder;

            // Add or update road distance chip
            let chip = document.getElementById('routeDistBadge');
            if (!chip) {
                chip = document.createElement('div');
                chip.id = 'routeDistBadge';
                chip.className = 'dist-badge-chip';
                const wrap = kmInput.closest('.input-wrap') || kmInput.parentElement;
                wrap.parentElement.appendChild(chip);
            }
            chip.innerHTML = `<i class="fas fa-check-circle"></i> Auto Distance: <b>${distanceKm} KM</b> <small style="opacity:0.8;">(${source})</small>`;

            // Trigger fare calculation if function exists
            if (typeof window.calculateFare === 'function') {
                window.calculateFare();
            }
        } catch (err) {
            kmInput.placeholder = origPlaceholder;
        }
    }

    // Free geocode search: OpenStreetMap / Photon API
    async function fetchFreeGeocodingSuggestions(query) {
        const q = query.trim().toLowerCase();
        let matches = [];

        // 1. Check instant local preset directory
        const localMatches = LOCAL_PRESETS.filter(item => {
            const n = item.name.toLowerCase();
            const s = item.subtitle.toLowerCase();
            return n.includes(q) || s.includes(q);
        }).slice(0, 4).map(item => ({
            name: item.name,
            subtitle: item.subtitle,
            lat: item.lat,
            lon: item.lon,
            badge: "Verified Hub",
            source: "local"
        }));

        matches = matches.concat(localMatches);

        // 2. Fetch live suggestions from free OSM / Photon
        try {
            // First attempt: Server API proxy
            let liveResults = [];
            try {
                const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    liveResults = data.results || [];
                }
            } catch (err) {
                // Fallback to client-side direct fetch
            }

            // If server proxy returned nothing, call Photon directly
            if (liveResults.length === 0) {
                const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lat=11.0168&lon=76.9558`;
                const photonRes = await fetch(photonUrl);
                if (photonRes.ok) {
                    const photonData = await photonRes.json();
                    liveResults = (photonData.features || []).map(item => {
                        const props = item.properties || {};
                        const coords = item.geometry?.coordinates || [0, 0];
                        const name = props.name || props.street || props.city || query;
                        const subParts = [props.district, props.city, props.state, props.postcode]
                            .filter(Boolean)
                            .filter((val, idx, arr) => arr.indexOf(val) === idx && val !== name);
                        return {
                            name,
                            subtitle: subParts.join(', ') || 'Tamil Nadu, India',
                            lat: coords[1],
                            lon: coords[0],
                            badge: "OpenStreetMap",
                            source: "osm"
                        };
                    });
                }
            }

            // Deduplicate with local matches
            liveResults.forEach(item => {
                const isDup = matches.some(m => m.name.toLowerCase() === item.name.toLowerCase() || 
                    (Math.abs(m.lat - item.lat) < 0.005 && Math.abs(m.lon - item.lon) < 0.005));
                if (!isDup && matches.length < 6) {
                    matches.push({
                        name: item.name,
                        subtitle: item.subtitle,
                        lat: item.lat,
                        lon: item.lon,
                        badge: "Free OSM",
                        source: "osm"
                    });
                }
            });
        } catch (e) {
            // If offline, local directory results will still display!
        }

        return matches;
    }

    // Attach autocomplete to an input element
    function setupAddressAutocomplete(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        // Ensure parent wrapper has relative positioning
        const inputWrap = input.closest('.input-wrap') || input.parentElement;
        inputWrap.style.position = 'relative';

        // Add GPS detect button if input is fromCity
        if (inputId === 'fromCity') {
            const gpsBtn = document.createElement('button');
            gpsBtn.type = 'button';
            gpsBtn.className = 'loc-detect-btn';
            gpsBtn.title = 'Detect Current GPS Location (Free)';
            gpsBtn.innerHTML = '<i class="fas fa-crosshairs"></i> <span style="font-size:0.75rem;">GPS</span>';
            gpsBtn.onclick = function(e) {
                e.preventDefault();
                detectCurrentGPSLocation(input, gpsBtn);
            };
            inputWrap.appendChild(gpsBtn);
            input.style.paddingRight = '75px';
        }

        // Create Dropdown Box
        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.id = `${inputId}-dropdown`;
        inputWrap.appendChild(dropdown);

        let activeIndex = -1;
        let currentSuggestions = [];

        function renderDropdown(items) {
            currentSuggestions = items;
            activeIndex = -1;

            if (!items || items.length === 0) {
                dropdown.innerHTML = `
                    <div style="padding:16px; text-align:center; color:#64748b; font-size:0.85rem; font-weight:500;">
                        <i class="fas fa-search-location" style="color:#d97706; margin-bottom:6px; font-size:1.2rem; display:block;"></i>
                        No matching locations found. You can still enter your address manually.
                    </div>
                `;
                dropdown.classList.add('show');
                return;
            }

            let html = '';
            items.forEach((item, idx) => {
                html += `
                    <div class="autocomplete-item" data-index="${idx}">
                        <i class="fas fa-map-marker-alt"></i>
                        <div class="autocomplete-text">
                            <div class="autocomplete-name">
                                <span>${escapeHtml(item.name)}</span>
                                <span class="autocomplete-badge">${item.badge || 'OpenStreetMap'}</span>
                            </div>
                            <div class="autocomplete-sub">${escapeHtml(item.subtitle)}</div>
                        </div>
                    </div>
                `;
            });

            html += `
                <div class="autocomplete-footer">
                    <span><i class="fas fa-bolt" style="color:#ffb606;"></i> Free Source: OpenStreetMap / Photon</span>
                    <span>Zero Return Fare</span>
                </div>
            `;

            dropdown.innerHTML = html;
            dropdown.classList.add('show');

            // Attach click listeners to items
            dropdown.querySelectorAll('.autocomplete-item').forEach(el => {
                el.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    const idx = parseInt(this.dataset.index, 10);
                    selectSuggestion(items[idx]);
                });
            });
        }

        function selectSuggestion(item) {
            if (!item) return;
            input.value = item.name;
            input.dataset.lat = item.lat;
            input.dataset.lon = item.lon;
            input.dataset.fullName = item.name + (item.subtitle ? ', ' + item.subtitle : '');
            dropdown.classList.remove('show');
            activeIndex = -1;

            // Check if both pickup and drop have coordinates to calculate driving distance
            updateDrivingDistance();
        }

        const handleInput = debounce(async function() {
            const query = input.value.trim();
            if (query.length < 2) {
                dropdown.classList.remove('show');
                return;
            }

            const items = await fetchFreeGeocodingSuggestions(query);
            renderDropdown(items);
        }, 220);

        input.addEventListener('input', handleInput);

        input.addEventListener('focus', function() {
            if (input.value.trim().length >= 2 && currentSuggestions.length > 0) {
                dropdown.classList.add('show');
            } else if (input.value.trim().length === 0) {
                // Show top Coimbatore hubs by default when user clicks empty input
                const topPresets = LOCAL_PRESETS.slice(0, 5).map(item => ({
                    name: item.name,
                    subtitle: item.subtitle,
                    lat: item.lat,
                    lon: item.lon,
                    badge: "Popular Hub",
                    source: "local"
                }));
                renderDropdown(topPresets);
            }
        });

        // Keyboard navigation
        input.addEventListener('keydown', function(e) {
            const items = dropdown.querySelectorAll('.autocomplete-item');
            if (!dropdown.classList.contains('show') || items.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIndex = (activeIndex + 1) % items.length;
                updateActiveItem(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIndex = (activeIndex - 1 + items.length) % items.length;
                updateActiveItem(items);
            } else if (e.key === 'Enter') {
                if (activeIndex >= 0 && activeIndex < currentSuggestions.length) {
                    e.preventDefault();
                    selectSuggestion(currentSuggestions[activeIndex]);
                }
            } else if (e.key === 'Escape') {
                dropdown.classList.remove('show');
            }
        });

        function updateActiveItem(items) {
            items.forEach((item, idx) => {
                if (idx === activeIndex) {
                    item.classList.add('active');
                    item.scrollIntoView({ block: 'nearest' });
                } else {
                    item.classList.remove('active');
                }
            });
        }

        // Close on click outside
        document.addEventListener('click', function(e) {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // Free Reverse Geocoding with GPS
    function detectCurrentGPSLocation(inputEl, btnEl) {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        btnEl.classList.add('loading');
        btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span style="font-size:0.75rem;">GPS...</span>';

        navigator.geolocation.getCurrentPosition(
            async function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                let addressName = `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

                try {
                    // Try server reverse geocode first
                    const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.fullName) addressName = data.fullName;
                        else if (data.name) addressName = data.name;
                    } else {
                        // Direct free Nominatim reverse geocode
                        const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        if (nomRes.ok) {
                            const nomData = await nomRes.json();
                            addressName = nomData.display_name.split(',').slice(0, 3).join(',').trim();
                        }
                    }
                } catch (e) {
                    // Fallback to formatted coordinates
                }

                inputEl.value = addressName;
                inputEl.dataset.lat = lat;
                inputEl.dataset.lon = lon;
                btnEl.classList.remove('loading');
                btnEl.innerHTML = '<i class="fas fa-check"></i> <span style="font-size:0.75rem;">Found</span>';
                setTimeout(() => {
                    btnEl.innerHTML = '<i class="fas fa-crosshairs"></i> <span style="font-size:0.75rem;">GPS</span>';
                }, 2000);

                // Update distance if drop is selected
                updateDrivingDistance();
            },
            function(err) {
                btnEl.classList.remove('loading');
                btnEl.innerHTML = '<i class="fas fa-crosshairs"></i> <span style="font-size:0.75rem;">GPS</span>';
                console.warn('GPS Error:', err.message);
                // If permission denied or unavailable, set to central Gandhipuram
                inputEl.value = "Gandhipuram Central, Coimbatore";
                inputEl.dataset.lat = "11.0183";
                inputEl.dataset.lon = "76.9678";
                updateDrivingDistance();
            },
            { timeout: 8000, enableHighAccuracy: true }
        );
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    // Initialize when DOM is ready
    function init() {
        setupAddressAutocomplete('fromCity');
        setupAddressAutocomplete('toCity');

        // Hook up preset dropdown changes to coordinates
        const tourSelect = document.getElementById('tourSelect');
        if (tourSelect) {
            const originalTourChange = window.handleTourChange;
            window.handleTourChange = function() {
                if (typeof originalTourChange === 'function') {
                    originalTourChange();
                }
                // When tour preset selected, update coordinates
                const sel = tourSelect.value;
                const presetMap = {
                    'ooty': { toLat: 11.4102, toLon: 76.7032 },
                    'munnar': { toLat: 10.0889, toLon: 77.0595 },
                    'kodai': { toLat: 10.2381, toLon: 77.4892 },
                    'coonoor': { toLat: 11.3530, toLon: 76.7959 },
                    'valparai': { toLat: 10.3262, toLon: 76.9554 },
                    'yercaud': { toLat: 11.7753, toLon: 78.2093 }
                };

                const fromInput = document.getElementById('fromCity');
                const toInput = document.getElementById('toCity');
                if (fromInput && !fromInput.dataset.lat) {
                    fromInput.dataset.lat = "11.0183";
                    fromInput.dataset.lon = "76.9678";
                }
                if (toInput && presetMap[sel]) {
                    toInput.dataset.lat = presetMap[sel].toLat;
                    toInput.dataset.lon = presetMap[sel].toLon;
                }
            };
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
