import React, { useState } from 'react';
import { Search, MapPin, Calendar, Star, ArrowRight, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Beach', 'Mountain', 'City', 'Cultural', 'Adventure'];

  const destinations = [
    {
      id: 1,
      name: 'Santorini',
      country: 'Greece',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=800',
      price: '$1,200',
      rating: 4.9,
      category: 'Beach'
    },
    {
      id: 2,
      name: 'Kyoto',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
      price: '$1,800',
      rating: 4.8,
      category: 'Cultural'
    },
    {
      id: 3,
      name: 'Machu Picchu',
      country: 'Peru',
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=800',
      price: '$1,500',
      rating: 4.9,
      category: 'Adventure'
    },
    {
      id: 4,
      name: 'Paris',
      country: 'France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
      price: '$1,650',
      rating: 4.7,
      category: 'City'
    },
    {
      id: 5,
      name: 'Bali',
      country: 'Indonesia',
      image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&q=80&w=800',
      price: '$950',
      rating: 4.8,
      category: 'Beach'
    },
    {
      id: 6,
      name: 'Swiss Alps',
      country: 'Switzerland',
      image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=800',
      price: '$2,100',
      rating: 5.0,
      category: 'Mountain'
    },
    {
      id: 7,
      name: 'New York',
      country: 'USA',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800',
      price: '$1,400',
      rating: 4.6,
      category: 'City'
    },
    {
      id: 8,
      name: 'Petra',
      country: 'Jordan',
      image: 'https://images.unsplash.com/photo-1579606038865-c70a84f33232?auto=format&fit=crop&q=80&w=800',
      price: '$1,300',
      rating: 4.8,
      category: 'Cultural'
    }
  ];

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dest.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || dest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Explore the World
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Discover breathtaking destinations, curated experiences, and hidden gems for your next adventure.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search destinations, countries..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredDestinations.map((dest, index) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={dest.image} 
                    alt={dest.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-slate-800">{dest.rating}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-6 pt-12">
                    <h3 className="text-xl font-bold text-white mb-1">{dest.name}</h3>
                    <div className="flex items-center gap-1 text-slate-300 text-sm">
                      <MapPin size={14} />
                      {dest.country}
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-md uppercase tracking-wider">
                      {dest.category}
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {dest.price}
                      <span className="text-xs font-normal text-slate-400 ml-1">/ person</span>
                    </span>
                  </div>
                  
                  <button className="w-full py-3 bg-slate-50 text-slate-900 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:gap-3">
                    View Details
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No destinations found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExplorePage;
