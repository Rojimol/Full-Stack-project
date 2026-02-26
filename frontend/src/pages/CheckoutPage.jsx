import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ChevronLeft, 
  CheckCircle2, 
  Hotel, 
  Plane, 
  User, 
  Mail, 
  Phone,
  Lock,
  Cloud
} from 'lucide-react';
import { weatherAPI, bookingAPI } from '../services/api';

const CheckoutPage = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [weather, setWeather] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: user?.fullName || user?.name || '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.fullName || user.name || prev.firstName,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  useEffect(() => {
    if (location.state && location.state.bookingData) {
      setBookingData(location.state.bookingData);
      
      // Fetch weather for the destination
      const dest = location.state.bookingData.location;
      if (dest) {
        // Extract city name if it's "Origin to Destination" format
        const city = dest.includes(' to ') ? dest.split(' to ')[1] : dest;
        weatherAPI.getWeather(city)
          .then(data => setWeather(data))
          .catch(err => console.warn("Weather fetch failed", err));
      }
    } else {
      // Fallback or redirect if no data
      // navigate('/booking'); // Optional: redirect back if accessed directly
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = (e) => {
    e.preventDefault();
    
    // Basic Validation - Simplified for demo (no payment fields required)
    if (!formData.firstName && !user) {
      alert("Please log in or provide your details.");
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setBookingSuccess(true);
      
      const newBookingId = 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const finalBooking = {
        ...bookingData,
        ...formData,
        id: newBookingId,
        bookingStatus: 'CONFIRMED',
        bookedAt: new Date().toISOString()
      };

      // Enrich booking data for Dashboard display
      if (bookingData.type === 'flight' || bookingData.type === 'train' || bookingData.type === 'bus') {
          // Extract flight details if available
          const segments = bookingData.details?.itineraries?.[0]?.segments;
          if (segments && segments.length > 0) {
              finalBooking.origin = segments[0].departure?.iataCode;
              finalBooking.destination = segments[segments.length - 1].arrival?.iataCode;
              finalBooking.departureTime = segments[0].departure?.at;
              finalBooking.arrivalTime = segments[segments.length - 1].arrival?.at;
              finalBooking.airline = bookingData.title?.split(' ')[0] || 'Airline';
              finalBooking.flightNumber = segments[0].number || segments[0].carrierCode + segments[0].number;
          } else {
              // Fallback if details are missing
              finalBooking.origin = 'ORI';
              finalBooking.destination = bookingData.location;
              finalBooking.departureTime = new Date().toISOString();
          }
          
          // Save to Local Storage for Dashboard
          const existingFlights = JSON.parse(localStorage.getItem('bookedFlights') || '[]');
          localStorage.setItem('bookedFlights', JSON.stringify([finalBooking, ...existingFlights]));

      } else if (bookingData.type === 'hotel') {
          finalBooking.hotelName = bookingData.title;
          finalBooking.location = bookingData.location;
          // finalBooking.checkIn = ... (if we had date range)
          
          const existingHotels = JSON.parse(localStorage.getItem('bookedHotels') || '[]');
          localStorage.setItem('bookedHotels', JSON.stringify([finalBooking, ...existingHotels]));
      }

      setConfirmedBooking(finalBooking);
    }, 2000);
  };

  // Auto-redirect effect
  useEffect(() => {
    if (bookingSuccess) {
      const timer = setTimeout(() => {
        navigate(`/booking?tab=hotels&dest=${confirmedBooking?.location || ''}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [bookingSuccess, confirmedBooking, navigate]);

  // Success View
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 font-sans flex items-center justify-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 md:p-12 border border-white/50 shadow-2xl shadow-emerald-500/10 max-w-lg w-full text-center relative z-10"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30"
          >
            <CheckCircle2 size={48} />
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Booking Confirmed!</h2>
          <p className="text-slate-500 mb-8 text-lg leading-relaxed">
            Your {confirmedBooking?.type || 'booking'} has been successfully reserved.
            <br />
            <span className="text-sm font-bold text-emerald-600">Redirecting to hotels in 3s...</span>
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={() => navigate(`/booking?tab=hotels&dest=${confirmedBooking?.location || ''}`)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Hotel size={20} />
              Book Hotel Now
            </button>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar Placeholder / Back Button */}
      <div className="relative z-20 pt-8 px-6 md:px-12 max-w-7xl mx-auto mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors px-4 py-2 rounded-full hover:bg-white/50 backdrop-blur-sm"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back</span>
        </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Confirm Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Booking</span>
            </h1>
            <p className="text-slate-500 text-lg">Fill in your details to secure your reservation.</p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handlePayment}
            className="space-y-8"
          >
            {/* Personal Details Section - Simplified */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <User size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Traveler Details</h3>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Name</label>
                   <p className="text-lg font-bold text-slate-900">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                   <p className="text-lg font-bold text-slate-900">{formData.email}</p>
                </div>
              </div>
            </div>

            <button 
              disabled={isProcessing}
              type="submit"
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Booking
                  <CheckCircle2 size={24} className="text-emerald-400" />
                </>
              )}
            </button>
            
            <p className="text-center text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
              <Lock size={14} />
              Your transaction is secured with SSL encryption
            </p>
          </motion.form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 order-1 lg:order-2">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-8 space-y-6"
          >
            {/* Weather Widget */}
            {weather && (
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] p-6 text-white shadow-lg shadow-blue-500/30 relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-blue-200" />
                      <span className="text-sm font-bold text-blue-100 uppercase tracking-wider">{weather.location.name}</span>
                    </div>
                    <div className="text-4xl font-black mb-1">{weather.current.temp_c}°</div>
                    <div className="text-sm font-medium text-blue-100">{weather.current.condition.text}</div>
                  </div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <img src={weather.current.condition.icon} alt="Weather" className="w-10 h-10 brightness-200" />
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
              </div>
            )}

            <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white/50 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Order Summary</h3>
              
              {bookingData ? (
                <div className="space-y-6">
                  {/* Item Card */}
                  <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shrink-0 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      {bookingData.type === 'hotel' ? <Hotel size={28} /> : <Plane size={28} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-tight mb-1">{bookingData.title}</h4>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <MapPin size={14} />
                        {bookingData.location}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                      <span className="flex items-center gap-2"><Calendar size={16} /> Date</span>
                      <span className="text-slate-800">{bookingData.date}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                      <span>Guests</span>
                      <span className="text-slate-800">2 Adults</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t-2 border-dashed border-slate-200">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-500 font-bold">Total Amount</span>
                      <span className="text-3xl font-black text-slate-900">
                        <span className="text-lg text-slate-400 font-bold mr-1">{bookingData.currency}</span>
                        {bookingData.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p>No booking details found.</p>
                  <button onClick={() => navigate('/booking')} className="text-blue-600 font-bold mt-2 hover:underline">Go to Booking</button>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="bg-blue-50 rounded-[24px] p-6 flex items-center justify-center gap-8 text-blue-300">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck size={24} className="text-blue-500" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Secure</span>
              </div>
              <div className="w-px h-8 bg-blue-200" />
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 size={24} className="text-blue-500" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Verified</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
