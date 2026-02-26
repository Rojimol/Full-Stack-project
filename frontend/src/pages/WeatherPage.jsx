import {
  useState,
  useEffect
} from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  MapPin,
  Calendar,
  Thermometer,
  Droplets,
  Wind,
  Search,
  Navigation,
  AlertTriangle,
  ArrowRight,
  Umbrella,
  Waves,
  Tractor as Shirt,
  Compass,
  ChevronRight,
  RefreshCcw,
  Loader2,
  Globe,
  Info
} from 'lucide-react';
import {
  weatherAPI,
  travelTipAPI
} from '../services/api';

const WeatherPage = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [travelTip, setTravelTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Goa, India');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async (location) => {
      try {
        if (isMounted) setLoading(true);
        
        const [weatherRes, tipRes] = await Promise.allSettled([
          weatherAPI.getWeather(location),
          travelTipAPI.getTip(location.split(',')[0].trim())
        ]);

        if (isMounted) {
          if (weatherRes.status === 'fulfilled' && weatherRes.value) {
            setWeatherData(weatherRes.value);
          }
          if (tipRes.status === 'fulfilled' && tipRes.value?.data) {
            setTravelTip(tipRes.value.data);
          } else {
            setTravelTip(null);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData(selectedLocation);
    return () => {
      isMounted = false;
    };
  }, [selectedLocation]);

  const popularDestinations = [
    'Goa, India', 'Mumbai, India', 'Delhi, India',
    'Bangalore, India', 'Chennai, India', 'Kerala, India',
    'Manali, India', 'Darjeeling, India'
  ];

  const getWeatherIcon = (condition, size = 32) => {
    const props = {
      size,
      className: "transition-all duration-500"
    };
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun { ...props
        }
        className = "text-amber-400 animate-spin-slow" / > ;
      case 'partly cloudy':
        return <Cloud { ...props
        }
        className = "text-brand-gray" / > ;
      case 'cloudy':
        return <Cloud { ...props
        }
        className = "text-brand-gray" / > ;
      case 'rainy':
        return <CloudRain { ...props
        }
        className = "text-brand-blue" / > ;
      case 'thunderstorms':
        return <CloudRain { ...props
        }
        className = "text-brand-blue" / > ;
      case 'snow':
        return <CloudSnow { ...props
        }
        className = "text-white" / > ;
      default:
        return <Sun { ...props
        }
        className = "text-amber-400" / > ;
    }
  };

  const handleSearch = () => {
    if (searchLocation.trim()) {
      setSelectedLocation(searchLocation);
      setSearchLocation('');
    }
  };

  if (loading || !weatherData) {
    return (
      <div className="min-h-screen bg-brand-white flex flex-col items-center justify-center font-sans gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-brand-gray-light rounded-full"></div>
          <div className="absolute inset-0 border-4 border-brand-blue rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Cloud size={24} className="text-brand-blue animate-pulse" />
          </div>
        </div>
        <p className="text-brand-gray font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Forecast</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-white pb-20 font-sans selection:bg-brand-blue/30 text-brand-black overflow-hidden relative pt-32">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-20 py-12 relative z-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-slide-up">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
                <Waves size={20} />
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-brand-black tracking-tight">Travel <span className="text-brand-blue">Weather.</span></h1>
            </div>
            <p className="text-brand-gray font-medium text-sm max-w-xl">Get real-time weather updates and forecasts for your global destinations.</p>
          </div>
          <button 
            onClick={() => setSelectedLocation(selectedLocation)}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-brand-light border border-brand-gray-light text-brand-gray rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all active:scale-95 group"
          >
            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
            Refresh Data
          </button>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: CURRENT WEATHER CARD */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative group overflow-hidden bg-brand-white rounded-[2.5rem] border border-brand-gray-light shadow-xl shadow-brand-blue/5 p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-blue/5 border border-brand-blue/10 rounded-full text-brand-blue text-[9px] font-black uppercase tracking-[0.2em] mb-6">
                      <MapPin size={12} />
                      {weatherData.current.location}
                    </div>
                    <div className="flex items-center gap-8 mb-4">
                      <div className="w-24 h-24 bg-brand-light rounded-[2rem] border border-brand-gray-light flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700">
                        {getWeatherIcon(weatherData.current.condition, 48)}
                      </div>
                      <div>
                        <div className="text-6xl md:text-7xl font-black text-brand-black tracking-tighter leading-none flex items-start">
                          {weatherData.current.temperature}
                          <span className="text-3xl text-brand-blue mt-2 ml-1">°</span>
                        </div>
                        <p className="text-lg font-black text-brand-gray mt-2 uppercase tracking-[0.3em] flex items-center gap-3">
                          <span className="w-6 h-[2px] bg-brand-blue rounded-full"></span>
                          {weatherData.current.condition}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full md:w-64">
                    {[
                      { icon: <Thermometer size={16} />, label: 'Feels Like', value: `${weatherData.current.feelsLike}°` },
                      { icon: <Droplets size={16} />, label: 'Humidity', value: `${weatherData.current.humidity}%` },
                      { icon: <Wind size={16} />, label: 'Wind Speed', value: `${weatherData.current.windSpeed} km/h` },
                      { icon: <Calendar size={16} />, label: 'Today', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-brand-light rounded-2xl flex flex-col items-center justify-center text-center group/item hover:bg-brand-gray-light hover:shadow-lg hover:shadow-brand-blue/5 transition-all border border-transparent hover:border-brand-gray-light">
                        <div className="text-brand-gray group-hover/item:text-brand-blue group-hover/item:scale-110 transition-all mb-2">{item.icon}</div>
                        <span className="text-[8px] font-black text-brand-gray uppercase tracking-widest mb-1">{item.label}</span>
                        <span className="text-sm font-black text-brand-black">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ALERTS */}
                {weatherData.alerts.length > 0 && (
                  <div className="mt-8 p-6 bg-rose-50 rounded-3xl border border-rose-100 flex items-start gap-5 group/alert">
                    <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/20 group-hover/alert:scale-110 transition-transform">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-rose-600 uppercase tracking-widest mb-1 text-[10px]">Critical Advisory</h3>
                      <p className="text-rose-500/70 text-xs font-bold leading-relaxed">{weatherData.alerts[0].message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FORECAST */}
            <div className="bg-brand-white rounded-[2.5rem] border border-brand-gray-light shadow-xl shadow-brand-blue/5 p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-brand-black tracking-tight flex items-center gap-4">
                  <div className="w-9 h-9 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
                    <Calendar size={18} />
                  </div>
                  5-Day <span className="text-brand-blue">Forecast.</span>
                </h3>
                <div className="h-px flex-1 bg-brand-gray-light mx-8 hidden md:block"></div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {weatherData.forecast.map((day, index) => (
                  <div 
                    key={index} 
                    className="p-6 bg-brand-light rounded-3xl border border-transparent hover:border-brand-blue/30 hover:bg-brand-blue/5 hover:shadow-xl hover:shadow-brand-blue/5 hover:scale-[1.05] transition-all group/day text-center animate-slide-up"
                    style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
                  >
                    <span className="text-[9px] font-black text-brand-gray uppercase tracking-widest mb-4 block group-hover/day:text-brand-blue transition-colors">
                      {index === 0 ? 'Tomorrow' : day.day}
                    </span>
                    <div className="mb-4 flex justify-center group-hover/day:scale-110 transition-transform duration-500">
                      {getWeatherIcon(day.condition, 32)}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xl font-black text-brand-black">{day.high}°</span>
                      <span className="text-[10px] font-bold text-brand-gray">Low {day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Tips & Visa Section (NEW) */}
            {travelTip && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-emerald-500/10 backdrop-blur-md rounded-[2rem] p-6 border border-emerald-500/20">
                  <div className="flex items-center gap-3 text-emerald-600 mb-4">
                    <Globe className="text-emerald-500" size={24} />
                    <h3 className="font-black text-xs uppercase tracking-widest">Visa Requirements</h3>
                  </div>
                  <p className="text-emerald-700/80 text-xs font-bold leading-relaxed">
                    {travelTip.visaInfo}
                  </p>
                </div>

                <div className="bg-rose-500/10 backdrop-blur-md rounded-[2rem] p-6 border border-rose-500/20">
                  <div className="flex items-center gap-3 text-rose-600 mb-4">
                    <AlertTriangle className="text-rose-500" size={24} />
                    <h3 className="font-black text-xs uppercase tracking-widest">Safety Alerts</h3>
                  </div>
                  <p className="text-rose-700/80 text-xs font-bold leading-relaxed">
                    {travelTip.safetyAlerts}
                  </p>
                </div>

                <div className="bg-amber-500/10 backdrop-blur-md rounded-[2rem] p-6 border border-amber-500/20">
                  <div className="flex items-center gap-3 text-amber-600 mb-4">
                    <Info className="text-amber-500" size={24} />
                    <h3 className="font-black text-xs uppercase tracking-widest">Travel Tips</h3>
                  </div>
                  <p className="text-amber-700/80 text-xs font-bold leading-relaxed">
                    {travelTip.generalTips}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: SIDEBAR INFO */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right duration-700">
            
            {/* DESTINATIONS */}
            <div className="bg-brand-white rounded-[2.5rem] border border-brand-gray-light shadow-xl shadow-brand-blue/5 p-8">
              <h3 className="text-lg font-black text-brand-black tracking-tight mb-6">Search <span className="text-brand-blue">City.</span></h3>
              <div className="relative group mb-8">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within:text-brand-blue transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. Paris, France"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-14 pr-6 py-4 bg-brand-light border border-brand-gray-light rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/50 transition-all text-xs font-bold text-brand-black placeholder:text-brand-gray/50"
                />
              </div>

              <h3 className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                <Navigation size={12} className="text-brand-blue" />
                Popular Destinations
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {popularDestinations.map((dest, idx) => (
                  <button
                    key={dest}
                    onClick={() => setSelectedLocation(dest)}
                    className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border animate-slide-up ${
                      selectedLocation === dest 
                        ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20 scale-105' 
                        : 'bg-brand-light text-brand-gray border-transparent hover:bg-brand-gray-light hover:border-brand-gray-light hover:text-brand-black'
                    }`}
                    style={{ animationDelay: `${0.4 + (idx * 0.05)}s` }}
                  >
                    {dest.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* PACKING GUIDE */}
            <div className="bg-brand-blue rounded-[2.5rem] shadow-xl shadow-brand-blue/20 p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                  <Shirt size={24} />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-2">Packing Guide.</h3>
                <p className="text-white/80 font-bold text-xs mb-6 leading-relaxed">Expert suggestions based on today's local forecast.</p>
                
                <div className="space-y-3">
                  {[
                    { icon: <Umbrella size={16} />, text: 'Waterproof Gear' },
                    { icon: <Shirt size={16} />, text: 'Light Cotton Wear' },
                    { icon: <Waves size={16} />, text: 'Sunscreen SPF 50+' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest bg-white/10 p-3.5 rounded-xl border border-white/5 group/item hover:bg-white/20 transition-all">
                      <span className="text-white group-hover/item:scale-125 transition-transform">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>

                <button className="w-full mt-8 py-4 bg-white text-brand-blue rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-black hover:text-white transition-all active:scale-95 shadow-xl shadow-black/5">
                  Full Packing List
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* ADVENTURE ADVICE */}
            <div className="bg-brand-white border border-brand-gray-light rounded-[2.5rem] p-8 text-brand-black group shadow-xl shadow-brand-blue/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-brand-blue/10 border border-brand-blue/20 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                  <Compass size={20} />
                </div>
                <h3 className="text-base font-black uppercase tracking-tighter">Adventure Advice</h3>
              </div>
              <p className="text-brand-gray text-sm font-medium leading-relaxed mb-6 italic">
                "Perfect conditions for beach activities and water sports. Avoid long treks during peak afternoon hours."
              </p>
              <div className="flex items-center justify-between p-4 bg-brand-light rounded-xl border border-brand-gray-light group-hover:border-brand-blue/30 transition-colors">
                <span className="text-[9px] font-black text-brand-gray uppercase tracking-widest">Travel Safety</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  High <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
