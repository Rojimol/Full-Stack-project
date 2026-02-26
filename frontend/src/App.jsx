import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';
import CollaborationPage from './pages/CollaborationPage';
import NotificationsPage from './pages/NotificationsPage';
import WeatherPage from './pages/WeatherPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import MapPage from './pages/MapPage';
import ExplorePage from './pages/ExplorePage';

const ConditionalFooter = () => {
  const location = useLocation();
  const hiddenPaths = ['/dashboard', '/admin', '/map'];
  return hiddenPaths.includes(location.pathname) ? null : <Footer />;
};

function App() {
  const initialUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('travelUser') || 'null');
    } catch {
      return null;
    }
  })();
  const [user, setUser] = useState(initialUser);
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialUser);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('travelUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('travelUser');
  };

  return (
    <GoogleOAuthProvider clientId="966569819409-1lte07n9fubbgi5ep1o1f05c9puh40u6.apps.googleusercontent.com">
      <ToastProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header 
              isLoggedIn={isLoggedIn} 
              user={user} 
              onLogout={handleLogout}
              onLogin={handleLogin}
            />
            <MainContent 
              isLoggedIn={isLoggedIn}
              user={user}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
            />
            <ConditionalFooter />
          </div>
        </Router>
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}

const MainContent = ({ isLoggedIn, user, handleLogin, handleLogout }) => {
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  return (
    <main className={`flex-grow relative z-0 ${isMapPage ? '' : 'pt-24'}`}>
      <Routes>
        <Route 
          path="/" 
          element={<Home onLogin={handleLogin} />} 
        />
        <Route 
          path="/explore" 
          element={<ExplorePage />} 
        />
        <Route 
          path="/map" 
          element={<MapPage />} 
        />
        <Route 
          path="/dashboard" 
          element={ 
            isLoggedIn ? (
              <DashboardPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={ 
            isLoggedIn && user?.role === 'ADMIN' ? (
              <AdminDashboard user={user} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/booking" 
          element={ 
            isLoggedIn ? (
              <BookingPage user={user} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/collaboration" 
          element={ 
            isLoggedIn ? (
              <CollaborationPage user={user} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/notifications" 
          element={ 
            isLoggedIn ? (
              <NotificationsPage user={user} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/weather" 
          element={ 
            isLoggedIn ? (
              <WeatherPage user={user} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/hotel/:id" 
          element={ 
            isLoggedIn ? (
              <HotelDetailsPage user={user} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/checkout" 
          element={ 
            isLoggedIn ? (
              <CheckoutPage user={user} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
      </Routes>
    </main>
  );
};

export default App;
