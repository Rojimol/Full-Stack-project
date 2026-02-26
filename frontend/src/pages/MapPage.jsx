import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Search, Navigation, Map as MapIcon, Hotel, Plane } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = () => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
};

const MapPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState([51.505, -0.09]); // Default: London
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=5`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        setSearchResults(data);
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleBookHere = (locationName) => {
    // Navigate to booking page with destination pre-filled
    navigate(`/booking?tab=hotels&dest=${encodeURIComponent(locationName)}`);
  };

  const FlyToLocation = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      map.flyTo(center, 13);
    }, [center, map]);
    return null;
  };

  return (
    <div className="pt-20 h-screen flex flex-col relative">
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
        <form onSubmit={handleSearch} className="relative shadow-lg rounded-full">
          <input
            type="text"
            placeholder="Search destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border-none outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 backdrop-blur-sm text-slate-900"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>

      <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="flex-1 w-full h-full z-0">
        <FlyToLocation center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup className="min-w-[200px]">
            <div className="p-2">
              <h3 className="font-bold text-lg mb-2">
                {searchResults.length > 0 ? searchResults[0].display_name.split(',')[0] : "Selected Location"}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {searchResults.length > 0 ? searchResults[0].display_name : "Current selection"}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleBookHere(searchResults.length > 0 ? searchResults[0].display_name.split(',')[0] : "London")}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Hotel size={14} /> Book Hotel
                </button>
                <button 
                  onClick={() => handleBookHere(searchResults.length > 0 ? searchResults[0].display_name.split(',')[0] : "London")}
                  className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Plane size={14} /> Flights
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
        <LocationMarker />
        <FlyToLocation center={position} />
      </MapContainer>
      
      <button 
        className="absolute bottom-8 right-8 z-[1000] bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => window.location.reload()} // Quick reset
        title="Reset Map"
      >
        <Navigation size={24} />
      </button>
    </div>
  );
};

export default MapPage;
