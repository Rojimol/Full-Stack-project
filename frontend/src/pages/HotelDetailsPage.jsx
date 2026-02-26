import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Wifi, Car, Coffee, Wind, 
  ShieldCheck, ArrowLeft, Share2, Heart, ChevronRight, Building, Search, X, Loader2
} from 'lucide-react';
import { hotelAPI, bookingAPI } from '../services/api';

const HotelDetailsPage = () => {
  const { id } = useParams(); // Get hotelId from URL: /hotel/1244451
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search suggestion states
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Debounced search for cities
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchInput.length >= 2 && !searchInput.includes('(')) {
        const results = await bookingAPI.searchCities(searchInput);
        setSuggestions(results);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (loc) => {
    setSearchInput(`${loc.name}, ${loc.country} (${loc.iataCode})`);
    setShowDropdown(false);
    // Navigate to booking page with hotel tab active and destination set
    navigate(`/booking?tab=hotels&dest=${loc.iataCode}`);
  };

  const handleSearch = () => {
    if (!searchInput) return;
    // Extract IATA code if present, otherwise use full string
    const match = searchInput.match(/\(([A-Z]{3})\)/);
    const dest = match ? match[1] : searchInput;
    navigate(`/booking?tab=hotels&dest=${dest}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await hotelAPI.getSurroundingHotels(id || "1244451");
        // We assume the first index is the current hotel, others are nearby
        setHotel(data[0] || null);
        setNearby(data.slice(1, 4)); // Get 3 nearby hotels
        setLoading(false);
        window.scrollTo(0, 0); // Scroll to top on new hotel click
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-white gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-brand-gray-light rounded-full"></div>
        <div className="absolute inset-0 border-4 border-brand-blue rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Building size={24} className="text-brand-blue animate-pulse" />
        </div>
      </div>
      <p className="text-brand-gray font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Loading Luxury Stays</p>
    </div>
  );

  return (
    <div className="bg-brand-white min-h-screen pb-20 font-sans selection:bg-brand-blue/30 text-brand-black relative overflow-hidden pt-32">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue/[0.03] rounded-full blur-[120px] pointer-events-none" />
      
      <main className="container mx-auto px-6 mt-8 lg:px-20 max-w-7xl relative z-10">
        {/* BACK BUTTON */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-brand-gray hover:text-brand-black font-black text-[10px] uppercase tracking-widest transition-all mb-10 animate-slide-up"
        >
          <div className="w-10 h-10 bg-brand-gray-light border border-brand-gray-light rounded-xl flex items-center justify-center group-hover:bg-brand-blue group-hover:border-brand-blue group-hover:text-brand-white transition-all shadow-sm">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          Back to Explore
        </button>

        {/* HEADER */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="max-w-3xl">
            {/* Quick Search for other hotels */}
            <div ref={searchRef} className="relative mb-8 max-w-md">
              <div className="flex items-center gap-3 p-2 bg-brand-gray-light rounded-2xl border border-brand-gray-light focus-within:border-brand-blue/30 focus-within:bg-white transition-all shadow-sm">
                <Search size={18} className="text-brand-gray ml-2" />
                <input 
                  type="text"
                  placeholder="Search another city..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => searchInput.length >= 2 && !searchInput.includes('(') && setShowDropdown(true)}
                  className="bg-transparent outline-none flex-1 font-bold text-sm"
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')} className="p-1 hover:bg-brand-gray-light rounded-lg transition-colors">
                    <X size={14} className="text-brand-gray" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-brand-gray-light overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  {suggestions.map((loc, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleSelectSuggestion(loc)}
                      className="px-6 py-4 hover:bg-brand-gray-light cursor-pointer border-b border-brand-gray-light last:border-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-brand-black">{loc.name}</p>
                        <span className="text-[10px] font-black bg-brand-blue/10 text-brand-blue px-2 py-1 rounded-md">{loc.iataCode}</span>
                      </div>
                      <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">{loc.city}, {loc.country}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex text-brand-blue gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <div className="h-1 w-1 bg-brand-gray-light rounded-full"></div>
              <span className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] bg-brand-blue/5 px-3 py-1 rounded-full border border-brand-blue/10">Verified Partner</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-brand-black tracking-tight mb-6 leading-[1.1]">
              {hotel?.name || 'Grand Heritage Resort & Spa'}
            </h1>
            <div className="flex items-center gap-3 text-brand-gray font-bold">
              <div className="w-10 h-10 bg-brand-blue/5 rounded-xl flex items-center justify-center border border-brand-blue/10">
                <MapPin size={20} className="text-brand-blue" />
              </div>
              <span className="text-lg">{hotel?.address || '123 Avenue des Champs-Élysées, Paris, France'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 bg-brand-gray-light border border-brand-gray-light rounded-2xl flex items-center justify-center text-brand-gray hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all shadow-sm">
              <Heart size={20} />
            </button>
            <button className="w-12 h-12 bg-brand-gray-light border border-brand-gray-light rounded-2xl flex items-center justify-center text-brand-gray hover:text-brand-blue hover:bg-brand-blue/10 hover:border-brand-blue/20 transition-all shadow-sm">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* IMAGE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px] mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           <div className="md:col-span-2 h-full bg-brand-gray-light rounded-[3rem] overflow-hidden group shadow-xl border border-brand-gray-light">
             <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="hotel" />
           </div>
           <div className="grid grid-rows-2 gap-6 md:col-span-1 h-full">
              <div className="bg-brand-gray-light rounded-[2.5rem] overflow-hidden group border border-brand-gray-light">
                <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="room" />
              </div>
              <div className="bg-brand-gray-light rounded-[2.5rem] overflow-hidden group border border-brand-gray-light">
                <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="pool" />
              </div>
           </div>
           <div className="hidden md:block bg-brand-gray-light rounded-[3rem] overflow-hidden relative group border border-brand-gray-light">
             <img src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=600" className="w-full h-full object-cover brightness-50 group-hover:scale-110 transition-transform duration-1000" alt="view" />
             <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-white">
               <span className="text-3xl font-black">+12</span>
               <span className="text-[10px] font-black uppercase tracking-widest mt-2">More Photos</span>
             </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-20 mb-20">
          <div className="lg:col-span-2 space-y-16">
            <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-2 bg-brand-blue rounded-full"></div>
                <h3 className="text-3xl font-black text-brand-black tracking-tight">The Experience</h3>
              </div>
              <p className="text-brand-gray text-xl leading-relaxed font-medium">
                Experience world-class service at <span className="text-brand-black font-bold">{hotel?.name || 'this exceptional property'}</span>. 
                This stay offers a unique blend of modern luxury and timeless comfort, meticulously designed to cater to the most discerning travelers. 
                Situated just <span className="text-brand-blue font-bold">{hotel?.distance || 'a short walk'}</span> from the city's most iconic landmarks, 
                you'll find yourself at the heart of everything while enjoying unparalleled tranquility.
              </p>
            </section>

            {/* AMENITIES */}
            <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-brand-blue mb-10">Premium Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                {[
                  {icon:<Wifi size={24}/>, label:'High-Speed WiFi', desc: 'Complimentary 1Gbps'},
                  {icon:<Car size={24}/>, label:'Valet Parking', desc: '24/7 Secure Access'},
                  {icon:<Coffee size={24}/>, label:'Gourmet Breakfast', desc: 'Chef-prepared Daily'},
                  {icon:<Wind size={24}/>, label:'Climate Control', desc: 'Advanced Air Systems'},
                  {icon:<ShieldCheck size={24}/>, label:'Concierge', desc: 'Personalized Service'},
                  {icon:<Building size={24}/>, label:'Business Center', desc: 'Full-service Office'}
                ].map((item, i) => (
                  <div key={i} className="group flex items-start gap-5">
                    <div className="w-14 h-14 bg-brand-gray-light border border-brand-gray-light rounded-2xl flex items-center justify-center shadow-sm text-brand-blue group-hover:bg-brand-blue group-hover:text-brand-white group-hover:scale-110 transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <span className="font-black text-brand-black text-sm block mb-1">{item.label}</span>
                      <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* NEARBY HOTELS */}
            <section className="pt-16 border-t border-brand-gray-light animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between mb-10">
                <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-brand-blue">Explore Nearby Properties</h4>
                <div className="h-px flex-1 bg-brand-gray-light mx-8"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {nearby.map((n, idx) => (
                  <div 
                    key={n.hotel_id} 
                    onClick={() => navigate(`/hotel/${n.hotel_id}`)}
                    className="flex items-center gap-6 p-6 rounded-[2.5rem] border border-brand-gray-light bg-brand-white hover:border-brand-blue/40 hover:bg-brand-gray-light hover:shadow-xl hover:shadow-brand-blue/5 transition-all cursor-pointer group animate-slide-up"
                    style={{ animationDelay: `${0.6 + (idx * 0.1)}s` }}
                  >
                    <div className="w-24 h-24 bg-brand-gray-light rounded-[2rem] shrink-0 flex items-center justify-center text-brand-gray group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-all duration-500 group-hover:rotate-6 border border-brand-gray-light">
                      <Building size={40} />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-black text-brand-black text-lg line-clamp-1 group-hover:text-brand-blue transition-colors mb-2">{n.name}</h5>
                      <div className="flex items-center gap-2 text-brand-gray">
                        <MapPin size={12} className="text-brand-blue" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{n.distance} miles away</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-brand-gray/40 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* BOOKING CARD */}
          <aside className="relative animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="sticky top-32 bg-brand-white border border-brand-gray-light p-12 rounded-[3.5rem] shadow-2xl overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/[0.03] rounded-full -ml-16 -mb-16 blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <div className="text-[10px] font-black text-brand-gray uppercase tracking-widest mb-2">Starting From</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-brand-black tracking-tighter">₹24,999</span>
                      <span className="text-brand-gray font-bold text-sm uppercase tracking-widest">/ night</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-brand-blue font-black text-sm flex items-center justify-end gap-1 mb-2">
                      <Star size={14} fill="currentColor" /> 4.9
                    </div>
                    <div className="text-[10px] font-black text-brand-gray uppercase tracking-widest">840 Reviews</div>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="p-4 bg-brand-gray-light rounded-2xl border border-brand-gray-light">
                    <div className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-1">Check-in / Out</div>
                    <div className="text-xs font-bold text-brand-black">May 12, 2026 - May 18, 2026</div>
                  </div>
                  <div className="p-4 bg-brand-gray-light rounded-2xl border border-brand-gray-light">
                    <div className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-1">Guests</div>
                    <div className="text-xs font-bold text-brand-black">2 Adults, 1 Child</div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    navigate('/checkout', {
                      state: {
                        bookingData: {
                          type: 'hotel',
                          title: hotel?.name || 'Grand Heritage Suite',
                          price: 24999,
                          currency: 'INR',
                          location: hotel?.city || 'Location',
                          date: '2026-05-12',
                          details: hotel
                        }
                      }
                    });
                  }}
                  className="w-full bg-brand-blue text-brand-white py-6 rounded-[2rem] font-black shadow-lg shadow-brand-blue/20 hover:bg-brand-darkBlue transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                  Reserve Luxury Suite
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-center text-[10px] font-bold text-brand-gray uppercase tracking-widest mt-6">
                  No payment charged yet
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* MOBILE STICKY BOOKING BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 lg:hidden z-50 flex items-center justify-between shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] pb-safe">
        <div>
           <div className="text-[10px] font-black text-brand-gray uppercase tracking-widest mb-1">Total for 6 nights</div>
           <div className="flex items-baseline gap-1">
             <span className="text-2xl font-black text-brand-black">₹24,999</span>
             <span className="text-[10px] text-brand-gray font-bold uppercase">/ incl. taxes</span>
           </div>
        </div>
        <button 
          onClick={() => {
            navigate('/checkout', {
              state: {
                bookingData: {
                  type: 'hotel',
                  title: hotel?.name || 'Grand Heritage Suite',
                  price: 24999,
                  currency: 'INR',
                  location: hotel?.city || 'Location',
                  date: '2026-05-12',
                  details: hotel
                }
              }
            });
          }}
          className="px-8 py-4 bg-brand-blue text-brand-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-blue/20 active:scale-95 transition-all"
        >
          Reserve Now
        </button>
      </div>
    </div>
  );
};

export default HotelDetailsPage;
