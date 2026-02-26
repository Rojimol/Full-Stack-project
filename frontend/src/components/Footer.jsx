import { Link } from 'react-router-dom';
import { 
  Compass, Twitter, Instagram, Github, Mail, Globe
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: ['About Us', 'Careers', 'Press', 'Blog'],
    Support: ['Help Center', 'Safety Information', 'Cancellation Options', 'Privacy Policy'],
    Explore: ['Destinations', 'Flight Finder', 'Hotel Deals', 'Travel Insurance']
  };

  return (
    <footer className="bg-brand-white border-t border-brand-gray-light font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-blue/5 blur-[100px] rounded-full -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-blue/5 blur-[120px] rounded-full translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <Globe className="text-brand-white w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tighter text-brand-black">
                TRAVEL<span className="text-brand-blue"> BRIDGE</span>
              </span>
            </Link>
            <p className="text-brand-gray text-[11px] leading-relaxed max-w-xs font-medium uppercase tracking-wider">
              Experience the future of travel with curated itineraries and seamless bookings.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-brand-gray-light flex items-center justify-center text-brand-gray hover:bg-brand-blue hover:text-brand-white transition-all duration-300 transform hover:-translate-y-1">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-brand-black text-[10px] font-black uppercase tracking-[0.2em] mb-6">Explore</h4>
            <ul className="space-y-3">
              {['Destinations', 'Flight Search', 'Hotel Deals', 'Travel Guides'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-brand-gray text-[10px] font-bold uppercase tracking-widest hover:text-brand-blue transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-brand-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-brand-black text-[10px] font-black uppercase tracking-[0.2em] mb-6">Support</h4>
            <ul className="space-y-3">
              {['Help Center', 'Safety Information', 'Cancellation Options', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-brand-gray text-[10px] font-bold uppercase tracking-widest hover:text-brand-blue transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-brand-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-brand-black text-[10px] font-black uppercase tracking-[0.2em]">Newsletter</h4>
            <p className="text-brand-gray text-[10px] font-medium uppercase tracking-widest leading-relaxed">
              Get travel updates and exclusive offers.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-brand-gray-light border-none rounded-xl px-4 py-3 text-[10px] font-bold tracking-widest text-brand-black placeholder:text-brand-gray/50 focus:ring-2 focus:ring-brand-blue transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-brand-black text-brand-white px-4 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-brand-gray-light flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-brand-gray text-[9px] font-bold uppercase tracking-[0.2em]">
            © 2026 TRAVEL BRIDGE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-brand-gray text-[9px] font-bold uppercase tracking-[0.2em] hover:text-brand-black transition-colors">Privacy Policy</a>
            <a href="#" className="text-brand-gray text-[9px] font-bold uppercase tracking-[0.2em] hover:text-brand-black transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;