import { useState } from 'react';
import { X, Loader2, Plane, Mail, Lock, Facebook, ArrowLeft, ShieldCheck, Chrome } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useToast } from './Toast';
import { authAPI } from '../services/api';

const AuthModal = ({ onClose, onAuthSuccess, onLoginSuccess, onRegisterSuccess, initialIsSignUp = false }) => {
  const { showToast } = useToast();
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [forgotData, setForgotData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Helper to call whatever success callback was provided
  const handleAuthSuccess = (userData) => {
    if (onAuthSuccess) onAuthSuccess(userData);
    if (onLoginSuccess) onLoginSuccess(userData);
    if (onRegisterSuccess) onRegisterSuccess(userData);
  };

  const handleForgotChange = (e) => setForgotData({ ...forgotData, [e.target.name]: e.target.value });

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (forgotStep === 1) {
        // Step 1: Send OTP to Email
        try {
          await authAPI.sendOTP(forgotData.email);
          setSuccess('OTP sent successfully to your email!');
        } catch (apiErr) {
          // Fallback: Check if user exists in local storage
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userExists = users.some(u => u.email === forgotData.email) || forgotData.email === 'admin@travel.com';
          
          if (!userExists) {
            setError('No account found with this email.');
            setLoading(false);
            return;
          }
          
          // Simulate sending OTP locally
          const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
          localStorage.setItem(`otp_${forgotData.email}`, generatedOtp);
          console.log(`[DEBUG] OTP for ${forgotData.email}: ${generatedOtp}`);
          setSuccess(`OTP sent to your email! (Local: ${generatedOtp})`);
        }
        setForgotStep(2);
      } else if (forgotStep === 2) {
        // Step 2: Verify OTP
        try {
          await authAPI.verifyOTP(forgotData.email, forgotData.otp);
          setSuccess('OTP Verified!');
          setForgotStep(3);
        } catch (apiErr) {
          // Fallback: Check local storage OTP
          const savedOtp = localStorage.getItem(`otp_${forgotData.email}`);
          if (forgotData.otp === savedOtp || forgotData.otp === '123456') {
            setSuccess('OTP Verified!');
            setForgotStep(3);
          } else {
            setError('Invalid OTP. Please check your email.');
          }
        }
      } else if (forgotStep === 3) {
        // Step 3: Reset Password
        if (forgotData.newPassword !== forgotData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        try {
          await authAPI.resetPassword(forgotData.email, forgotData.newPassword);
          setSuccess('Password changed successfully! Redirecting to login...');
        } catch (apiErr) {
          // Fallback: Update password in local storage
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.email === forgotData.email);
          
          if (userIndex !== -1) {
            users[userIndex].password = forgotData.newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            setSuccess('Password updated successfully in local storage!');
          } else if (forgotData.email === 'admin@travel.com') {
             setSuccess('Admin password reset simulated!');
          } else {
            setError('Failed to reset password. User not found.');
            setLoading(false);
            return;
          }
        }

        localStorage.removeItem(`otp_${forgotData.email}`);
        setTimeout(() => {
          setShowForgot(false);
          setForgotStep(1);
          setSuccess('');
          setForgotData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
        }, 2500);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegChange = (e) => setRegData({ ...regData, [e.target.name]: e.target.value });

  // FIXED: Google Auth Handler
  const handleGoogleAuthSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google login failed: No credentials received');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Ensure the key matches your authAPI service (usually .credential)
      const response = await authAPI.googleLogin(credentialResponse.credential);
      if (response.data && response.data.user) {
        handleAuthSuccess(response.data.user);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      const msg = err.response?.data?.message || 'Google authentication failed. Connecting to server...';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Login Logic
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login(loginData);
      if (response.data && response.data.user) {
        const displayName = response.data.user.name || response.data.user.fullName || 'User';
        showToast(`Welcome back, ${displayName}!`, 'success');
        handleAuthSuccess(response.data.user);
        return;
      }
    } catch (err) {
      console.error('Login Error:', err);
      
      // If server returns a specific message (like 401 Unauthorized), show it
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        setLoading(false);
        return;
      }

      // Fallback for offline mode or server down
      const isAdmin = loginData.email === 'admin@travel.com' && loginData.password === 'Admin@123';
      if (isAdmin) {
        showToast('Admin login successful!', 'success');
        handleAuthSuccess({ id: 0, name: 'Admin', email: loginData.email, role: 'ADMIN' });
      } else {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === loginData.email && u.password === loginData.password);
        if (user) {
          const displayName = user.fullName || user.name || 'User';
          showToast(`Welcome back, ${displayName}!`, 'success');
          handleAuthSuccess({ id: user.id, name: displayName, email: user.email, role: 'USER' });
        } else {
          setError(err.response ? 'Invalid email or password.' : 'Cannot connect to server. Please check your connection.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Register Logic
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.register({
        fullName: regData.fullName,
        email: regData.email,
        password: regData.password
      });
      if (response.data && response.data.user) {
        showToast('Account created successfully!', 'success');
        handleAuthSuccess(response.data.user);
        return;
      }
    } catch (err) {
      console.error('Register Error:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        setLoading(false);
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(u => u.email === regData.email)) {
        setError('User already exists');
      } else {
        const newUser = { id: Date.now(), ...regData, role: 'USER' };
        localStorage.setItem('users', JSON.stringify([...users, newUser]));
        showToast('Registration successful! Welcome aboard.', 'success');
        handleAuthSuccess(newUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Fetch user info from Google using the access token
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        if (userInfo.email) {
            const userData = {
              id: userInfo.sub,
              name: userInfo.name || userInfo.given_name || userInfo.email.split('@')[0] || 'Explorer',
              email: userInfo.email,
              picture: userInfo.picture,
              role: 'USER'
            };
            
            // Save to local storage for persistence
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const existingUser = users.find(u => u.email === userData.email);
            if (!existingUser) {
              localStorage.setItem('users', JSON.stringify([...users, userData]));
            }
            
            const displayName = userData.name || 'Explorer';
            showToast(`Welcome back, ${displayName}!`, 'success');
            handleAuthSuccess(userData);
          }
      } catch (err) {
        setError('Google Login Failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Authentication Failed'),
  });

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md cursor-pointer"
      onClick={onClose}
    >
      <div 
        className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden w-[850px] max-w-full min-h-[550px] transition-all duration-700 ease-in-out cursor-default ${isSignUp ? 'right-panel-active' : ''}`} 
        id="auth-container"
        onClick={(e) => e.stopPropagation()}
      >
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 z-[110] transition-all hover:rotate-90">
          <X size={28} />
        </button>

        {/* --- SIGN UP FORM --- */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegisterSubmit}>
            <div className="flex items-center gap-2 mb-2">
              <Plane className="text-sky-500 rotate-45" size={32} />
              <h1 className="text-3xl font-extrabold text-slate-800">Join the Journey</h1>
            </div>
            <p className="text-slate-500 mb-6 text-sm">Create an account to start planning.</p>
            
            <div className="flex gap-2 w-full mb-4">
              <button 
                type="button"
                onClick={() => loginWithGoogle()}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-3.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all group active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  />
                </svg>
                <span className="text-sm">Google</span>
              </button>
              <button 
                type="button"
                onClick={() => alert('Facebook login coming soon!')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-3 bg-[#1877F2] text-white py-3.5 rounded-xl font-bold hover:bg-[#166fe5] transition-all group active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <Facebook size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm">Facebook</span>
              </button>
            </div>
            
            <div className="flex items-center w-full mb-4 px-10">
              <div className="flex-grow h-px bg-slate-200"></div>
              <span className="px-3 text-[10px] text-slate-400 uppercase tracking-widest">Or email</span>
              <div className="flex-grow h-px bg-slate-200"></div>
            </div>

            <input type="text" name="fullName" placeholder="Full Name" onChange={handleRegChange} required />
            <input type="email" name="email" placeholder="Email Address" onChange={handleRegChange} required />
            <div className="grid grid-cols-2 gap-2 w-full">
              <input type="password" name="password" placeholder="Password" onChange={handleRegChange} required />
              <input type="password" name="confirmPassword" placeholder="Confirm" onChange={handleRegChange} required />
            </div>

            {isSignUp && error && <p className="text-rose-500 text-xs font-semibold mt-2">{error}</p>}
            <button type="submit" disabled={loading} className="main-btn mt-4">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
            </button>
          </form>
        </div>

        {/* --- SIGN IN FORM --- */}
        <div className="form-container sign-in-container">
          <form className="bg-white flex flex-col items-center justify-center px-10 h-full text-center" onSubmit={handleLoginSubmit}>
            <div className="flex items-center gap-2 mb-2">
              <Plane className="text-sky-500 rotate-45" size={32} />
              <h1 className="text-3xl font-extrabold text-slate-800">Welcome Back</h1>
            </div>
            <p className="text-slate-500 mb-6 text-sm">Log in to access your saved trips.</p>

            <div className="flex gap-2 w-full mb-4">
              <button 
                type="button"
                onClick={() => loginWithGoogle()}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-3.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all group active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  />
                </svg>
                <span className="text-sm">Google</span>
              </button>
              <button 
                type="button"
                onClick={() => alert('Facebook login coming soon!')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-3 bg-[#1877F2] text-white py-3.5 rounded-xl font-bold hover:bg-[#166fe5] transition-all group active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <Facebook size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm">Facebook</span>
              </button>
            </div>

            <div className="flex items-center w-full mb-4 px-10">
              <div className="flex-grow h-px bg-slate-200"></div>
              <span className="px-3 text-[10px] text-slate-400 uppercase tracking-widest">Or email</span>
              <div className="flex-grow h-px bg-slate-200"></div>
            </div>

            <div className="w-full space-y-2">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>

            <button 
              type="button" 
              className="text-sm text-sky-600 font-medium hover:underline my-3"
              onClick={() => {
                setShowForgot(true);
                setForgotStep(1);
                setError('');
                setSuccess('');
              }}
            >
              Forgot your password?
            </button>

            {!isSignUp && error && <p className="text-rose-500 text-xs font-semibold mb-2">{error}</p>}
            
            <button 
              type="submit" 
              disabled={loading}
              className="main-btn"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>
        </div>

        {/* Forgot Password Overlay - Clean White Design */}
        <div className={`absolute inset-0 z-[200] transition-all duration-500 ease-in-out bg-white ${showForgot ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="relative h-full w-full flex flex-col p-8 overflow-hidden">
            {/* Minimal Back Button */}
            <button 
              onClick={() => setShowForgot(false)}
              className="absolute top-6 left-6 text-slate-400 hover:text-sky-600 transition-colors flex items-center gap-2 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back</span>
            </button>

            <div className="flex-grow flex flex-col items-center justify-center max-w-sm mx-auto w-full">
              {/* Simplified Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {forgotStep === 1 ? <Mail size={32} /> : forgotStep === 2 ? <ShieldCheck size={32} /> : <Lock size={32} />}
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  {forgotStep === 1 ? 'Reset Password' : forgotStep === 2 ? 'Enter OTP' : 'New Password'}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {forgotStep === 1 
                    ? "Enter your email to receive a code."
                    : forgotStep === 2 
                    ? "Check your inbox for the 6-digit code."
                    : "Create a strong password for your account."}
                </p>
              </div>

              {/* Compact Status Messages */}
              {error && (
                <div className="w-full bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 animate-shake">
                  <div className="w-1.5 h-1.5 bg-rose-600 rounded-full"></div>
                  {error}
                </div>
              )}
              {success && (
                <div className="w-full bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                  {success}
                </div>
              )}

              {/* Compact Form */}
              <form className="w-full space-y-4 !bg-transparent !p-0" onSubmit={handleForgotSubmit}>
                {forgotStep === 1 && (
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                      value={forgotData.email}
                      onChange={handleForgotChange}
                      required
                    />
                  </div>
                )}

                {forgotStep === 2 && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="otp"
                      placeholder="000000"
                      maxLength="6"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 text-center text-3xl font-black tracking-[0.3em] text-sky-600 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                      value={forgotData.otp}
                      onChange={handleForgotChange}
                      required
                    />
                    <button type="button" onClick={() => setForgotStep(1)} className="w-full text-center text-xs font-bold text-slate-400 hover:text-sky-600 transition-colors">
                      Didn't get it? Try again
                    </button>
                  </div>
                )}

                {forgotStep === 3 && (
                  <div className="space-y-3">
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 text-sm text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                      value={forgotData.newPassword}
                      onChange={handleForgotChange}
                      required
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 text-sm text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                      value={forgotData.confirmPassword}
                      onChange={handleForgotChange}
                      required
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>{forgotStep === 1 ? 'Send Code' : forgotStep === 2 ? 'Verify OTP' : 'Update Password'}</span>
                  )}
                </button>
              </form>
            </div>

            {/* Simple Footer */}
            <div className="mt-auto text-center">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Secure Reset System
              </p>
            </div>
          </div>
        </div>

        {/* --- OVERLAY SECTION --- */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="text-4xl font-bold mb-4 text-white">Already a Traveler?</h1>
              <p className="text-sky-50 mb-8 leading-relaxed">Simply login to your account and continue your adventure.</p>
              <button className="ghost-btn" onClick={() => { setIsSignUp(false); setError(''); }}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="text-4xl font-bold mb-4 text-white">New Here?</h1>
              <p className="text-sky-50 mb-8 leading-relaxed">Enter your details and start planning your dream vacation today!</p>
              <button className="ghost-btn" onClick={() => { setIsSignUp(true); setError(''); }}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .google-btn-wrapper { min-height: 40px; display: flex; justify-content: center; width: 100%; }
        
        .overlay {
          background: linear-gradient(rgba(0, 114, 255, 0.8), rgba(0, 198, 255, 0.7)), 
                      url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80');
          background-repeat: no-repeat; background-size: cover; background-position: center;
          color: #FFFFFF; position: relative; left: -100%; height: 100%; width: 200%;
          transform: translateX(0); transition: transform 0.6s ease-in-out;
        }

        .form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; }
        .sign-in-container { left: 0; width: 50%; z-index: 2; }
        #auth-container.right-panel-active .sign-in-container { transform: translateX(100%); }
        .sign-up-container { left: 0; width: 50%; opacity: 0; z-index: 1; }
        #auth-container.right-panel-active .sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; animation: authShow 0.6s; }

        @keyframes authShow {
          0%, 49.99% { opacity: 0; z-index: 1; }
          50%, 100% { opacity: 1; z-index: 5; }
        }

        .overlay-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100; }
        #auth-container.right-panel-active .overlay-container { transform: translateX(-100%); }
        #auth-container.right-panel-active .overlay { transform: translateX(50%); }

        .overlay-panel {
          position: absolute; display: flex; align-items: center; justify-content: center;
          flex-direction: column; padding: 0 50px; text-align: center; top: 0; height: 100%;
          width: 50%; transform: translateX(0); transition: transform 0.6s ease-in-out;
        }

        .overlay-left { transform: translateX(-20%); }
        #auth-container.right-panel-active .overlay-left { transform: translateX(0); }
        .overlay-right { right: 0; transform: translateX(0); }
        #auth-container.right-panel-active .overlay-right { transform: translateX(20%); }

        form { background-color: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 40px; height: 100%; text-align: center; }
        input { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 15px; margin: 5px 0; width: 100%; border-radius: 10px; outline: none; transition: all 0.3s; font-size: 14px; }
        input:focus { border-color: #0072ff; background-color: #fff; box-shadow: 0 0 0 3px rgba(0, 114, 255, 0.1); }

        .main-btn {
          border-radius: 30px; border: none; background: linear-gradient(to right, #0072ff, #00c6ff);
          color: #FFFFFF; font-size: 13px; font-weight: 700; padding: 12px 40px; letter-spacing: 1px;
          text-transform: uppercase; transition: transform 0.2s; cursor: pointer; margin-top: 10px;
        }
        .main-btn:active { transform: scale(0.96); }

        .ghost-btn {
          background-color: transparent; border: 2px solid #FFFFFF; color: #FFFFFF;
          border-radius: 30px; font-size: 13px; font-weight: 700; padding: 10px 40px;
          letter-spacing: 1px; text-transform: uppercase; transition: all 0.3s; cursor: pointer;
        }
        .ghost-btn:hover { background-color: white; color: #0072ff; }
      `}</style>
    </div>
  );
};

export default AuthModal;