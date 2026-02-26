import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, Search, User, LogOut, Bell, 
  Menu, X, MapPin, Calendar, LayoutDashboard,
  Settings, Shield, CloudSun, Users, Briefcase, Globe
} from 'lucide-react';
import LoginModal from './AuthModal';
import RegisterModal from './AuthModal.jsx';

const Header = ({ isLoggedIn, user, onLogout, onLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Compass size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, private: true },
    { name: 'Bookings', path: '/booking', icon: <Briefcase size={18} />, private: true },
    { name: 'Groups', path: '/collaboration', icon: <Users size={18} />, private: true },
    { name: 'Map', path: '/map', icon: <MapPin size={18} />, private: false },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={18} />, private: true },
  ];

  // Add Admin link if user is admin
  if (isLoggedIn && user?.role === 'ADMIN') {
    navLinks.push({ name: 'Admin', path: '/admin', icon: <Shield size={18} />, private: true });
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 w-full ${
      isScrolled ? 'bg-brand-white/95 backdrop-blur-2xl border-b border-brand-gray-light py-2' : 'bg-transparent py-4'
    }`}>
      {/* Changed max-w-7xl to w-full and used px-8 for a wider feel */}
      <div className="w-full px-4 md:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <Globe className="text-brand-white w-5 h-5" />
              </div>
              <div className="absolute -inset-1 bg-brand-blue/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-lg font-black tracking-tighter text-brand-black group-hover:text-brand-blue transition-colors">
              TRAVEL<span className="text-brand-blue"> BRIDGE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { name: 'Explore', path: '/explore' },
              { name: 'Bookings', path: '/booking' },
              { name: 'Map', path: '/map' },
              { name: 'Community', path: '/collaboration' }
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-brand-gray hover:text-brand-blue transition-colors relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/notifications"
              className="relative p-2 text-brand-gray hover:text-brand-blue transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-blue rounded-full border-2 border-brand-white"></span>
            </Link>

            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-brand-gray hover:text-brand-blue transition-colors md:hidden"
            >
              <Menu size={20} />
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link 
                  to={user?.role === 'ADMIN' ? "/admin" : "/dashboard"}
                  className="hidden md:flex items-center gap-2 px-6 py-2 bg-brand-black text-brand-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-brand-black/10"
                >
                  {user?.role === 'ADMIN' ? <Shield size={14} /> : <User size={14} />}
                  {user?.role === 'ADMIN' ? 'Admin' : 'Dashboard'}
                </Link>
                <button 
                  onClick={handleLogoutClick}
                  className="hidden md:flex p-2 text-brand-gray hover:text-red-500 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="hidden md:flex items-center gap-2 px-6 py-2 bg-brand-blue text-brand-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-black transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-brand-blue/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-brand-white z-[200] transition-transform duration-500 md:hidden ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-12">
            <span className="text-lg font-black tracking-tighter text-brand-black">
              TRAVEL<span className="text-brand-blue">PLANNER</span>
            </span>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-brand-gray hover:text-brand-black"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-6">
            {[
              { name: 'Explore', path: '/' },
              { name: 'Bookings', path: '/booking' },
              { name: 'Map', path: '/map' },
              { name: 'Community', path: '/collaboration' },
              ...(isLoggedIn ? [
                { name: user?.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard', path: user?.role === 'ADMIN' ? '/admin' : '/dashboard' }
              ] : [])
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-black text-brand-black hover:text-brand-blue transition-colors"
              >
                {item.name}
              </Link>
            ))}
            {!isLoggedIn && (
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowLoginModal(true);
                }}
                className="text-2xl font-black text-brand-blue hover:text-brand-black transition-colors text-left"
              >
                Sign In
              </button>
            )}
            {isLoggedIn && (
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogoutClick();
                }}
                className="text-2xl font-black text-red-500 hover:text-red-600 transition-colors text-left"
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* MODALS */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onLoginSuccess={(userData) => {
            onLogin(userData);
            setShowLoginModal(false);
            // Small delay to ensure state updates propagate before navigation
            setTimeout(() => {
              if (userData.role === 'ADMIN') {
                navigate('/admin');
              } else {
                navigate('/dashboard');
              }
            }, 100);
          }}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}
      {showRegisterModal && (
        <RegisterModal 
          onClose={() => setShowRegisterModal(false)} 
          initialIsSignUp={true}
          onRegisterSuccess={(userData) => {
            onLogin(userData);
            setShowRegisterModal(false);
            setTimeout(() => {
              if (userData.role === 'ADMIN') {
                navigate('/admin');
              } else {
                navigate('/dashboard');
              }
            }, 100);
          }}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
      
    </header>
  );
};

export default Header;