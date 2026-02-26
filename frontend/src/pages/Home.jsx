import { useState } from 'react';
import { 
  Plane, Hotel, Map, Phone, 
  CheckCircle2, ArrowRight, Globe, ShieldCheck, 
  Star, Users, Zap, Sparkles, MapPin, Mail, Calendar, Train, Bus
} from 'lucide-react';
import { motion } from 'framer-motion';
import LoginModal from '../components/AuthModal';
import RegisterModal from '../components/AuthModal';

const Home = ({ onLogin }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLoginSuccess = (userData) => {
    onLogin(userData);
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const features = [
    { title: 'Global Flights', desc: 'Access exclusive rates and the most efficient routes across 150+ airlines.', icon: <Plane className="w-6 h-6" /> },
    { title: 'Luxury Hotels', desc: 'Hand-picked premium accommodations with exclusive perks and upgrades.', icon: <Hotel className="w-6 h-6" /> },
    { title: 'Train Journeys', desc: 'Scenic rail routes connecting major cities with comfort and style.', icon: <Train className="w-6 h-6" /> },
    { title: 'Bus Connections', desc: 'Reliable ground transport for those hard-to-reach local gems.', icon: <Bus className="w-6 h-6" /> },
    { title: 'Personalized Itineraries', desc: 'Build personalized, minute-by-minute plans based on your interests and schedule.', icon: <Map className="w-6 h-6" /> },
    { title: 'Budget Tracking', desc: 'Automated expense logging and currency conversion to keep your trip on track.', icon: <Zap className="w-6 h-6" /> },
    { title: '24/7 Support', desc: 'Direct access to travel experts who can solve booking issues in real-time.', icon: <Phone className="w-6 h-6" /> },
    { title: 'Global Coverage', desc: 'From bustling metropolises to secluded beaches, we have you covered.', icon: <Globe className="w-6 h-6" /> },
  ];

  const destinations = [
    { name: 'Santorini, Greece', price: '$1,200', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=800', activities: '50+' },
    { name: 'Kyoto, Japan', price: '$1,800', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800', activities: '45+' },
    { name: 'Machu Picchu, Peru', price: '$1,500', image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=800', activities: '30+' },
    { name: 'Paris, France', price: '$1,650', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800', activities: '120+' },
    { name: 'New York, USA', price: '$1,400', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800', activities: '200+' },
    { name: 'Bali, Indonesia', price: '$950', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&q=80&w=800', activities: '80+' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      {/* Hero Section with Background Image */}
      <main className="relative">
      <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80" 
            alt="Travel Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 text-center lg:text-left"
            >
              

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 lg:mb-8 drop-shadow-lg">
                Travel planning, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">reimagined.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-300 max-w-lg leading-relaxed mx-auto lg:mx-0 mb-8 lg:mb-10 drop-shadow-md">
                Book flights, track budgets, and manage your entire itinerary in one beautiful dashboard. The premium way to explore the world.
              </p>
              
              <div className="flex flex-col sm:row gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRegisterModal(true)}
                  className="group px-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3"
                >
                  Get Started Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
               
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 border-t border-white/10 pt-8">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest">
                  <ShieldCheck size={18} className="text-blue-400" /> Secure
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest">
                  <Globe size={18} className="text-blue-400" /> Global
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest">
                  <Star size={18} className="text-blue-400" /> 4.9/5
                </div>
              </div>
            </motion.div>

            {/* Right Side: Sophisticated UI Visualization */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 w-full max-w-2xl perspective-1000"
            >
              <div className="relative transform lg:rotate-[-2deg] hover:rotate-0 transition-all duration-1000 ease-out">
                {/* Decorative Glows */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/30 to-indigo-500/30 rounded-[3rem] blur-2xl -z-10"></div>
                
                {/* Mock UI Frame */}
                <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-slate-900/50 aspect-[4/3] flex flex-col scale-90 sm:scale-100">
                  <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                    </div>
                    <div className="px-4 py-1.5 bg-slate-800 rounded-lg text-[10px] text-slate-400 font-medium tracking-wide">
                      travelbridge.io/dashboard
                    </div>
                    <div className="w-8"></div>
                  </div>
                  
                  <div className="flex-1 p-8 bg-slate-50/50">
                    <div className="h-6 w-40 bg-slate-200 rounded-full mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.15)" }}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer"
                      >
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                              <Plane className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full mb-2"></div>
                          <div className="h-2 w-2/3 bg-slate-50 rounded-full"></div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.15)" }}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer"
                      >
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                              <Hotel className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full mb-2"></div>
                          <div className="h-2 w-2/3 bg-slate-50 rounded-full"></div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.15)" }}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer"
                      >
                          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                              <Train className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full mb-2"></div>
                          <div className="h-2 w-2/3 bg-slate-50 rounded-full"></div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.15)" }}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer"
                      >
                          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
                              <Bus className="w-4 h-4 text-amber-600" />
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full mb-2"></div>
                          <div className="h-2 w-2/3 bg-slate-50 rounded-full"></div>
                      </motion.div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="h-3 w-32 bg-slate-200 rounded-full mb-4"></div>
                      <div className="space-y-3">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                          <div className="h-1.5 w-3/4 bg-slate-100 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Stat Card */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-white p-5 rounded-3xl shadow-xl border border-slate-100 hidden xl:block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">1.2s Booking</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fastest in market</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

        {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-blue-600 font-bold text-sm uppercase tracking-[0.25em] mb-4">The Platform</h2>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">Everything you need to travel with <br/><span className="text-slate-400">absolute confidence.</span></p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                key={index} 
                className="group p-8 rounded-[2.5rem] bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border border-transparent hover:border-slate-100 cursor-default"
              >
                <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-24 bg-[#FAFAFC]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-blue-600 font-bold text-sm uppercase tracking-[0.25em] mb-4">Trending Now</h2>
              <p className="text-4xl font-bold text-slate-900 tracking-tight">Popular Destinations</p>
            </div>
            <button className="text-blue-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              View all destinations <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((dest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative h-[400px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-blue-900/20"
              >
                <img 
                  src={dest.image} 
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{dest.name}</h3>
                      <div className="flex items-center gap-2 text-white/80">
                        <MapPin size={16} />
                        <span className="text-sm font-medium">{dest.activities} Activities</span>
                      </div>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white font-bold"
                    >
                      {dest.price}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-24 relative overflow-hidden text-center">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-8 backdrop-blur-sm border border-white/10">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Travel tips in your inbox</h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                Join our newsletter for exclusive deals, expert travel advice, and destination inspiration delivered weekly.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm transition-all"
                />
                <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50">
                  Subscribe
                </button>
              </form>
              <p className="mt-6 text-xs text-slate-500 uppercase tracking-widest">No spam, unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

        {/* Stats Section with Glassmorphism */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-900"></div>
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
              {[
                { val: '120k+', label: 'Active Users' },
                { val: '500+', label: 'Destinations' },
                { val: '99.9%', label: 'Success Rate' },
                { val: '24/7', label: 'Human Support' }
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-4xl font-bold text-white tracking-tighter">{stat.val}</p>
                  <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                        <Plane className="text-white w-7 h-7" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Travel<span className="text-blue-600"> Bridge</span></span>
                </div>
                <p className="max-w-md text-slate-400 text-sm leading-relaxed mb-12">
                    Helping modern explorers navigate the world with precision and style.
                </p>
               
               
            </div>
        </div>
      </footer>

      {/* Modal logic remains identical */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
          initialIsSignUp={false}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onRegisterSuccess={handleLoginSuccess}
          onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
          initialIsSignUp={true}
        />
      )}
    </div>
  );
};

export default Home;