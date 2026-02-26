import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com';

const AMADEUS_KEY = 'EZClffjTQ9BoZd6nUpdYe59FaSjA5ADV';
const AMADEUS_SECRET = 'fJzOqBxX2VdonxV4';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const getAmadeusToken = async () => {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', AMADEUS_KEY);
    params.append('client_secret', AMADEUS_SECRET);
    const res = await axios.post(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, params);
    return res.data.access_token;
  } catch {
    console.error("Amadeus Auth Error");
    return null;
  }
};

const HOTELS_API_URL = 'https://api.hotels-api.com/v1/hotels';
const HOTELS_API_KEY = '24513a59892bbeacdf712c759dfcbb90f8f66590e26d2f5ee8222abf315958fc';

const hotelsApi = axios.create({
  baseURL: HOTELS_API_URL,
  headers: { 
    'Content-Type': 'application/json',
    'X-API-KEY': HOTELS_API_KEY
  },
});

const cityCache = new Map([
  ['MUMBAI', [{ name: 'MUMBAI', iataCode: 'BOM', country: 'India', city: 'Mumbai' }]],
  ['DELHI', [{ name: 'DELHI', iataCode: 'DEL', country: 'India', city: 'Delhi' }]],
  ['BANGALORE', [{ name: 'BANGALORE', iataCode: 'BLR', country: 'India', city: 'Bangalore' }]],
  ['CHENNAI', [{ name: 'CHENNAI', iataCode: 'MAA', country: 'India', city: 'Chennai' }]],
  ['HYDERABAD', [{ name: 'HYDERABAD', iataCode: 'HYD', country: 'India', city: 'Hyderabad' }]],
  ['KOLKATA', [{ name: 'KOLKATA', iataCode: 'CCU', country: 'India', city: 'Kolkata' }]],
  ['PUNE', [{ name: 'PUNE', iataCode: 'PNQ', country: 'India', city: 'Pune' }]],
  ['AHMEDABAD', [{ name: 'AHMEDABAD', iataCode: 'AMD', country: 'India', city: 'Ahmedabad' }]],
  ['JAIPUR', [{ name: 'JAIPUR', iataCode: 'JAI', country: 'India', city: 'Jaipur' }]],
  ['LUCKNOW', [{ name: 'LUCKNOW', iataCode: 'LKO', country: 'India', city: 'Lucknow' }]],
  ['GOA', [{ name: 'GOA', iataCode: 'GOI', country: 'India', city: 'Goa' }]],
  ['KOCHI', [{ name: 'KOCHI', iataCode: 'COK', country: 'India', city: 'Kochi' }]],
  ['THIRUVANANTHAPURAM', [{ name: 'THIRUVANANTHAPURAM', iataCode: 'TRV', country: 'India', city: 'Thiruvananthapuram' }]],
  ['LONDON', [{ name: 'LONDON', iataCode: 'LHR', country: 'United Kingdom', city: 'London' }]],
  ['PARIS', [{ name: 'PARIS', iataCode: 'CDG', country: 'France', city: 'Paris' }]],
  ['NEW YORK', [{ name: 'NEW YORK', iataCode: 'JFK', country: 'United States', city: 'New York' }]],
  ['DUBAI', [{ name: 'DUBAI', iataCode: 'DXB', country: 'United Arab Emirates', city: 'Dubai' }]],
  ['SINGAPORE', [{ name: 'SINGAPORE', iataCode: 'SIN', country: 'Singapore', city: 'Singapore' }]],
  ['TOKYO', [{ name: 'TOKYO', iataCode: 'HND', country: 'Japan', city: 'Tokyo' }]],
  ['SYDNEY', [{ name: 'SYDNEY', iataCode: 'SYD', country: 'Australia', city: 'Sydney' }]],
  ['BERLIN', [{ name: 'BERLIN', iataCode: 'BER', country: 'Germany', city: 'Berlin' }]],
  ['ROME', [{ name: 'ROME', iataCode: 'FCO', country: 'Italy', city: 'Rome' }]],
  ['BANGKOK', [{ name: 'BANGKOK', iataCode: 'BKK', country: 'Thailand', city: 'Bangkok' }]],
  ['BALI', [{ name: 'BALI', iataCode: 'DPS', country: 'Indonesia', city: 'Bali' }]],
  ['AMSTERDAM', [{ name: 'AMSTERDAM', iataCode: 'AMS', country: 'Netherlands', city: 'Amsterdam' }]],
  ['TORONTO', [{ name: 'TORONTO', iataCode: 'YYZ', country: 'Canada', city: 'Toronto' }]],
  ['BARCELONA', [{ name: 'BARCELONA', iataCode: 'BCN', country: 'Spain', city: 'Barcelona' }]],
  ['ISTANBUL', [{ name: 'ISTANBUL', iataCode: 'IST', country: 'Turkey', city: 'Istanbul' }]],
  ['MALDIVES', [{ name: 'MALE', iataCode: 'MLE', country: 'Maldives', city: 'Male' }]]
]);

export const bookingAPI = {
  // Existing search methods
  searchCities: async (keyword) => {
    if (!keyword || keyword.length < 2) return [];
    
    const cacheKey = keyword.toUpperCase();
    if (cityCache.has(cacheKey)) {
      return cityCache.get(cacheKey);
    }

    try {
      const token = await getAmadeusToken();
      
      // If no token, use fallback immediately
      if (!token) throw new Error("No token available");

      const res = await axios.get(`${AMADEUS_BASE_URL}/v1/reference-data/locations`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          subType: 'CITY,AIRPORT', 
          keyword: cacheKey,
          'page[limit]': 5
        }
      });

      const mapped = res.data.data.map(loc => ({
        name: loc.name,
        detailedName: loc.detailedName,
        iataCode: loc.iataCode,
        city: loc.address?.cityName,
        country: loc.address?.countryName
      }));

      cityCache.set(cacheKey, mapped);
      return mapped;
    } catch (err) {
      console.warn("City Search Error:", err.message);
      // Fallback for demo if API fails (400, 429, etc)
      for (let [key, value] of cityCache.entries()) {
        if (key.includes(cacheKey) || cacheKey.includes(key)) {
          return value;
        }
      }
      return [];
    }
  },

  getCityCode: async (cityName) => {
    const token = await getAmadeusToken();
    const res = await axios.get(`${AMADEUS_BASE_URL}/v1/reference-data/locations`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { subType: 'CITY', keyword: cityName.toUpperCase() }
    });
    return res.data.data[0]?.iataCode || null;
  },

  getFlights: async (originName, destName, date) => {
    try {
      const token = await getAmadeusToken();
      if (!token) throw new Error('Failed to get Amadeus token');
      const isIATA = (val) => /^[A-Z]{3}$/.test(val);
      const origin = isIATA(originName) ? originName : await bookingAPI.getCityCode(originName);
      const dest = isIATA(destName) ? destName : await bookingAPI.getCityCode(destName);
      if (!origin || !dest) throw new Error("City codes not found");

      return axios.get(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          originLocationCode: origin,
          destinationLocationCode: dest,
          departureDate: date || '2026-06-01',
          adults: 1,
          currencyCode: 'INR',
          max: 15
        }
      });
    } catch (err) {
      console.error('Flight search API error:', err);
      throw err;
    }
  },

  getHotels: async (cityName) => {
    try {
      const res = await hotelsApi.get('/search', {
        params: { city: cityName }
      });
      return res;
    } catch (err) {
      console.error("New Hotels API error:", err);
      throw err;
    }
  },

  // New CRUD methods for Booked Flights
  getAllBookedFlights: async () => {
    const local = JSON.parse(localStorage.getItem('bookedFlights') || '[]');
    try {
      const res = await api.get('/api/flights');
      const apiData = res.data || [];
      
      // Merge local and API data
      // We assume local items have string IDs (timestamps) and API items might have numeric IDs
      // To avoid duplicates if local items were successfully synced, we might need smarter logic.
      // For now, we'll just combine them.
      const combined = [...local, ...apiData];
      
      // Optional: Deduplicate by ID if needed
      const unique = Array.from(new Map(combined.map(item => [String(item.id), item])).values());
      
      return { data: unique };
    } catch (err) {
      return { data: local };
    }
  },
  getUserFlights: async (userId) => {
    const local = JSON.parse(localStorage.getItem('bookedFlights') || '[]');
    const localUserFlights = local.filter(f => String(f.userId) === String(userId));
    
    try {
      const res = await api.get(`/api/flights/user/${userId}`);
      const apiData = res.data || [];
      
      const combined = [...localUserFlights, ...apiData];
      const unique = Array.from(new Map(combined.map(item => [String(item.id), item])).values());
      
      return { data: unique };
    } catch (err) {
      return { data: localUserFlights };
    }
  },
  bookFlight: async (flightData) => {
    const newFlight = { ...flightData, id: Date.now().toString(), status: 'CONFIRMED' };
    
    try {
      const res = await api.post('/api/flights', flightData);
      const apiFlight = res.data;
      
      // Sync to Local Storage
      const flights = JSON.parse(localStorage.getItem('bookedFlights') || '[]');
      flights.push(apiFlight);
      localStorage.setItem('bookedFlights', JSON.stringify(flights));
      
      return { data: apiFlight };
    } catch (err) {
      // Fallback
      const flights = JSON.parse(localStorage.getItem('bookedFlights') || '[]');
      flights.push(newFlight);
      localStorage.setItem('bookedFlights', JSON.stringify(flights));
      return { data: newFlight };
    }
  },
  updateFlight: (id, flightData) => api.put(`/api/flights/${id}`, flightData),
  updateFlightStatus: (id, status) => api.put(`/api/flights/${id}/status`, { status }),
  cancelFlight: async (id) => {
    try {
      await api.delete(`/api/flights/${id}`);
      
      // Remove from Local Storage
      const flights = JSON.parse(localStorage.getItem('bookedFlights') || '[]');
      const updatedFlights = flights.filter(f => String(f.id) !== String(id));
      localStorage.setItem('bookedFlights', JSON.stringify(updatedFlights));
      
      return { data: { message: 'Flight cancelled' } };
    } catch (err) {
      const flights = JSON.parse(localStorage.getItem('bookedFlights') || '[]');
      const updatedFlights = flights.filter(f => String(f.id) !== String(id));
      localStorage.setItem('bookedFlights', JSON.stringify(updatedFlights));
      return { data: { message: 'Flight cancelled' } };
    }
  },

  // New CRUD methods for Booked Hotels
  getAllBookedHotels: async () => {
    const local = JSON.parse(localStorage.getItem('bookedHotels') || '[]');
    try {
      const res = await api.get('/api/hotels');
      const apiData = res.data || [];
      
      const combined = [...local, ...apiData];
      const unique = Array.from(new Map(combined.map(item => [String(item.id), item])).values());
      
      return { data: unique };
    } catch (err) {
      return { data: local };
    }
  },
  getUserHotels: async (userId) => {
    const local = JSON.parse(localStorage.getItem('bookedHotels') || '[]');
    const localUserHotels = local.filter(h => String(h.userId) === String(userId));
    
    try {
      const res = await api.get(`/api/hotels/user/${userId}`);
      const apiData = res.data || [];
      
      const combined = [...localUserHotels, ...apiData];
      const unique = Array.from(new Map(combined.map(item => [String(item.id), item])).values());
      
      return { data: unique };
    } catch (err) {
      return { data: localUserHotels };
    }
  },
  bookHotel: async (hotelData) => {
    const newHotel = { ...hotelData, id: Date.now().toString(), status: 'CONFIRMED' };
    
    try {
      const res = await api.post('/api/hotels', hotelData);
      const apiHotel = res.data;
      
      const hotels = JSON.parse(localStorage.getItem('bookedHotels') || '[]');
      hotels.push(apiHotel);
      localStorage.setItem('bookedHotels', JSON.stringify(hotels));
      
      return { data: apiHotel };
    } catch (err) {
      const hotels = JSON.parse(localStorage.getItem('bookedHotels') || '[]');
      hotels.push(newHotel);
      localStorage.setItem('bookedHotels', JSON.stringify(hotels));
      return { data: newHotel };
    }
  },
  updateHotel: (id, hotelData) => api.put(`/api/hotels/${id}`, hotelData),
  cancelHotel: async (id) => {
    try {
      await api.delete(`/api/hotels/${id}`);
      
      const hotels = JSON.parse(localStorage.getItem('bookedHotels') || '[]');
      const updatedHotels = hotels.filter(h => String(h.id) !== String(id));
      localStorage.setItem('bookedHotels', JSON.stringify(updatedHotels));
      
      return { data: { message: 'Hotel cancelled' } };
    } catch (err) {
      const hotels = JSON.parse(localStorage.getItem('bookedHotels') || '[]');
      const updatedHotels = hotels.filter(h => String(h.id) !== String(id));
      localStorage.setItem('bookedHotels', JSON.stringify(updatedHotels));
      return { data: { message: 'Hotel cancelled' } };
    }
  },

  // New CRUD methods for Booked Trains
  getAllBookedTrains: async () => {
    const local = JSON.parse(localStorage.getItem('bookedTrains') || '[]');
    try {
      const res = await api.get('/api/trains');
      const apiData = res.data || [];
      const combined = [...local, ...apiData];
      const unique = Array.from(new Map(combined.map(item => [String(item.id), item])).values());
      return { data: unique };
    } catch (err) {
      return { data: local };
    }
  },
  getUserTrains: async (userId) => {
    const local = JSON.parse(localStorage.getItem('bookedTrains') || '[]');
    const localUserTrains = local.filter(t => String(t.userId) === String(userId));
    try {
      const res = await api.get(`/api/trains/user/${userId}`);
      const apiData = res.data || [];
      const combined = [...localUserTrains, ...apiData];
      const unique = Array.from(new Map(combined.map(item => [String(item.id), item])).values());
      return { data: unique };
    } catch (err) {
      return { data: localUserTrains };
    }
  },
  bookTrain: async (trainData) => {
    const newTrain = { ...trainData, id: Date.now().toString(), status: 'CONFIRMED' };
    try {
      const res = await api.post('/api/trains', trainData);
      const apiTrain = res.data;
      const trains = JSON.parse(localStorage.getItem('bookedTrains') || '[]');
      trains.push(apiTrain);
      localStorage.setItem('bookedTrains', JSON.stringify(trains));
      return { data: apiTrain };
    } catch (err) {
      const trains = JSON.parse(localStorage.getItem('bookedTrains') || '[]');
      trains.push(newTrain);
      localStorage.setItem('bookedTrains', JSON.stringify(trains));
      return { data: newTrain };
    }
  },
  updateTrain: (id, trainData) => api.put(`/api/trains/${id}`, trainData),
  cancelTrain: async (id) => {
    try {
      await api.delete(`/api/trains/${id}`);
      const trains = JSON.parse(localStorage.getItem('bookedTrains') || '[]');
      const updatedTrains = trains.filter(t => String(t.id) !== String(id));
      localStorage.setItem('bookedTrains', JSON.stringify(updatedTrains));
      return { data: { message: 'Train cancelled' } };
    } catch (err) {
      const trains = JSON.parse(localStorage.getItem('bookedTrains') || '[]');
      const updatedTrains = trains.filter(t => String(t.id) !== String(id));
      localStorage.setItem('bookedTrains', JSON.stringify(updatedTrains));
      return { data: { message: 'Train cancelled' } };
    }
  },

  // New CRUD methods for Booked Buses
  getAllBookedBuses: async () => {
    const local = JSON.parse(localStorage.getItem('bookedBuses') || '[]');
    try {
      const res = await api.get('/api/buses');
      const apiData = res.data || [];
      const combined = [...local, ...apiData];
      const unique = Array.from(new Map(combined.map(item => [String(item.id), item])).values());
      return { data: unique };
    } catch (err) {
      return { data: local };
    }
  },
  getUserBuses: async (userId) => {
    const local = JSON.parse(localStorage.getItem('bookedBuses') || '[]');
    const localUserBuses = local.filter(b => String(b.userId) === String(userId));
    try {
      const res = await api.get(`/api/buses/user/${userId}`);
      const apiData = res.data || [];
      const combined = [...localUserBuses, ...apiData];
      const unique = Array.from(new Map(combined.map(item => [String(item.id), item])).values());
      return { data: unique };
    } catch (err) {
      return { data: localUserBuses };
    }
  },
  bookBus: async (busData) => {
    const newBus = { ...busData, id: Date.now().toString(), status: 'CONFIRMED' };
    try {
      const res = await api.post('/api/buses', busData);
      const apiBus = res.data;
      const buses = JSON.parse(localStorage.getItem('bookedBuses') || '[]');
      buses.push(apiBus);
      localStorage.setItem('bookedBuses', JSON.stringify(buses));
      return { data: apiBus };
    } catch (err) {
      const buses = JSON.parse(localStorage.getItem('bookedBuses') || '[]');
      buses.push(newBus);
      localStorage.setItem('bookedBuses', JSON.stringify(buses));
      return { data: newBus };
    }
  },
  updateBus: (id, busData) => api.put(`/api/buses/${id}`, busData),
  cancelBus: async (id) => {
    try {
      await api.delete(`/api/buses/${id}`);
      const buses = JSON.parse(localStorage.getItem('bookedBuses') || '[]');
      const updatedBuses = buses.filter(b => String(b.id) !== String(id));
      localStorage.setItem('bookedBuses', JSON.stringify(updatedBuses));
      return { data: { message: 'Bus cancelled' } };
    } catch (err) {
      const buses = JSON.parse(localStorage.getItem('bookedBuses') || '[]');
      const updatedBuses = buses.filter(b => String(b.id) !== String(id));
      localStorage.setItem('bookedBuses', JSON.stringify(updatedBuses));
      return { data: { message: 'Bus cancelled' } };
    }
  },
};

export const authAPI = {
  register: (userData) => api.post('/api/users/register', userData),
  login: (credentials) => api.post('/api/users/login', credentials),
  googleLogin: (token) => api.post('/api/users/google-login', { token }),
  sendOTP: (email) => api.post('/api/users/forgot-password/send-otp', { email }),
  verifyOTP: (email, otp) => api.post('/api/users/forgot-password/verify-otp', { email, otp }),
  resetPassword: (email, password) => api.post('/api/users/forgot-password/reset', { email, password }),
  getAllUsers: async () => {
    const local = JSON.parse(localStorage.getItem('users') || '[]');
    try {
      const res = await api.get('/api/users');
      const apiUsers = res.data || [];
      
      // Merge: favor API data but keep local-only users (if any, though users usually come from auth)
      // For simplicity, we'll just return API users if available, but maybe merge if we want to keep "mock" users in dev
      // A better approach for admin dashboard is to show everything.
      
      const allMap = new Map();
      local.forEach(u => allMap.set(String(u.id), u));
      apiUsers.forEach(u => allMap.set(String(u.id), u));
      
      const combined = Array.from(allMap.values());
      localStorage.setItem('users', JSON.stringify(combined));
      
      return { data: combined };
    } catch (err) {
      if (local.length === 0) {
         const mockUsers = [
          { id: '1', fullName: 'John Doe', email: 'john@example.com', role: 'USER', createdAt: '2025-01-15' },
          { id: '2', fullName: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN', createdAt: '2024-11-20' }
        ];
        localStorage.setItem('users', JSON.stringify(mockUsers));
        return { data: mockUsers };
      }
      return { data: local };
    }
  },
  getUser: (id) => api.get(`/api/users/${id}`),
  updateUser: async (id, userData) => {
    // 1. Try backend update
    try {
      await api.put(`/api/users/${id}`, userData);
    } catch (err) {
      console.warn("Backend update failed or not available:", err);
    }

    // 2. Update local storage
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(u => String(u.id) === String(id) ? { ...u, ...userData } : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      return { data: { ...userData, id } };
    } catch (e) {
      console.error("Local storage update failed", e);
      return { data: { ...userData, id } };
    }
  },
  deleteUser: async (id) => {
    // 1. Try backend delete
    try {
      await api.delete(`/api/users/${id}`);
    } catch (err) {
      console.warn("Backend delete failed or not available:", err);
    }

    // 2. Delete from local storage
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter(u => String(u.id) !== String(id));
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (e) {
      console.error("Local storage delete failed", e);
    }

    return { data: { message: 'User deleted' } };
  },
};

export const itineraryAPI = {
  getAll: async () => {
    // 1. Get Local Storage Data
    const localData = JSON.parse(localStorage.getItem('allItineraries') || '[]');
    
    try {
      // 2. Try API
      const res = await api.get('/api/itineraries');
      const apiData = res.data || [];
      
      // 3. Merge (prefer API data, but keep local-only data)
      const allMap = new Map();
      
      // Add local data first
      localData.forEach(item => allMap.set(String(item.id), item));
      
      // Overwrite/Add API data
      apiData.forEach(item => allMap.set(String(item.id), item));
      
      const merged = Array.from(allMap.values());
      
      // Update Local Storage with latest merged state (optional, but keeps sync)
      localStorage.setItem('allItineraries', JSON.stringify(merged));
      
      return { data: merged };
      
    } catch (error) {
      console.warn('API failed, using local storage for itineraries');
      
      if (localData.length === 0) {
        // Default community data
        const defaults = [
          { 
            id: '101', 
            title: 'Europe Backpacking', 
            destination: 'Paris, France', 
            startDate: '2026-07-10', 
            endDate: '2026-07-20', 
            description: 'Backpacking through France, Italy, and Spain.', 
            collaborators: [], 
            user: { id: 'admin', fullName: 'Community Admin' } 
          },
          { 
            id: '102', 
            title: 'Japan Tech Tour', 
            destination: 'Tokyo, Japan', 
            startDate: '2026-10-05', 
            endDate: '2026-10-15', 
            description: 'Exploring the latest tech and ancient traditions.', 
            collaborators: [], 
            user: { id: 'admin', fullName: 'Community Admin' } 
          }
        ];
        localStorage.setItem('allItineraries', JSON.stringify(defaults));
        return { data: defaults };
      }
      return { data: localData };
    }
  },
  getUserItineraries: async (userId) => {
    // Always merge for robustness
    const localData = JSON.parse(localStorage.getItem('allItineraries') || '[]');
    
    // Helper to filter
    const filterUserItems = (items) => items.filter(i => 
      String(i.user?.id) === String(userId) || 
      String(i.userId) === String(userId) ||
      i.collaborators?.some(c => String(c.id) === String(userId))
    );

    // Skip API for long numeric IDs (Google Auth)
    if (/^\d+$/.test(userId) && userId.length > 18) {
      return { data: filterUserItems(localData) };
    }

    try {
      const res = await api.get(`/api/itineraries/user/${userId}`);
      const apiData = res.data || [];
      
      // Merge
      const allMap = new Map();
      localData.forEach(item => allMap.set(String(item.id), item));
      apiData.forEach(item => allMap.set(String(item.id), item));
      
      const merged = Array.from(allMap.values());
      return { data: filterUserItems(merged) };
      
    } catch (error) {
      return { data: filterUserItems(localData) };
    }
  },
  create: async (data) => {
    const newItem = { 
      ...data, 
      id: Date.now().toString(), 
      collaborators: [],
      createdAt: new Date().toISOString() 
    };

    try {
      // Try API
      const res = await api.post('/api/itineraries', data);
      // Backend returns wrapped object: { success: true, itinerary: {...} }
      const apiItem = res.data.itinerary || res.data;
      
      // Sync to Local Storage
      const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
      all.unshift(apiItem);
      localStorage.setItem('allItineraries', JSON.stringify(all));
      
      return { data: apiItem };
    } catch (error) {
      // Fallback
      const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
      all.unshift(newItem);
      localStorage.setItem('allItineraries', JSON.stringify(all));
      return { data: newItem };
    }
  },
  update: async (id, data) => {
    try {
      const res = await api.put(`/api/itineraries/${id}`, data);
      // Backend returns wrapped object
      const updatedItem = res.data.itinerary || res.data;
      
      // Update Local Storage
      const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
      const index = all.findIndex(i => String(i.id) === String(id));
      if (index !== -1) {
        all[index] = { ...all[index], ...updatedItem };
        localStorage.setItem('allItineraries', JSON.stringify(all));
      }
      return { data: updatedItem };
    } catch (error) {
      const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
      const index = all.findIndex(i => String(i.id) === String(id));
      if (index !== -1) {
        all[index] = { ...all[index], ...data };
        localStorage.setItem('allItineraries', JSON.stringify(all));
        return { data: all[index] };
      }
      throw error;
    }
  },
  delete: async (id) => {
    try {
      await api.delete(`/api/itineraries/${id}`);
      // Remove from Local Storage
      const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
      const filtered = all.filter(i => String(i.id) !== String(id));
      localStorage.setItem('allItineraries', JSON.stringify(filtered));
      return { data: { message: 'Deleted' } };
    } catch (error) {
      const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
      const filtered = all.filter(i => String(i.id) !== String(id));
      localStorage.setItem('allItineraries', JSON.stringify(filtered));
      return { data: { message: 'Deleted' } };
    }
  },
  duplicate: async (id) => {
    try {
      const res = await api.post(`/api/itineraries/${id}/duplicate`);
      const duplicatedItem = res.data.itinerary || res.data;
      
      const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
      all.unshift(duplicatedItem);
      localStorage.setItem('allItineraries', JSON.stringify(all));
      return { data: duplicatedItem };
    } catch (error) {
       // Fallback: Duplicate locally
       const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
       const original = all.find(i => String(i.id) === String(id));
       if (original) {
         const copy = { 
           ...original, 
           id: Date.now().toString(), 
           title: `${original.title} (Copy)`,
           createdAt: new Date().toISOString()
         };
         all.unshift(copy);
         localStorage.setItem('allItineraries', JSON.stringify(all));
         return { data: copy };
       }
       throw error;
    }
  },
  addCollaborator: async (id, email) => {
    try {
      const res = await api.post(`/api/itineraries/${id}/collaborators`, { email });
      const updatedItem = res.data.itinerary || res.data;
      
      // Update Local Storage
      const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
      const index = all.findIndex(i => String(i.id) === String(id));
      if (index !== -1) {
        all[index] = updatedItem;
        localStorage.setItem('allItineraries', JSON.stringify(all));
      }
      return { data: updatedItem };
    } catch (error) {
      // Fallback
      const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
      const index = all.findIndex(i => String(i.id) === String(id));
      if (index !== -1) {
        // Mock add collaborator
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userToAdd = users.find(u => u.email === email) || { 
            id: 'guest-' + Date.now(), 
            email: email, 
            fullName: email.split('@')[0],
            role: 'USER' 
        };
        
        const itinerary = all[index];
        if (!itinerary.collaborators) itinerary.collaborators = [];
        
        // Check if already added
        if (!itinerary.collaborators.some(c => c.email === email)) {
             itinerary.collaborators.push(userToAdd);
             localStorage.setItem('allItineraries', JSON.stringify(all));
        }
        return { data: itinerary };
      }
      throw error;
    }
  },
  removeCollaborator: async (id, userId) => {
    try {
      const res = await api.delete(`/api/itineraries/${id}/collaborators/${userId}`);
      const updatedItem = res.data.itinerary || res.data;
      
      const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
      const index = all.findIndex(i => String(i.id) === String(id));
      if (index !== -1) {
        all[index] = updatedItem;
        localStorage.setItem('allItineraries', JSON.stringify(all));
      }
      return { data: updatedItem };
    } catch (error) {
      const all = JSON.parse(localStorage.getItem('allItineraries') || '[]');
      const index = all.findIndex(i => String(i.id) === String(id));
      if (index !== -1) {
        const itinerary = all[index];
        if (itinerary.collaborators) {
          itinerary.collaborators = itinerary.collaborators.filter(c => String(c.id) !== String(userId));
          localStorage.setItem('allItineraries', JSON.stringify(all));
        }
        return { data: itinerary };
      }
      throw error;
    }
  }
};

export const budgetAPI = {
  get: (userId) => {
    // Skip API for long numeric IDs
    if (/^\d+$/.test(userId) && userId.length > 18) {
      const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
      return Promise.resolve({ data: budgets[userId] || { total: 0, spent: 0, categories: {} } });
    }
    return api.get(`/api/budgets/${userId}`).catch(() => {
      const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
      return { data: budgets[userId] || { total: 0, spent: 0, categories: {} } };
    });
  },
  update: (userId, data) => {
    // Skip API for long numeric IDs
    if (/^\d+$/.test(userId) && userId.length > 18) {
      const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
      budgets[userId] = { ...budgets[userId], ...data };
      localStorage.setItem('budgets', JSON.stringify(budgets));
      return Promise.resolve({ data: budgets[userId] });
    }
    return api.put(`/api/budgets/${userId}`, data).catch(() => {
      const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
      budgets[userId] = { ...budgets[userId], ...data };
      localStorage.setItem('budgets', JSON.stringify(budgets));
      return { data: budgets[userId] };
    });
  },
};

export const recommendationAPI = {
  getRecommendations: (params) => api.get('/api/recommendations', { params }),
};

export const travelTipAPI = {
  getTip: (destination) => api.get(`/api/travel-tips/${destination}`),
};

export const notificationAPI = {
  getAll: async () => {
    const local = JSON.parse(localStorage.getItem('notifications') || '[]');
    try {
      const res = await api.get('/api/notifications');
      const apiData = res.data || [];
      const combined = [...local, ...apiData];
      const unique = Array.from(new Map(combined.map(item => [String(item.id), item])).values());
      return { data: unique };
    } catch (err) {
      if (local.length === 0) {
        const defaults = [
          { id: '1', title: 'Welcome to Travel Bridge!', message: 'Start planning your next adventure with friends.', type: 'alert', date: new Date().toISOString(), isRead: false },
          { id: '2', title: 'New Feature: Circles', message: 'Create travel circles to collaborate on trips.', type: 'alert', date: new Date(Date.now() - 86400000).toISOString(), isRead: true }
        ];
        localStorage.setItem('notifications', JSON.stringify(defaults));
        return { data: defaults };
      }
      return { data: local };
    }
  },
  create: async (data) => {
    const newItem = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
    try {
      const res = await api.post('/api/notifications', data);
      return res;
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('notifications') || '[]');
      local.unshift(newItem);
      localStorage.setItem('notifications', JSON.stringify(local));
      return { data: newItem };
    }
  },
  markAsRead: async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updated = local.map(n => n.id === id ? { ...n, isRead: true } : n);
      localStorage.setItem('notifications', JSON.stringify(updated));
    }
  },
  markAllRead: async () => {
    try {
      await api.put('/api/notifications/read-all');
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updated = local.map(n => ({ ...n, isRead: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
    }
  },
  delete: async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('notifications') || '[]');
      const filtered = local.filter(n => n.id !== id);
      localStorage.setItem('notifications', JSON.stringify(filtered));
    }
  },
  clearAll: async () => {
    try {
      await api.delete('/api/notifications');
    } catch (err) {
      localStorage.setItem('notifications', JSON.stringify([]));
    }
  },
};

export const messageAPI = {
  getMessages: async (itineraryId) => {
    const key = `messages_${itineraryId}`;
    const local = JSON.parse(localStorage.getItem(key) || '[]');
    return { data: local };
  },
  sendMessage: async (itineraryId, message) => {
    const key = `messages_${itineraryId}`;
    const local = JSON.parse(localStorage.getItem(key) || '[]');
    const newMessage = { ...message, id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    local.push(newMessage);
    localStorage.setItem(key, JSON.stringify(local));
    return { data: newMessage };
  }
};


const WEATHER_API_KEY = 'f1463ca485ba40c0a6d151350260902';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

export const weatherAPI = {
  getWeather: async (location) => {
    try {
      const res = await axios.get(`${WEATHER_API_URL}/current.json`, {
        params: {
          key: WEATHER_API_KEY,
          q: location,
          aqi: 'no'
        }
      });
      return res.data;
    } catch (err) {
      console.error("Weather API error:", err);
      return null;
    }
  },
};

export const hotelAPI = {
  getSurroundingHotels: async (hotelId) => {
    try {
      // Use the new API for surrounding hotels as well
      const res = await hotelsApi.get('/search', { params: { city: 'Madrid' } });
      const hotels = res.data.hotels || [];
      
      if (hotels.length > 0) {
        const mapped = hotels.map(h => ({
          hotel_id: String(h.id),
          name: h.name,
          address: h.address,
          city: h.city,
          distance: (Math.random() * 5).toFixed(1),
          price: h.price || 199,
          rating: h.rating
        }));
        
        if (hotelId) {
          const found = mapped.find(h => String(h.hotel_id) === String(hotelId));
          if (found) {
            return [found, ...mapped.filter(h => String(h.hotel_id) !== String(hotelId))];
          }
        }
        return mapped;
      }
    } catch (err) {
      console.error("Hotel search error, using fallback", err);
    }
    
    // Fallback mock data to prevent blank page
    const mockData = [
      { hotel_id: "1244451", name: "Grand Heritage Resort & Spa", address: "123 Avenue des Champs-Élysées, Paris, France", distance: "0.2", price: 299 },
      { hotel_id: "1244452", name: "Luxe Urban Suites", address: "45 Rue de Rivoli, Paris, France", distance: "1.1", price: 199 },
      { hotel_id: "1244453", name: "Riverside Boutique Hotel", address: "8 Quai de la Tournelle, Paris, France", distance: "2.4", price: 249 },
      { hotel_id: "1244454", name: "The Majestic Plaza", address: "15 Place Vendôme, Paris, France", distance: "3.7", price: 450 }
    ];

    if (hotelId) {
      const found = mockData.find(h => String(h.hotel_id) === String(hotelId));
      if (found) {
        return [found, ...mockData.filter(h => String(h.hotel_id) !== String(hotelId))];
      }
    }
    return mockData;
  }
};

export default api;