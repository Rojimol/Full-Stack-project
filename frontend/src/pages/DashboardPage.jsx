import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, DollarSign, MapPin, PlusCircle, ListChecks, Compass, 
  Copy, Trash2, Users, Bell, Cloud, TrendingUp, AlertCircle, 
  ChevronRight, LayoutDashboard, LogOut, Search, Zap, Star, Settings,
  Edit3, Eye, X, Plane, Hotel, CheckCircle2, BedDouble, Train, Bus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ItineraryForm from '../components/ItineraryForm';
import BudgetTracker from '../components/BudgetTracker';
import CollaborationPage from './CollaborationPage';
import { itineraryAPI, recommendationAPI, notificationAPI, bookingAPI } from '../services/api';
import { calculateDuration } from '../utils/dateUtils';

const DashboardPage = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [showItineraryForm, setShowItineraryForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [viewingTrip, setViewingTrip] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recoFilter, setRecoFilter] = useState({ destination: '', category: '' });
  const [notifications, setNotifications] = useState([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successDestination, setSuccessDestination] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('booking_success') === 'true') {
      setShowSuccessToast(true);
      const dest = params.get('destination');
      if (dest) setSuccessDestination(dest);
      
      // Switch to bookings tab to show the new booking
      setActiveTab('bookings');
      
      // Clean URL
      window.history.replaceState({}, '', '/dashboard');
      
      // Hide toast after 5s
      setTimeout(() => setShowSuccessToast(false), 5000);
    }
  }, [location]);

  const loadData = useCallback(async () => {
    // 1. Load Local Storage Data (Fallback/Offline)
    const localFlights = JSON.parse(localStorage.getItem('bookedFlights') || '[]');
    const localHotels = JSON.parse(localStorage.getItem('bookedHotels') || '[]');
    
    // Initialize with local data first
    let allFlights = [...localFlights];
    let allHotels = [...localHotels];

    if (user?.id) {
      try {
        // 2. Try fetching from API if user exists
        const tripsPromise = itineraryAPI.getUserItineraries(user.id).catch(() => ({ data: [] }));
        const bookingsPromise = bookingAPI.getUserFlights(user.id).catch(() => ({ data: [] }));
        const hotelsPromise = bookingAPI.getUserHotels(user.id).catch(() => ({ data: [] }));
        
        const [tripsRes, bookingsRes, hotelsRes] = await Promise.all([
          tripsPromise,
          bookingsPromise,
          hotelsPromise
        ]);

        setTrips(tripsRes.data || []);
        
        // Merge API results with Local Storage
        allFlights = [...(bookingsRes.data || []), ...localFlights];
        allHotels = [...(hotelsRes.data || []), ...localHotels];
        
      } catch (err) {
        console.error("Data load error:", err);
      }
    }

    // Deduplicate and Set State
    const uniqueFlights = Array.from(new Map(allFlights.map(item => [item.id, item])).values());
    setBookings(uniqueFlights);

    const uniqueHotels = Array.from(new Map(allHotels.map(item => [item.id, item])).values());
    setHotels(uniqueHotels);

  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'trips' || activeTab === 'groups') {
      loadData();
    }
  }, [activeTab, loadData]);

  const updateTrip = async (id, partial) => {
    const current = trips.find(t => t.id === id);
    if (!current) return;
    try {
      await itineraryAPI.update(id, { ...current, ...partial });
      loadData();
    } catch (err) { console.error(err); }
  };

  const deleteTrip = async (id) => {
    if(!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      await itineraryAPI.delete(id);
      loadData();
    } catch (err) { console.error(err); }
  };

  const duplicateTrip = async (id) => {
    try {
      await itineraryAPI.duplicate(id);
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleCancelFlight = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        // Try API
        await bookingAPI.cancelFlight(id).catch(() => {});
        
        // Update State
        setBookings(bookings.filter(b => b.id !== id));
        
        // Update Local Storage
        const localFlights = JSON.parse(localStorage.getItem('bookedFlights') || '[]');
        const updatedFlights = localFlights.filter(b => b.id !== id);
        localStorage.setItem('bookedFlights', JSON.stringify(updatedFlights));
        
      } catch (err) { 
        console.error("Failed to cancel flight", err);
      }
    }
  };

  const handleCancelHotel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this hotel booking?')) {
      try {
        await bookingAPI.cancelHotel(id).catch(() => {});
        setHotels(hotels.filter(h => h.id !== id));
        
        // Update Local Storage
        const localHotels = JSON.parse(localStorage.getItem('bookedHotels') || '[]');
        const updatedHotels = localHotels.filter(h => h.id !== id);
        localStorage.setItem('bookedHotels', JSON.stringify(updatedHotels));
      } catch (err) {
        console.error("Failed to cancel hotel", err);
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'trips', label: 'My Trips', icon: <ListChecks size={20} /> },
    { id: 'bookings', label: 'My Bookings', icon: <Plane size={20} /> },
    { id: 'groups', label: 'Circles', icon: <Users size={20} /> },
    { id: 'budget', label: 'Expenses', icon: <DollarSign size={20} /> },
    { id: 'reco', label: 'Explore', icon: <Compass size={20} /> },
    { id: 'notifications', label: 'Inbox', icon: <Bell size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* MOBILE TABS */}
      <div className="md:hidden bg-white border-b border-slate-200 sticky top-20 z-30 overflow-x-auto no-scrollbar">
        <div className="flex p-2 gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col fixed top-24 bottom-0 overflow-y-auto z-20 shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
              <Compass className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Travel Bridge</span>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id 
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue font-medium'
                }`}
              >
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
                {tab.id === 'notifications' && notifications.length > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-72 p-4 md:p-10 max-w-7xl mx-auto min-h-screen w-full">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user?.fullName?.split(' ')[0] || user?.name || 'Explorer'}
            </h1>
            <p className="text-sm md:text-base text-slate-500">Here's what's happening with your travel plans.</p>
          </div>
          
          <button 
            onClick={() => setShowItineraryForm(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-darkBlue transition-all shadow-lg shadow-brand-blue/20 active:scale-95"
          >
            <PlusCircle size={18} />
            <span>Plan New Trip</span>
          </button>
        </header>

        {/* CONTENT SWITCHER */}
        <div className="space-y-8">
          
          {/* SUCCESS BANNER */}
          {successDestination && (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center justify-between mb-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-900">Booking Confirmed!</h3>
                  <p className="text-emerald-700 text-sm">Your flight to {successDestination} is confirmed. Ready to book a hotel?</p>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/booking?tab=hotels&dest=${encodeURIComponent(successDestination)}`)}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm"
              >
                Find Hotels
              </button>
            </div>
          )}

          {activeTab === 'bookings' && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-10"
            >
              
              {/* Transport Section (Flights, Trains, Buses) */}
              <section>
                <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
                    <Plane size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Transport Bookings</h2>
                </motion.div>
                
                {bookings.length === 0 ? (
                  <motion.div variants={itemVariants} className="bg-white rounded-2xl p-10 border border-slate-200 border-dashed text-center">
                    <Plane size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No trips booked yet.</p>
                    <button 
                      onClick={() => navigate('/booking')}
                      className="mt-4 text-brand-blue font-bold text-sm hover:underline"
                    >
                      Search Trips
                    </button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {bookings.map((b, idx) => {
                      let Icon = Plane;
                      let typeLabel = 'Flight';
                      if (b.type === 'train') { Icon = Train; typeLabel = 'Train'; }
                      if (b.type === 'bus') { Icon = Bus; typeLabel = 'Bus'; }

                      return (
                      <motion.div variants={itemVariants} key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 hover:shadow-lg transition-all shadow-sm group">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-6 border-b border-slate-100 gap-4">
                          <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0">
                              <Icon size={20} className="md:w-6 md:h-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-base md:text-lg text-slate-900 truncate">{b.airline || b.operator || typeLabel}</h3>
                              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider truncate">{b.flightNumber || b.number || typeLabel}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold self-start ${
                            b.bookingStatus === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {b.bookingStatus || 'PENDING'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2 md:gap-4 mb-4">
                          <div className="text-center min-w-[60px] md:min-w-[80px]">
                            <p className="text-xl md:text-2xl font-black text-slate-900">{b.departureAirport || b.origin || 'ORI'}</p>
                            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1">Origin</p>
                          </div>
                          <div className="flex-1 flex flex-col items-center px-2 md:px-4">
                             <div className="w-full h-px bg-slate-200 relative mb-1">
                               <Icon size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 bg-white px-1 md:w-3.5 md:h-3.5" />
                             </div>
                             <span className="text-[10px] md:text-xs text-slate-400 font-medium">{calculateDuration(b.departureTime, b.arrivalTime)}</span>
                          </div>
                          <div className="text-center min-w-[60px] md:min-w-[80px]">
                            <p className="text-xl md:text-2xl font-black text-slate-900">{b.arrivalAirport || b.destination || 'DES'}</p>
                            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1">Dest</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 mt-2 bg-slate-50 -mx-4 -mb-4 px-4 py-3 md:-mx-6 md:-mb-6 md:px-6 md:py-4 rounded-b-2xl border-t border-slate-100">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar size={14} className="md:w-4 md:h-4" />
                            <span className="text-xs md:text-sm font-semibold">
                              {new Date(b.departureTime || b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 md:gap-4">
                            <p className="text-base md:text-lg font-black text-brand-blue">₹{b.price?.toLocaleString()}</p>
                            <button 
                              onClick={() => handleCancelFlight(b.id)}
                              className="text-red-500 hover:text-red-700 text-xs md:text-sm font-bold underline opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                      )})}
                  </div>
                )}
              </section>

              {/* Hotels Section */}
              <section>
                <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                    <Hotel size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Hotel Bookings</h2>
                </motion.div>
                
                {hotels.length === 0 ? (
                  <motion.div variants={itemVariants} className="bg-white rounded-2xl p-10 border border-slate-200 border-dashed text-center">
                    <Hotel size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No hotels booked yet.</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {hotels.map((h, idx) => (
                      <motion.div variants={itemVariants} key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                              <BedDouble size={24} />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{h.hotelName || 'Hotel Name'}</h3>
                              <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                                <MapPin size={12} />
                                <span className="line-clamp-1">{h.location}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            h.bookingStatus === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {h.bookingStatus || 'PENDING'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-4 rounded-xl">
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Check In</p>
                            <p className="text-sm font-bold text-slate-900">{new Date(h.checkIn).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Check Out</p>
                            <p className="text-sm font-bold text-slate-900">{new Date(h.checkOut).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500 font-medium">{h.roomCount || 1} Rooms, {h.guestCount || 2} Guests</span>
                          <div className="flex items-center gap-4">
                            <p className="text-lg font-black text-brand-blue">₹{h.pricePerNight?.toLocaleString()}</p>
                            <button 
                              onClick={() => handleCancelHotel(h.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-bold underline"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center">
                    <ListChecks size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Total Trips</p>
                    <p className="text-2xl font-bold text-slate-900">{trips.length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Total Budget</p>
                    <p className="text-2xl font-bold text-slate-900">₹{trips.reduce((s, t) => s + (t.totalBudget || 0), 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Plane size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Flights Booked</p>
                    <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
                  </div>
                </div>
              </div>

              <section>
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold text-slate-900">Recent Itineraries</h2>
                   <button onClick={() => setActiveTab('trips')} className="text-brand-blue text-sm font-bold hover:underline">View All</button>
                </div>
                {trips.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 border border-slate-200 border-dashed text-center">
                    <Compass size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No trips planned yet.</p>
                    <button onClick={() => setShowItineraryForm(true)} className="mt-4 text-brand-blue font-bold text-sm hover:underline">Start Planning</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.slice(0, 3).map(t => (
                      <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all shadow-sm group">
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                             <MapPin size={20} />
                           </div>
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => setEditingTrip(t)} className="p-2 text-slate-400 hover:text-brand-blue"><Edit3 size={16} /></button>
                             <button onClick={() => deleteTrip(t.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                           </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{t.title}</h3>
                        <p className="text-slate-500 text-sm mb-4 truncate">{t.destination}</p>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <Calendar size={12} />
                          {t.startDate}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold text-slate-900">Recent Bookings</h2>
                   <button onClick={() => setActiveTab('bookings')} className="text-brand-blue text-sm font-bold hover:underline">View All</button>
                </div>
                {bookings.length === 0 && hotels.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 border border-slate-200 border-dashed text-center">
                    <Plane size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No bookings yet.</p>
                    <button onClick={() => navigate('/booking')} className="mt-4 text-brand-blue font-bold text-sm hover:underline">Book Now</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...bookings, ...hotels].slice(0, 3).map((item, idx) => {
                       const isHotel = item.type === 'hotel' || item.hotelName;
                       return (
                         <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isHotel ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                  {isHotel ? <Hotel size={20} /> : <Plane size={20} />}
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-900 line-clamp-1">{isHotel ? (item.hotelName || item.title) : (item.airline || item.title || 'Flight')}</h3>
                                  <p className="text-xs text-slate-500 font-semibold">{isHotel ? 'Hotel Stay' : 'Transport'}</p>
                                </div>
                              </div>
                              <div className="mb-4">
                                <p className="text-lg font-bold text-slate-900 line-clamp-1">{isHotel ? item.location : `${item.origin || item.departureAirport || 'ORI'} → ${item.destination || item.arrivalAirport || 'DES'}`}</p>
                                <p className="text-xs text-slate-400 font-medium">{new Date(item.departureTime || item.checkIn || item.date || Date.now()).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                               <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.bookingStatus === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                 {item.bookingStatus || 'PENDING'}
                               </span>
                               <p className="font-bold text-slate-900">₹{item.price?.toLocaleString()}</p>
                            </div>
                         </div>
                       );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
          
          {activeTab === 'trips' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map(t => (
                  <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all shadow-sm group">
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                         <MapPin size={20} />
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => setEditingTrip(t)} className="p-2 text-slate-400 hover:text-brand-blue"><Edit3 size={16} /></button>
                         <button onClick={() => duplicateTrip(t.id)} className="p-2 text-slate-400 hover:text-brand-blue"><Copy size={16} /></button>
                         <button onClick={() => deleteTrip(t.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                       </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{t.title}</h3>
                    <p className="text-slate-500 text-sm mb-4 truncate">{t.destination}</p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <Calendar size={12} />
                      {t.startDate}
                    </div>
                  </div>
                ))}
             </div>
          )}

          {activeTab === 'groups' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.filter(t => t.collaborators && t.collaborators.length > 0).length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl p-10 border border-slate-200 border-dashed text-center">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No active circles yet.</p>
                    <p className="text-xs text-slate-400 mt-2">Join a community or invite friends to your trips!</p>
                  </div>
                ) : (
                  trips.filter(t => t.collaborators && t.collaborators.length > 0).map(t => (
                    <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all shadow-sm group relative">
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                           <Users size={20} />
                         </div>
                         <div className="flex -space-x-2">
                            {t.collaborators?.slice(0, 3).map((c, i) => (
                              <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id}`} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100" alt={c.fullName} />
                            ))}
                            {(t.collaborators?.length || 0) > 3 && (
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                +{(t.collaborators?.length || 0) - 3}
                              </div>
                            )}
                         </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{t.title}</h3>
                      <p className="text-slate-500 text-sm mb-4 truncate">{t.destination}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <Calendar size={12} />
                          {t.startDate}
                        </div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                          {t.collaborators?.length || 1} Members
                        </span>
                      </div>
                    </div>
                  ))
                )}
             </div>
          )}

          {activeTab === 'reco' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {recommendations.map((r, idx) => (
                 <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                   <div className="h-48 relative">
                     <img 
                       src={r.imageUrl || `https://images.unsplash.com/photo-${idx === 0 ? '1506744038136-46273834b3fb' : idx === 1 ? '1501785888041-af3ef285b470' : '1500530855697-b586d89ba3ee'}?auto=format&fit=crop&w=800&q=80`} 
                       alt={r.title} 
                       className="w-full h-full object-cover" 
                     />
                     <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900">
                       {r.category || 'Must Visit'}
                     </div>
                   </div>
                   <div className="p-6">
                     <h3 className="text-lg font-bold text-slate-900 mb-2">{r.title}</h3>
                     <p className="text-slate-500 text-sm line-clamp-2">{r.description}</p>
                   </div>
                 </div>
               ))}
            </div>
          )}

        </div>
      </main>

      {/* MODALS */}
      {showItineraryForm && (
        <ItineraryForm 
          userId={user?.id}
          onClose={() => setShowItineraryForm(false)}
          onSuccess={async (tripData) => {
            try {
              await itineraryAPI.create({
                ...tripData,
                user: { id: user?.id, fullName: user?.fullName || user?.name || 'User' }
              });
              setShowItineraryForm(false);
              loadData();
              alert('Trip created successfully!');
            } catch (err) {
              console.error("Failed to create trip", err);
              alert('Failed to create trip');
            }
          }}
        />
      )}
      
      {editingTrip && (
        <ItineraryForm 
          userId={user?.id}
          initialData={editingTrip}
          onClose={() => setEditingTrip(null)}
          onSuccess={async (tripData) => {
            try {
              await itineraryAPI.update(editingTrip.id, { ...editingTrip, ...tripData });
              setEditingTrip(null);
              loadData();
            } catch (err) {
              console.error("Failed to update trip", err);
            }
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
