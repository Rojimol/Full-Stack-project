import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, DollarSign, Notebook, Rocket, Sparkles, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import { bookingAPI } from '../services/api';

const CityAutocomplete = ({ label, value, onChange, placeholder, icon }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value && value.length >= 2 && !value.includes('(')) {
        try {
          const results = await bookingAPI.searchCities(value);
          setSuggestions(results);
          setShowDropdown(true);
        } catch (e) {
          console.error("Search failed", e);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    if (showDropdown && inputRef.current) {
      const updatePos = () => {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      };
      updatePos();
      window.addEventListener('resize', updatePos);
      window.addEventListener('scroll', updatePos, true);
      return () => {
        window.removeEventListener('resize', updatePos);
        window.removeEventListener('scroll', updatePos, true);
      };
    }
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        // Check if click is inside the portal dropdown
        const dropdowns = document.querySelectorAll('.city-dropdown-portal');
        let clickedInside = false;
        dropdowns.forEach(d => {
            if (d.contains(event.target)) clickedInside = true;
        });
        if (!clickedInside) setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc) => {
    onChange(`${loc.name}, ${loc.country} (${loc.iataCode})`);
    setShowDropdown(false);
  };

  return (
    <div ref={inputRef} className="space-y-4 group relative">
      <label className="flex items-center gap-2 text-[10px] font-black text-brand-gray uppercase tracking-widest ml-1 group-focus-within:text-brand-blue transition-colors">
        {icon}
        {label} *
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value && value.length >= 2 && !value.includes('(') && setShowDropdown(true)}
        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-brand-gray/50 focus:bg-white focus:border-brand-blue transition-all outline-none"
        placeholder={placeholder}
        required
      />

      {showDropdown && suggestions.length > 0 && createPortal(
        <div 
          className="city-dropdown-portal fixed bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: `${dropdownPos.top + 8}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((loc, i) => (
            <div 
              key={i} 
              onClick={() => handleSelect(loc)}
              className="px-6 py-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{loc.name}</p>
                <span className="text-[10px] font-black bg-brand-blue/10 text-brand-blue px-2 py-1 rounded-md">{loc.iataCode}</span>
              </div>
              <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">{loc.city}, {loc.country}</p>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

const ItineraryForm = ({ userId, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    origin: initialData?.origin || '',
    destination: initialData?.destination || '',
    startDate: initialData?.startDate?.split('T')[0] || '',
    endDate: initialData?.endDate?.split('T')[0] || '',
    estimated: initialData?.totalBudget || '',
    notes: initialData?.description || initialData?.notes || '',
    userId: userId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        origin: initialData.origin || '',
        destination: initialData.destination || '',
        startDate: initialData.startDate?.split('T')[0] || '',
        endDate: initialData.endDate?.split('T')[0] || '',
        estimated: initialData.totalBudget || '',
        notes: initialData.description || initialData.notes || '',
        userId: userId
      });
    }
  }, [initialData, userId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trip = {
      title: formData.title.trim(),
      origin: formData.origin.trim(),
      destination: formData.destination.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      estimated: parseFloat(formData.estimated) || 0,
      notes: formData.notes || '',
      userId,
    };

    if (!trip.title || !trip.destination || !trip.startDate || !trip.endDate || !trip.origin) {
      setError('Essential fields are missing');
      setLoading(false);
      return;
    }
    
    setTimeout(() => {
      if (typeof onSuccess === 'function') {
        onSuccess(trip);
      } else {
        console.warn('onSuccess callback is not a function');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-[3rem] shadow-3xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-slide-up relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Decorative Header */}
          <div className="h-40 bg-white p-10 flex items-end relative overflow-hidden border-b border-slate-100">
            <div className="absolute top-0 right-0 p-10 opacity-10 scale-150 rotate-12 text-brand-blue">
              <Rocket size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-brand-blue animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray">New Adventure</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Design Your <span className="text-brand-blue">Trip.</span></h2>
            </div>
            <button
              onClick={onClose}
              className="absolute top-8 right-8 w-12 h-12 bg-slate-50 hover:bg-slate-100 text-brand-gray hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all border border-slate-100 group z-20"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar relative z-10">
            {error && (
              <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3 animate-slide-up">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                {/* Trip Name */}
                <div className="space-y-4 group md:col-span-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-brand-gray uppercase tracking-widest ml-1 group-focus-within:text-brand-blue transition-colors">
                    <Rocket size={14} />
                    Trip Name *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-brand-gray/50 focus:bg-white focus:border-brand-blue transition-all outline-none"
                    placeholder="e.g. Alpine Escape"
                    required
                  />
                </div>

                {/* Origin */}
                <CityAutocomplete
                  label="From (Origin)"
                  value={formData.origin}
                  onChange={(val) => setFormData({ ...formData, origin: val })}
                  placeholder="e.g. New York, USA"
                  icon={<PlaneTakeoff size={14} />}
                />

                {/* Destination */}
                <CityAutocomplete
                  label="Destination"
                  value={formData.destination}
                  onChange={(val) => setFormData({ ...formData, destination: val })}
                  placeholder="e.g. Tokyo, Japan"
                  icon={<PlaneLanding size={14} />}
                />

                {/* Dates */}
                <div className="space-y-4 group">
                  <label className="flex items-center gap-2 text-[10px] font-black text-brand-gray uppercase tracking-widest ml-1 group-focus-within:text-brand-blue transition-colors">
                    <Calendar size={14} />
                    Departure *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    min={new Date().toLocaleDateString('en-CA')}
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-brand-blue transition-all outline-none [color-scheme:light]"
                    required
                  />
                </div>

                <div className="space-y-4 group">
                  <label className="flex items-center gap-2 text-[10px] font-black text-brand-gray uppercase tracking-widest ml-1 group-focus-within:text-brand-blue transition-colors">
                    <Calendar size={14} />
                    Return *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    min={formData.startDate || new Date().toLocaleDateString('en-CA')}
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-brand-blue transition-all outline-none [color-scheme:light]"
                    required
                  />
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-4 group">
                <label className="flex items-center gap-2 text-[10px] font-black text-brand-gray uppercase tracking-widest ml-1 group-focus-within:text-brand-blue transition-colors">
                  <DollarSign size={14} />
                  Budgeting Goal (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="estimated"
                    value={formData.estimated}
                    onChange={handleChange}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-brand-gray/50 focus:bg-white focus:border-brand-blue transition-all outline-none"
                    placeholder="Enter estimated budget"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-gray font-black text-[10px] uppercase tracking-widest">INR</div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4 group">
                <label className="flex items-center gap-2 text-[10px] font-black text-brand-gray uppercase tracking-widest ml-1 group-focus-within:text-brand-blue transition-colors">
                  <Notebook size={14} />
                  Travel Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-brand-gray/50 focus:bg-white focus:border-brand-blue transition-all outline-none resize-none"
                  placeholder="Tell us more about your plans..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-6 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-8 py-5 bg-slate-50 text-brand-gray text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] relative px-8 py-5 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-darkBlue transition-all shadow-xl shadow-brand-blue/20 disabled:opacity-70 group overflow-hidden"
                >
                  <span className={`flex items-center justify-center gap-2 transition-transform duration-500 ${loading ? '-translate-y-12' : ''}`}>
                    Launch Trip
                    <Rocket size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center animate-slide-up">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryForm;