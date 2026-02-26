import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, Hotel, Search, MapPin, Calendar, ArrowRight, Loader2, Star, Navigation, X, Cloud, Train, Bus, ShieldCheck, Zap } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingAPI, weatherAPI } from '../services/api';
import { calculateDuration } from '../utils/dateUtils';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('flights');
  const [loading, setLoading] = useState(false);
  const [flightResults, setFlightResults] = useState([]);
  const [hotelResults, setHotelResults] = useState([]);
  const [form, setForm] = useState({ origin: '', destination: '', originCode: '', destCode: '', date: '' });
  
  // Suggestion states
  const [originInput, setOriginInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  
  const originRef = useRef(null);
  const destRef = useRef(null);
  const originContainerRef = useRef(null);
  const destContainerRef = useRef(null);

  const updateDropdownPos = (ref) => {
    if (ref && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Update position on scroll/resize
  useEffect(() => {
    const handleUpdate = () => {
      if (showOriginDropdown) updateDropdownPos(originContainerRef);
      if (showDestDropdown) updateDropdownPos(destContainerRef);
    };

    if (showOriginDropdown || showDestDropdown) {
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
    }
    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [showOriginDropdown, showDestDropdown]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check origin container
      if (originContainerRef.current && !originContainerRef.current.contains(event.target)) {
        setShowOriginDropdown(false);
      }
      
      // Check destination container
      if (destContainerRef.current && !destContainerRef.current.contains(event.target)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle URL params for redirects from Dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const destParam = params.get('dest');

    if (tabParam && ['flights', 'hotels', 'trains', 'buses'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    if (destParam) {
      // Pre-fill destination
      setDestInput(destParam);
      setForm(prev => ({ ...prev, destination: destParam }));
      
      // Trigger search automatically
      // We need a small delay to ensure state updates
      setTimeout(() => {
        handleSearch(destParam);
      }, 500);
    }
  }, [location.search]);

  // Debounced search for origin
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Check if current input matches the selected form value (avoid re-opening on selection)
      const isSelectedValue = form.origin && originInput.includes(form.origin);
      
      if (!isSelectedValue && originInput.length >= 2 && !originInput.includes('(')) {
        const results = await bookingAPI.searchCities(originInput);
        setOriginSuggestions(results);
        setShowOriginDropdown(results.length > 0);
      } else {
        setOriginSuggestions([]);
        setShowOriginDropdown(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [originInput, form.origin]);

  // Debounced search for destination
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Check if current input matches the selected form value
      const isSelectedValue = form.destination && destInput.includes(form.destination);

      if (!isSelectedValue && destInput.length >= 2 && !destInput.includes('(')) {
        const results = await bookingAPI.searchCities(destInput);
        setDestSuggestions(results);
        setShowDestDropdown(results.length > 0);
      } else {
        setDestSuggestions([]);
        setShowDestDropdown(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [destInput, form.destination]);

  const handleSelectOrigin = (loc) => {
    // Show only "City, Country" in the input field
    setOriginInput(`${loc.name}, ${loc.country}`);
    setForm(prev => ({ ...prev, origin: loc.name, originCode: loc.iataCode }));
    setShowOriginDropdown(false);
    setOriginSuggestions([]); // Clear suggestions to prevent reopening
  };

  const handleSelectDest = (loc) => {
    // Show only "City, Country" in the input field
    setDestInput(`${loc.name}, ${loc.country}`);
    setForm(prev => ({ ...prev, destination: loc.name, destCode: loc.iataCode }));
    setShowDestDropdown(false);
    setDestSuggestions([]); // Clear suggestions to prevent reopening
  };

  const clearOrigin = () => {
    setOriginInput('');
    setForm({ ...form, origin: '' });
    setOriginSuggestions([]);
  };

  const clearDest = () => {
    setDestInput('');
    setForm({ ...form, destination: '' });
    setDestSuggestions([]);
  };

  const getOperatorName = (code) => {
    // Basic mock operators for trains and buses
    const operators = {
      'T1': 'EuroStar',
      'T2': 'TGV',
      'T3': 'Amtrak',
      'T4': 'Shinkansen',
      'B1': 'FlixBus',
      'B2': 'Greyhound',
      'B3': 'Megabus',
      'B4': 'National Express',
      'AI': 'Air India',
      'EK': 'Emirates',
      'QR': 'Qatar Airways',
      'LH': 'Lufthansa',
      'BA': 'British Airways',
      'SQ': 'Singapore Airlines',
      '6E': 'IndiGo',
      'UK': 'Vistara',
      'EY': 'Etihad Airways',
      'AF': 'Air France',
      'AA': 'American Airlines',
      'DL': 'Delta Air Lines',
      'UA': 'United Airlines'
    };
    return operators[code] || `Operator ${code}`;
  };



  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleBookTransport = (transportItem) => {
    const itinerary = transportItem.itineraries?.[0];
    const segment = itinerary?.segments?.[0];
    const lastSegment = itinerary?.segments?.slice(-1)[0];
    const carrier = segment?.carrierCode;
    const operatorLabel = getOperatorName(carrier);
    
    let type = 'flight';
    let typeLabel = 'Flight';
    if (activeTab === 'trains') { type = 'train'; typeLabel = 'Train'; }
    else if (activeTab === 'buses') { type = 'bus'; typeLabel = 'Bus'; }
    
    const price = Math.round(transportItem.price?.total || 0);
    const date = new Date(segment.departure?.at).toLocaleDateString();
    
    const bookingData = {
        type: type,
        title: `${operatorLabel} ${typeLabel} (${segment.departure?.iataCode} to ${lastSegment?.arrival?.iataCode})`,
        location: lastSegment?.arrival?.iataCode,
        date: date,
        price: price,
        currency: 'INR',
        details: transportItem
    };
    
    navigate('/checkout', { state: { bookingData } });
  };

  const handleSearch = async (overrideDest) => {
    const targetDest = typeof overrideDest === 'string' ? overrideDest : form.destination;
    
    if (!targetDest) return alert("Please enter a destination");
    setLoading(true);
    setFlightResults([]);
    setHotelResults([]);
    try {
      // Use targetDest for city name extraction
      const cityNameMatch = targetDest.match(/^([^,]+)/);
      let cityName = cityNameMatch ? cityNameMatch[1] : targetDest;
      
      if (cityName.length === 3 && /^[A-Z]{3}$/.test(cityName)) {
        const match = destSuggestions.find(s => s.iataCode === cityName);
        if (match) {
          cityName = match.name;
        } else {
          // Try to resolve IATA code to City Name via API if not in suggestions
          try {
            const results = await bookingAPI.searchCities(cityName);
            if (results && results.length > 0) {
              const exact = results.find(r => r.iataCode === cityName);
              cityName = exact ? exact.name : results[0].name;
            }
          } catch (e) {
            console.warn("Could not resolve city code:", cityName, e);
          }
        }
      }

      // Fetch Weather
      weatherAPI.getWeather(cityName).then(data => setWeather(data)).catch(() => {});

      // Fetch Flights
      const origin = form.originCode || (form.origin.length === 3 ? form.origin : null);
      const destination = form.destCode || (targetDest.length === 3 ? targetDest : null);

      if (origin && destination) {
        // If flights, try API. If train/bus, use mocks directly.
        if (activeTab === 'flights') {
          bookingAPI.getFlights(origin, destination, form.date)
            .then(res => {
              const apiResults = res.data?.data || [];
              const airlinesInResults = new Set(apiResults.map(f => f.itineraries?.[0]?.segments?.[0]?.carrierCode));
              
              if (apiResults.length >= 3 && airlinesInResults.size > 1) {
                setFlightResults(apiResults);
              } else {
                // Fallback mocks
                const selectedDate = form.date || '2026-06-01';
                const mockFlights = [
                  { id: "FL-001", price: { total: 45200, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "EK", number: "501", departure: { iataCode: origin, at: `${selectedDate}T10:30:00` }, arrival: { iataCode: destination, at: `${selectedDate}T14:45:00` } }] }] },
                  { id: "FL-002", price: { total: 38500, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "QR", number: "204", departure: { iataCode: origin, at: `${selectedDate}T16:15:00` }, arrival: { iataCode: destination, at: `${selectedDate}T20:30:00` } }] }] },
                  { id: "FL-003", price: { total: 12400, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "6E", number: "812", departure: { iataCode: origin, at: `${selectedDate}T08:00:00` }, arrival: { iataCode: destination, at: `${selectedDate}T11:20:00` } }] }] },
                  { id: "FL-004", price: { total: 52100, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "SQ", number: "421", departure: { iataCode: origin, at: `${selectedDate}T23:50:00` }, arrival: { iataCode: destination, at: `${selectedDate}T06:15:00` } }] }] },
                  { id: "FL-005", price: { total: 15600, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "UK", number: "981", departure: { iataCode: origin, at: `${selectedDate}T13:45:00` }, arrival: { iataCode: destination, at: `${selectedDate}T17:00:00` } }] }] },
                  { id: "FL-006", price: { total: 41200, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "AI", number: "101", departure: { iataCode: origin, at: `${selectedDate}T06:30:00` }, arrival: { iataCode: destination, at: `${selectedDate}T10:45:00` } }] }] },
                  { id: "FL-007", price: { total: 48900, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "LH", number: "756", departure: { iataCode: origin, at: `${selectedDate}T01:20:00` }, arrival: { iataCode: destination, at: `${selectedDate}T06:30:00` } }] }] },
                  { id: "FL-008", price: { total: 55400, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "BA", number: "118", departure: { iataCode: origin, at: `${selectedDate}T11:15:00` }, arrival: { iataCode: destination, at: `${selectedDate}T16:45:00` } }] }] }
                ];
                const uniqueMocks = mockFlights.filter(m => !airlinesInResults.has(m.itineraries[0].segments[0].carrierCode));
                setFlightResults([...apiResults, ...uniqueMocks]);
              }
            })
            .catch(err => {
              console.error("Flight search failed", err);
              // Simplified fallback
              setFlightResults([
                 { id: "FL-001", price: { total: 45200, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "EK", number: "501", departure: { iataCode: origin, at: `${form.date || '2026-06-01'}T10:30:00` }, arrival: { iataCode: destination, at: `${form.date || '2026-06-01'}T14:45:00` } }] }] },
                 { id: "FL-002", price: { total: 38500, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "QR", number: "204", departure: { iataCode: origin, at: `${form.date || '2026-06-01'}T16:15:00` }, arrival: { iataCode: destination, at: `${form.date || '2026-06-01'}T20:30:00` } }] }] },
                 { id: "FL-003", price: { total: 12400, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "6E", number: "812", departure: { iataCode: origin, at: `${form.date || '2026-06-01'}T08:00:00` }, arrival: { iataCode: destination, at: `${form.date || '2026-06-01'}T11:20:00` } }] }] }
              ]);
            });
        } else if (activeTab === 'trains') {
           const selectedDate = form.date || '2026-06-01';
           setFlightResults([
             { id: "TR-001", price: { total: 8500, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "T1", number: "9001", departure: { iataCode: origin, at: `${selectedDate}T08:00:00` }, arrival: { iataCode: destination, at: `${selectedDate}T12:00:00` } }] }] },
             { id: "TR-002", price: { total: 6200, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "T2", number: "4502", departure: { iataCode: origin, at: `${selectedDate}T14:00:00` }, arrival: { iataCode: destination, at: `${selectedDate}T18:30:00` } }] }] },
             { id: "TR-003", price: { total: 10500, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "T3", number: "2204", departure: { iataCode: origin, at: `${selectedDate}T09:30:00` }, arrival: { iataCode: destination, at: `${selectedDate}T14:45:00` } }] }] },
             { id: "TR-004", price: { total: 5100, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "T4", number: "1010", departure: { iataCode: origin, at: `${selectedDate}T16:45:00` }, arrival: { iataCode: destination, at: `${selectedDate}T20:15:00` } }] }] }
           ]);
        } else if (activeTab === 'buses') {
           const selectedDate = form.date || '2026-06-01';
           setFlightResults([
             { id: "BS-001", price: { total: 3500, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "B1", number: "101", departure: { iataCode: origin, at: `${selectedDate}T07:00:00` }, arrival: { iataCode: destination, at: `${selectedDate}T15:00:00` } }] }] },
             { id: "BS-002", price: { total: 2800, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "B2", number: "205", departure: { iataCode: origin, at: `${selectedDate}T22:00:00` }, arrival: { iataCode: destination, at: `${selectedDate}T06:30:00` } }] }] },
             { id: "BS-003", price: { total: 4100, currency: "INR" }, itineraries: [{ segments: [{ carrierCode: "B3", number: "880", departure: { iataCode: origin, at: `${selectedDate}T13:00:00` }, arrival: { iataCode: destination, at: `${selectedDate}T20:45:00` } }] }] }
           ]);
        }
      }

      // Fetch Hotels
      try {
        const res = await bookingAPI.getHotels(cityName);
        if (res.data && res.data.hotels && res.data.hotels.length > 0) {
          setHotelResults(res.data.hotels);
        } else {
          throw new Error("No hotels found");
        }
      } catch (hotelErr) {
        // Fallback mock hotels
        const mockHotels = [
          { id: "1", name: `${cityName} Grand Plaza`, city: cityName, rating: 5, price: 250 },
          { id: "2", name: `Royal ${cityName} Resort`, city: cityName, rating: 4, price: 180 },
          { id: "3", name: `Staybridge ${cityName}`, city: cityName, rating: 4, price: 140 },
          { id: "4", name: `City Center Inn`, city: cityName, rating: 3, price: 95 },
          { id: "5", name: `Elite Residency`, city: cityName, rating: 5, price: 320 },
          { id: "6", name: `Comfort Stay`, city: cityName, rating: 3, price: 85 }
        ];
        setHotelResults(mockHotels);
      }

    } catch (err) {
      console.error("Global search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Flight results mapping with images and better layout
  const flightImages = [
    "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544016768-982d1554f0b9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1559297434-2d8a37a6208d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=800"
  ];

  const hotelImages = [
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800"
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* MODERN HERO SECTION WITH GRADIENT */}
      <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 pt-32 pb-32 rounded-b-[4rem] shadow-2xl z-20">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-b-[4rem] pointer-events-none">
           <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 0.2, scale: 1 }}
             transition={{ duration: 1.5 }}
             className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-blue-500 rounded-full blur-[100px]" 
           />
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 0.2, scale: 1 }}
             transition={{ duration: 1.5, delay: 0.2 }}
             className="absolute top-40 -left-20 w-[30rem] h-[30rem] bg-purple-500 rounded-full blur-[100px]" 
           />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-bold uppercase tracking-wider mb-6">
              Start your journey
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight drop-shadow-sm">
              Discover the World's <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                Hidden Gems
              </span>
            </h1>
            <p className="text-base md:text-xl text-blue-100/80 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              Find the best deals on flights, hotels, and travel experiences. Your next adventure is just a click away.
            </p>
          </motion.div>

          {/* SEARCH BAR CONTAINER */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="max-w-5xl mx-auto relative mt-8"
          >
            {/* TABS */}
            <div className="flex flex-wrap justify-center mb-8 gap-3">
              <div className="bg-white/10 backdrop-blur-xl p-1.5 rounded-2xl flex flex-wrap items-center justify-center gap-1 shadow-xl border border-white/20">
                {['flights', 'hotels', 'trains', 'buses'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                      activeTab === tab 
                        ? 'bg-white text-indigo-900 shadow-md transform scale-105' 
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {tab === 'flights' && <Plane size={18} />}
                    {tab === 'hotels' && <Hotel size={18} />}
                    {tab === 'trains' && <Train size={18} />}
                    {tab === 'buses' && <Bus size={18} />}
                    <span className="capitalize">{tab}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN SEARCH PILL */}
            <div className="bg-white rounded-[32px] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.3)] p-3 flex flex-col lg:flex-row items-center gap-2 border border-slate-100">
              
              {/* ORIGIN (For Flights, Trains, Buses) */}
              {activeTab !== 'hotels' && (
                <div ref={originContainerRef} className="flex-1 w-full relative group z-30">
                  <div className="flex items-center gap-4 px-6 py-4 rounded-[24px] bg-slate-50 group-hover:bg-blue-50/50 transition-colors cursor-text" onClick={() => originRef.current?.focus()}>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">From</p>
                      <input
                        ref={originRef}
                        type="text"
                        placeholder="Departure City"
                        value={originInput}
                        onFocus={() => {
                            setShowDestDropdown(false);
                            updateDropdownPos(originContainerRef);
                            if(originInput.length >= 2) setShowOriginDropdown(true);
                        }}
                        onChange={(e) => {
                          setOriginInput(e.target.value);
                          setShowOriginDropdown(true);
                        }}
                        className="bg-transparent w-full font-bold text-slate-800 placeholder-slate-400 outline-none text-base"
                      />
                    </div>
                  </div>
                  {showOriginDropdown && originSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100/50 overflow-hidden z-[100] max-h-[300px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-4">
                      {originSuggestions.map((loc, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectOrigin(loc)}
                          className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <MapPin size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-800 text-sm">{loc.name}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{loc.country}</p>
                          </div>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{loc.iataCode}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* DESTINATION */}
              <div ref={destContainerRef} className="flex-1 w-full relative group z-20">
                <div className="flex items-center gap-4 px-6 py-4 rounded-[24px] bg-slate-50 group-hover:bg-blue-50/50 transition-colors cursor-text" onClick={() => destRef.current?.focus()}>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <Navigation size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">To</p>
                    <input
                      ref={destRef}
                      type="text"
                      placeholder="Destination"
                      value={destInput}
                      onFocus={() => {
                          setShowOriginDropdown(false);
                          updateDropdownPos(destContainerRef);
                          if(destInput.length >= 2) setShowDestDropdown(true);
                      }}
                      onChange={(e) => {
                        setDestInput(e.target.value);
                        setShowDestDropdown(true);
                      }}
                      className="bg-transparent w-full font-bold text-slate-800 placeholder-slate-400 outline-none text-base"
                    />
                  </div>
                </div>
                {showDestDropdown && destSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100/50 overflow-hidden z-[100] max-h-[300px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-4">
                    {destSuggestions.map((loc, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectDest(loc)}
                        className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none group text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <MapPin size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm">{loc.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{loc.country}</p>
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{loc.iataCode}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DATE */}
              <div className="w-full lg:w-auto min-w-[200px] group z-10">
                <div className="flex items-center gap-4 px-6 py-4 rounded-[24px] bg-slate-50 group-hover:bg-blue-50/50 transition-colors cursor-pointer relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 z-10">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1 z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">When</p>
                    <input
                      type="date"
                      min={new Date().toLocaleDateString('en-CA')} // YYYY-MM-DD in local time
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="bg-transparent w-full font-bold text-slate-800 outline-none text-base cursor-pointer relative z-20 appearance-none"
                      style={{ colorScheme: 'light' }}
                    />
                  </div>
                </div>
              </div>

              {/* SEARCH BUTTON */}
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="w-full lg:w-auto lg:h-[72px] lg:px-10 rounded-[24px] bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-70 group"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} className="group-hover:scale-110 transition-transform" />}
                <span className="font-bold text-lg lg:hidden">Search Now</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>



      {/* RESULTS DISPLAY */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pb-32">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {activeTab === 'hotels' ? 'Top Rated Hotels' : `Available ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              Best Prices
            </span>
          </h2>
          {(activeTab === 'hotels' ? hotelResults : flightResults)?.length > 0 && (
            <span className="px-4 py-2 bg-white border border-slate-100 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest shadow-sm">
              {(activeTab === 'hotels' ? hotelResults : flightResults).length} results found
            </span>
          )}
        </div>

        {(activeTab === 'hotels' ? hotelResults : flightResults)?.length > 0 ? (
           <div className="space-y-16">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {activeTab !== 'hotels' ? (
              flightResults.map((f, i) => {
                const itinerary = f.itineraries?.[0];
                const segment = itinerary?.segments?.[0];
                const lastSegment = itinerary?.segments?.slice(-1)[0];
                const carrier = segment?.carrierCode;
                const flightImg = flightImages[i % flightImages.length];
                
                const depRaw = segment.departure?.at;
                const arrRaw = lastSegment?.arrival?.at;
                
                // Calculate duration
                const duration = calculateDuration(depRaw, arrRaw);
                
                // Format times
                const depTime = new Date(depRaw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const arrTime = new Date(arrRaw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                // Determine icon based on activeTab
                let TransportIcon = Plane;
                let operatorLabel = getOperatorName(carrier);
                let typeLabel = 'Flight';
                
                if (activeTab === 'trains') {
                  TransportIcon = Train;
                  typeLabel = 'Train';
                } else if (activeTab === 'buses') {
                  TransportIcon = Bus;
                  typeLabel = 'Bus';
                }

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-white rounded-[32px] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div className="flex gap-4 items-center w-full sm:w-auto">
                        <div className={`w-14 h-14 rounded-2xl ${activeTab === 'buses' ? 'bg-orange-50 text-orange-600' : activeTab === 'trains' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} flex items-center justify-center shrink-0`}>
                           {activeTab === 'flights' ? (
                              <img 
                                src={`https://images.daisycon.io/airline/assets/300/${carrier}.png`} 
                                alt={carrier}
                                className="w-8 object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentNode.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plane w-6 h-6 text-blue-500"><path d="M2 12h20"/><path d="M13 2l9 10-9 10"/><path d="M2 12l5-5m0 10l-5-5"/></svg>`; 
                                }}
                              />
                           ) : (
                              <TransportIcon size={24} />
                           )}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-lg leading-tight">{operatorLabel}</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{typeLabel} • {carrier}-{segment.number}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{itinerary?.segments?.length > 1 ? `${itinerary.segments.length - 1} Stop` : 'Direct'}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-8 relative gap-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                      <div className="text-center min-w-[60px]">
                        <p className="text-2xl font-black text-slate-900">{segment.departure?.iataCode}</p>
                        <p className="text-xs text-slate-500 font-bold mt-1">{depTime}</p>
                      </div>
                      <div className="flex-1 px-2 sm:px-4 flex flex-col items-center">
                        <div className="w-full h-[2px] bg-slate-200 relative mb-2">
                          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${activeTab === 'buses' ? 'bg-orange-400' : activeTab === 'trains' ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                          <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-1 h-1 rounded-full bg-slate-300`}></div>
                          <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-1 h-1 rounded-full bg-slate-300`}></div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{duration}</p>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <p className="text-2xl font-black text-slate-900">{lastSegment?.arrival?.iataCode}</p>
                        <p className="text-xs text-slate-500 font-bold mt-1">{arrTime}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-auto gap-4">
                      <div className="flex items-center justify-between sm:block text-left sm:text-right">
                        <div>
                          <p className="text-2xl font-black text-slate-900">₹{Math.round(f.price?.total || 0).toLocaleString('en-IN')}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">Per Traveler</p>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest sm:hidden">Per Person</p>
                      </div>
                      <button 
                        onClick={() => handleBookTransport(f)}
                        className={`px-8 py-4 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg ${activeTab === 'buses' ? 'bg-orange-500 shadow-orange-200' : activeTab === 'trains' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-900 shadow-slate-200'}`}
                      >
                        Book {activeTab === 'flights' ? 'Flight' : activeTab === 'trains' ? 'Train' : 'Bus'}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              hotelResults.map((h, i) => {
                const hotelImg = hotelImages[i % hotelImages.length];
                const hotelId = h.id || "1244451";
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-white rounded-[32px] overflow-hidden border border-slate-100 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="h-56 relative overflow-hidden">
                      <img 
                        src={hotelImg} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt="Hotel" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1 shadow-lg">
                        <Star size={12} className="fill-orange-400 text-orange-400" /> {h.rating || '4.5'}
                      </div>
                      <div className="absolute top-4 left-4 bg-indigo-500 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30">
                        Luxury Stay
                      </div>
                      <div className="absolute bottom-4 left-6 right-6">
                        <h3 className="text-white text-xl font-black truncate mb-1">{h.name || 'Grand Heritage'}</h3>
                        <p className="text-white/80 text-[9px] font-bold flex items-center gap-1 uppercase tracking-widest">
                          <MapPin size={10} className="text-indigo-400" /> {h.city || 'PAR'}, Location Verified
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="mb-6">
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                          {h.address || `Experience unparalleled luxury at ${h.name}. Featuring world-class amenities and premium service in a prime location.`}
                        </p>
                        
                        <div className="flex gap-2 mt-4">
                           <span className="px-2 py-1 bg-slate-50 rounded-md text-[10px] font-bold text-slate-500">Free Wifi</span>
                           <span className="px-2 py-1 bg-slate-50 rounded-md text-[10px] font-bold text-slate-500">Pool</span>
                           <span className="px-2 py-1 bg-slate-50 rounded-md text-[10px] font-bold text-slate-500">Spa</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-50">
                        <div>
                          <p className="text-2xl font-black text-slate-900">
                            ₹{Math.round((h.price || 199) * 83).toLocaleString('en-IN')}
                            <span className="text-[10px] text-slate-300 ml-1 font-bold">/night</span>
                          </p>
                          <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Free Cancellation</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/hotel/${hotelId}`)}
                            className="px-4 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                          >
                            Details
                          </button>
                          <button 
                            onClick={() => navigate(`/hotel/${hotelId}`)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Recommended Hotels for Transport Bookings */}
          {activeTab !== 'hotels' && hotelResults.length > 0 && (
            <div className="pt-8 border-t border-slate-200 mt-16">
               <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                 <Hotel className="text-indigo-600" />
                 Recommended Stays in {destInput || 'Destination'}
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {hotelResults.slice(0, 3).map((h, i) => {
                   const hotelImg = hotelImages[i % hotelImages.length];
                   const hotelId = h.id || `rec-${i}`;
                   return (
                     <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group cursor-pointer" onClick={() => navigate(`/hotel/${hotelId}`)}>
                       <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                         <img src={hotelImg} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={h.name} />
                       </div>
                       <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-slate-900 truncate">{h.name}</h4>
                         <div className="flex items-center gap-1 mb-2">
                            <Star size={10} className="fill-orange-400 text-orange-400" />
                            <span className="text-xs font-bold text-slate-600">{h.rating || 4.5}</span>
                         </div>
                         <p className="text-indigo-600 font-black">₹{Math.round((h.price || 150) * 83).toLocaleString('en-IN')}</p>
                         <button onClick={() => navigate(`/hotel/${hotelId}`)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 hover:text-indigo-600">View Details</button>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          )}
        </div>
        ) : (
          !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Ready to explore?</h3>
              <p className="text-slate-400 text-base font-medium max-w-md mx-auto">Enter your destination above to find the best flights and hotels for your journey.</p>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
};

export default BookingPage;
