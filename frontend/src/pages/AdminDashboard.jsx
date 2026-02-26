import { useEffect, useState } from 'react';
import { 
  Users, Plane, Hotel, Bell, LayoutDashboard, 
  LogOut, Search, Trash2, Edit2, Plus, X, Check,
  ChevronRight, Calendar, MapPin, Mail, Shield, Menu,
  Train, Bus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, bookingAPI, notificationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [users, setUsers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [trains, setTrains] = useState([]);
  const [buses, setBuses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'notification', 'edit_flight', 'edit_hotel', 'edit_train', 'edit_bus'
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, fRes, hRes, tRes, bRes, nRes] = await Promise.all([
        authAPI.getAllUsers(),
        bookingAPI.getAllBookedFlights(),
        bookingAPI.getAllBookedHotels(),
        bookingAPI.getAllBookedTrains(),
        bookingAPI.getAllBookedBuses(),
        notificationAPI.getAll()
      ]);
      setUsers(uRes.data || []);
      setFlights(fRes.data || []);
      setHotels(hRes.data || []);
      setTrains(tRes.data || []);
      setBuses(bRes.data || []);
      setNotifications(nRes.data || []);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // CRUD Operations
  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await authAPI.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
        showToast('User deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete user', 'error');
      }
    }
  };

  const handleDeleteFlight = async (id) => {
    if (window.confirm('Cancel this flight booking?')) {
      try {
        await bookingAPI.cancelFlight(id);
        setFlights(flights.filter(f => f.id !== id));
        showToast('Flight cancelled successfully', 'success');
      } catch (error) {
        showToast('Failed to cancel flight', 'error');
      }
    }
  };

  const handleDeleteHotel = async (id) => {
    if (window.confirm('Cancel this hotel booking?')) {
      try {
        await bookingAPI.cancelHotel(id);
        setHotels(hotels.filter(h => h.id !== id));
        showToast('Hotel booking cancelled successfully', 'success');
      } catch (error) {
        showToast('Failed to cancel hotel booking', 'error');
      }
    }
  };

  const handleDeleteTrain = async (id) => {
    if (window.confirm('Cancel this train booking?')) {
      try {
        await bookingAPI.cancelTrain(id);
        setTrains(trains.filter(t => t.id !== id));
        showToast('Train booking cancelled successfully', 'success');
      } catch (error) {
        showToast('Failed to cancel train booking', 'error');
      }
    }
  };

  const handleDeleteBus = async (id) => {
    if (window.confirm('Cancel this bus booking?')) {
      try {
        await bookingAPI.cancelBus(id);
        setBuses(buses.filter(b => b.id !== id));
        showToast('Bus booking cancelled successfully', 'success');
      } catch (error) {
        showToast('Failed to cancel bus booking', 'error');
      }
    }
  };

  const handleDeleteNotification = async (id) => {
    if (window.confirm('Delete this notification?')) {
      try {
        await notificationAPI.delete(id);
        setNotifications(notifications.filter(n => n.id !== id));
        showToast('Notification deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete notification', 'error');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'notification') {
        const res = await notificationAPI.create(formData);
        setNotifications([res.data, ...notifications]);
        showToast('Notification sent successfully', 'success');
      } else if (modalType === 'edit_flight') {
        const res = await bookingAPI.updateFlight(currentItem.id, formData);
        setFlights(flights.map(f => f.id === currentItem.id ? (res.data.flight || res.data) : f));
        showToast('Flight updated successfully', 'success');
      } else if (modalType === 'edit_hotel') {
        const res = await bookingAPI.updateHotel(currentItem.id, formData);
        setHotels(hotels.map(h => h.id === currentItem.id ? (res.data.hotel || res.data) : h));
        showToast('Hotel updated successfully', 'success');
      } else if (modalType === 'edit_train') {
        const res = await bookingAPI.updateTrain(currentItem.id, formData);
        setTrains(trains.map(t => t.id === currentItem.id ? (res.data.train || res.data) : t));
        showToast('Train updated successfully', 'success');
      } else if (modalType === 'edit_bus') {
        const res = await bookingAPI.updateBus(currentItem.id, formData);
        setBuses(buses.map(b => b.id === currentItem.id ? (res.data.bus || res.data) : b));
        showToast('Bus updated successfully', 'success');
      } else if (modalType === 'edit_user') {
        await authAPI.updateUser(currentItem.id, formData);
        setUsers(users.map(u => u.id === currentItem.id ? { ...u, ...formData } : u));
        showToast('User updated successfully', 'success');
      }
      setIsModalOpen(false);
      setFormData({});
      setCurrentItem(null);
    } catch (err) {
      console.error("Save failed", err);
      showToast('Operation failed', 'error');
    }
  };

  const openEditModal = (item, type) => {
    setCurrentItem(item);
    setModalType(type);
    setFormData(item);
    setIsModalOpen(true);
  };

  const openNotificationModal = () => {
    setModalType('notification');
    setFormData({
      title: '',
      message: '',
      type: 'info',
      isRead: false
    });
    setIsModalOpen(true);
  };

  // Render Helpers
  const renderSidebar = () => (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col shrink-0 transition-transform duration-300 ease-in-out 
        md:translate-x-0 md:static md:min-h-[calc(100vh-2rem)] md:rounded-r-2xl md:my-4 md:ml-4 shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-blue-500" />
            Admin<span className="text-blue-500">Panel</span>
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users size={20} />
            Users
          </button>
          <button 
            onClick={() => { setActiveTab('flights'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'flights' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Plane size={20} />
            Flight Bookings
          </button>
          <button 
            onClick={() => { setActiveTab('hotels'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'hotels' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Hotel size={20} />
            Hotel Bookings
          </button>
          <button 
            onClick={() => { setActiveTab('trains'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'trains' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Train size={20} />
            Train Bookings
          </button>
          <button 
            onClick={() => { setActiveTab('buses'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'buses' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Bus size={20} />
            Bus Bookings
          </button>
          <button 
            onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Bell size={20} />
            Notifications
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </>
  );

  const renderDashboard = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Users</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{users.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">Flight Bookings</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{flights.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Plane size={24} />
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">Hotel Bookings</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{hotels.length}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Hotel size={24} />
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">Train Bookings</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{trains.length}</h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Train size={24} />
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">Bus Bookings</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{buses.length}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Bus size={24} />
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Notifications</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{notifications.length}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Bell size={24} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderUsers = () => (
    <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <motion.tr 
                key={u.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {u.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{u.fullName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role || 'USER'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-600">Active</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEditModal(u, 'edit_user')} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  // Helper to resolve user details
  const getUserDetails = (booking) => {
    if (booking.user) return booking.user;
    if (booking.userId) {
      return users.find(u => String(u.id) === String(booking.userId)) || {};
    }
    return {};
  };

  const renderFlights = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Flight Bookings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Booking Ref</th>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Route</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {flights.map(f => {
              const bookingUser = getUserDetails(f);
              return (
              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-mono text-xs font-bold text-gray-600">{f.flightNumber || f.id}</div>
                  <div className="text-xs text-gray-400">{f.airline || 'Unknown Airline'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{bookingUser.fullName || 'Guest'}</div>
                  <div className="text-xs text-gray-500">{bookingUser.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    {f.origin || f.departureAirport || 'ORI'} <Plane size={12} className="text-gray-400" /> {f.destination || f.arrivalAirport || 'DES'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(f.departureTime || f.date || Date.now()).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${f.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {f.bookingStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEditModal(f, 'edit_flight')} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteFlight(f.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHotels = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Hotel Bookings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Hotel</th>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Location</th>
              <th className="px-6 py-4 text-left">Check-in</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {hotels.map(h => {
              const bookingUser = getUserDetails(h);
              return (
              <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-sm text-gray-900">{h.hotelName}</div>
                  <div className="text-xs text-gray-500">{h.roomCount} Rooms</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{bookingUser.fullName || 'Guest'}</div>
                  <div className="text-xs text-gray-500">{bookingUser.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{h.location}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(h.checkIn).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${h.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {h.bookingStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEditModal(h, 'edit_hotel')} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteHotel(h.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTrains = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Train Bookings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Train</th>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Route</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trains.map(t => {
              const bookingUser = getUserDetails(t);
              return (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-sm text-gray-900">{t.trainName || 'Express Train'}</div>
                  <div className="text-xs text-gray-500">{t.trainNumber || t.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{bookingUser.fullName || 'Guest'}</div>
                  <div className="text-xs text-gray-500">{bookingUser.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    {t.origin || 'ORI'} <ChevronRight size={12} className="text-gray-400" /> {t.destination || 'DES'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(t.date || Date.now()).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${t.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {t.bookingStatus || 'CONFIRMED'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEditModal(t, 'edit_train')} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteTrain(t.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBuses = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Bus Bookings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Bus Operator</th>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Route</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {buses.map(b => {
              const bookingUser = getUserDetails(b);
              return (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-sm text-gray-900">{b.busName || 'Luxury Bus'}</div>
                  <div className="text-xs text-gray-500">{b.busType || 'AC Sleeper'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{bookingUser.fullName || 'Guest'}</div>
                  <div className="text-xs text-gray-500">{bookingUser.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    {b.origin || 'ORI'} <ChevronRight size={12} className="text-gray-400" /> {b.destination || 'DES'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(b.date || Date.now()).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${b.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {b.bookingStatus || 'CONFIRMED'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEditModal(b, 'edit_bus')} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteBus(b.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Notification Center</h2>
        <button 
          onClick={openNotificationModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus size={16} />
          Send Notification
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {notifications.map(n => (
          <div key={n.id} className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-start">
            <div className="flex gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.type === 'alert' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                <Bell size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{n.title}</h4>
                <p className="text-gray-500 text-sm mt-1">{n.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                  {n.user && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">To: {n.user.email}</span>}
                </div>
              </div>
            </div>
            <button onClick={() => handleDeleteNotification(n.id)} className="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            No notifications found
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex md:gap-6 relative overflow-hidden">
      {renderSidebar()}
      
      <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-4 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 capitalize truncate max-w-[150px] sm:max-w-none">{activeTab.replace('_', ' ')}</h2>
              <p className="text-gray-500 text-sm hidden sm:block">Welcome back, Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shadow-sm border border-gray-200">
              <Bell size={20} className="text-gray-500" />
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
              A
            </div>
          </div>
        </header>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'flights' && renderFlights()}
              {activeTab === 'hotels' && renderHotels()}
              {activeTab === 'trains' && renderTrains()}
              {activeTab === 'buses' && renderBuses()}
              {activeTab === 'notifications' && renderNotifications()}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Generic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {modalType === 'notification' ? 'Send Notification' : 'Edit Record'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              {modalType === 'notification' ? (
                // Notification Form
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input 
                      type="text"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-32 resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                     <select 
                       className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                       value={formData.type}
                       onChange={(e) => setFormData({...formData, type: e.target.value})}
                     >
                       <option value="info">Info</option>
                       <option value="alert">Alert</option>
                       <option value="success">Success</option>
                     </select>
                  </div>
                </>
              ) : modalType === 'edit_user' ? (
                // Edit User Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={formData.fullName || ''}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={formData.role || 'USER'}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              ) : (
                // Edit form for Flight/Hotel (Simplified status update)
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
                  <select 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={formData.bookingStatus}
                    onChange={(e) => setFormData({...formData, bookingStatus: e.target.value})}
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              )}

              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;