import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageSquare, Plus, Calendar, 
  MapPin, Send, MoreVertical, Search,
  Share2, Settings, Trash2, Mail, 
  LayoutGrid, List as ListIcon,
  ChevronRight, Hash, Globe, Smile,
  ArrowLeft, UserPlus, DollarSign, PieChart, TrendingUp
} from 'lucide-react';
import { itineraryAPI, messageAPI } from '../services/api';
import { useToast } from '../components/Toast';

import { motion, AnimatePresence } from 'framer-motion';

const CollaborationPage = ({ user }) => {
  const { showToast } = useToast();
  const [itineraries, setItineraries] = useState([]);
  const [activeItinerary, setActiveItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // chat, members, details
  const [messages, setMessages] = useState([]); 
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', category: 'Food' });

  const [newGroup, setNewGroup] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const scrollRef = useRef(null);

  // Animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  useEffect(() => {
    if (user?.id) {
      fetchItineraries();
    }
  }, [user]);

  useEffect(() => {
    // Scroll to bottom of chat when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  useEffect(() => {
    let interval;
    if (activeItinerary?.id) {
      loadMessages(activeItinerary.id);
      // Poll for new messages every 3 seconds
      interval = setInterval(() => {
        loadMessages(activeItinerary.id);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeItinerary]);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const res = await itineraryAPI.getAll(); 
      setItineraries(res.data || []);
      
      if (res.data?.length > 0 && !activeItinerary) {
        setActiveItinerary(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch itineraries:', err);
      showToast('Failed to load community circles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (itineraryId) => {
    try {
      const res = await messageAPI.getMessages(itineraryId);
      setMessages(res.data || []);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newGroup.title?.trim()) {
      showToast('Please enter a circle title', 'error');
      return;
    }
    if (!newGroup.destination?.trim()) {
      showToast('Please enter a destination', 'error');
      return;
    }
    if (!newGroup.startDate || !newGroup.endDate) {
      showToast('Please select start and end dates', 'error');
      return;
    }
    
    // Ensure user exists
    const currentUser = user || { id: 'guest', fullName: 'Guest' };

    const payload = {
      ...newGroup,
      user: { id: currentUser.id, fullName: currentUser.fullName || 'User' },
      collaborators: [] // Initialize empty collaborators
    };

    try {
      const res = await itineraryAPI.create(payload);
      // Update local state immediately for better UX
      const newItem = res.data || payload; // Fallback to payload if API response is weird
      
      setItineraries(prev => [newItem, ...prev]);
      setActiveItinerary(newItem);
      
      setShowCreateModal(false);
      setNewGroup({ title: '', destination: '', startDate: '', endDate: '', description: '' });
      showToast('Travel circle created successfully!', 'success');
    } catch (err) {
      console.error('Failed to create itinerary:', err);
      showToast('Failed to create circle. Please try again.', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeItinerary) return;
    
    const msgPayload = {
      text: newMessage,
      user: user?.fullName || 'User',
      userId: user?.id,
      avatar: user?.avatar
    };

    // Optimistic Update
    const optimisticMsg = {
      ...msgPayload,
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, optimisticMsg]);
    setNewMessage('');

    try {
      await messageAPI.sendMessage(activeItinerary.id, msgPayload);
      // Background refresh to sync IDs or timestamps if needed
      loadMessages(activeItinerary.id);
    } catch (err) {
      console.error("Failed to send message", err);
      showToast('Failed to send message', 'error');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !activeItinerary) return;
    
    try {
      await itineraryAPI.addCollaborator(activeItinerary.id, inviteEmail);
      setInviteEmail('');
      showToast('Invitation sent successfully!', 'success');
      // Refresh to show new collaborator count if API returned it, otherwise manually update local state could be better but fetch is safer
      fetchItineraries();
    } catch (err) {
      console.error('Failed to invite:', err);
      showToast('Failed to send invitation', 'error');
    }
  };

  const filteredItineraries = itineraries.filter(it => 
    (it.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (it.destination || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoin = async () => {
    if (!user) return;
    try {
      const updatedCollaborators = [
        ...(activeItinerary.collaborators || []),
        { id: user.id, fullName: user.fullName || user.name || 'User', role: 'Member' }
      ];
      
      const updatedItinerary = {
        ...activeItinerary,
        collaborators: updatedCollaborators
      };

      await itineraryAPI.update(activeItinerary.id, updatedItinerary);
      setActiveItinerary(updatedItinerary);
      setItineraries(prev => prev.map(i => i.id === updatedItinerary.id ? updatedItinerary : i));
      showToast('Joined circle successfully!', 'success');
    } catch (err) {
      console.error("Failed to join circle", err);
      showToast('Failed to join circle', 'error');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount) return;
    
    try {
      const newExpense = {
        id: Date.now(),
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        user: user?.fullName || 'User',
        date: new Date().toLocaleDateString()
      };

      const updatedExpenses = [...(activeItinerary.expenses || []), newExpense];
      const updatedItinerary = { ...activeItinerary, expenses: updatedExpenses };
      
      await itineraryAPI.update(activeItinerary.id, updatedItinerary);
      setActiveItinerary(updatedItinerary);
      setItineraries(prev => prev.map(i => i.id === updatedItinerary.id ? updatedItinerary : i));
      
      setExpenseForm({ description: '', amount: '', category: 'Food' });
      showToast('Expense added successfully', 'success');
    } catch (err) {
      console.error("Failed to add expense", err);
      showToast('Failed to add expense', 'error');
    }
  };

  const isMember = activeItinerary?.collaborators?.some(c => c.id === user?.id) || activeItinerary?.user?.id === user?.id || activeItinerary?.userId === user?.id;

  return (
    <div className="flex h-screen bg-slate-50 pt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto md:h-[calc(100vh-120px)] min-h-[600px] flex flex-col md:flex-row gap-6">
        
        {/* LEFT SIDEBAR: GROUPS LIST */}
        <div className={`w-full md:w-80 lg:w-96 flex-col gap-4 ${showMobileDetails ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Sidebar Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Community</h1>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              title="Create New Circle"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search circles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          {/* Groups List */}
          <motion.div 
            className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
              ))
            ) : filteredItineraries.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Users size={48} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No circles found</p>
                <button onClick={() => setShowCreateModal(true)} className="text-blue-600 text-sm font-medium mt-2 hover:underline">Create one?</button>
              </div>
            ) : (
              filteredItineraries.map(it => {
                const isMemberOfGroup = it.collaborators?.some(c => c.id === user?.id) || it.user?.id === user?.id || it.userId === user?.id;
                
                return (
                <motion.button
                  variants={itemVariants}
                  key={it.id}
                  onClick={() => {
                    setActiveItinerary(it);
                    if (window.innerWidth < 768) {
                      setShowMobileDetails(true);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                    activeItinerary?.id === it.id
                      ? 'bg-white border-blue-500 ring-1 ring-blue-500 shadow-md'
                      : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold truncate pr-4 ${activeItinerary?.id === it.id ? 'text-blue-700' : 'text-slate-800'}`}>
                      {it.title}
                    </h3>
                    {activeItinerary?.id === it.id && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-3 gap-3">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {it.destination}</span>
                    {!isMemberOfGroup && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide">
                        Join
                      </span>
                    )}
                  </div>

                  <div className="flex -space-x-2 overflow-hidden py-1">
                     {/* Mock avatars for visual appeal if collaborators list is empty or just IDs */}
                     {[...Array(Math.min(3, (it.collaborators?.length || 1)))].map((_, i) => (
                       <img 
                         key={i}
                         src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${it.id}-${i}`}
                         alt="Avatar"
                         className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100"
                       />
                     ))}
                     {(it.collaborators?.length || 0) > 3 && (
                       <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 ring-2 ring-white">
                         +{it.collaborators.length - 3}
                       </div>
                     )}
                  </div>
                </motion.button>
              )})
            )}
          </motion.div>
        </div>

        {/* RIGHT CONTENT: ACTIVE GROUP DETAILS */}
        <div className={`flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex-col overflow-hidden relative ${!showMobileDetails ? 'hidden md:flex' : 'flex'}`}>
          {activeItinerary ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowMobileDetails(false)}
                      className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Hash size={24} className="text-gray-400" />
                      {activeItinerary.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 pl-8 md:pl-0">
                    <span className="flex items-center gap-1.5"><Globe size={14} /> {activeItinerary.destination}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {activeItinerary.startDate || 'TBD'} - {activeItinerary.endDate || 'TBD'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Chat
                  </button>
                  <button 
                    onClick={() => setActiveTab('members')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'members' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Members ({activeItinerary.collaborators?.length || 0})
                  </button>
                  <button 
                    onClick={() => setActiveTab('expenses')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'expenses' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Expenses
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-hidden relative bg-gray-50/30">
                
                {/* CHAT TAB */}
                {activeTab === 'chat' && (
                  <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
                      {messages.map((msg) => {
                        const isMe = msg.isMe || (user && msg.userId === user.id) || (user && msg.user === user.fullName);
                        return (
                          <div key={msg.id} className={`flex ${msg.isSystem ? 'justify-center' : isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                            {msg.isSystem ? (
                              <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">{msg.text}</span>
                            ) : (
                              <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                {!isMe && (
                                  <img 
                                    src={msg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.userId || msg.user}`} 
                                    alt={msg.user} 
                                    className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" 
                                  />
                                )}
                                <div>
                                  <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                                    {!isMe && <span className="text-xs font-bold text-slate-700">{msg.user}</span>}
                                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                                  </div>
                                  <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                                    isMe 
                                      ? 'bg-blue-600 text-white rounded-tr-none' 
                                      : 'bg-white border border-gray-100 text-slate-800 rounded-tl-none'
                                  }`}>
                                    {msg.text}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {messages.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                          <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                          <p className="text-sm">No messages yet. Start the conversation!</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Message Input */}
                    <div className="p-4 bg-white border-t border-gray-100">
                      {isMember ? (
                        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                          <button type="button" className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50">
                            <Smile size={20} />
                          </button>
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message #${(activeItinerary.title || 'group').toLowerCase().replace(/\s+/g, '-')}`}
                            className="flex-1 bg-gray-50 text-slate-900 placeholder-gray-400 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                          />
                          <button 
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-200"
                          >
                            <Send size={18} />
                          </button>
                        </form>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2">
                           <p className="text-gray-500 mb-2">Join this circle to start chatting with members</p>
                           <button 
                             onClick={handleJoin}
                             className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md"
                           >
                             Join Circle
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MEMBERS TAB */}
                {activeTab === 'members' && (
                  <div className="p-8 max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <UserPlus size={18} className="text-blue-600" />
                        Invite Collaborators
                      </h3>
                      <form onSubmit={handleInvite} className="flex gap-3">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="email" 
                            placeholder="Enter email address..." 
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                        <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors">
                          Invite
                        </button>
                      </form>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Members</h3>
                      {activeItinerary.collaborators?.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id || member.email}`} 
                              alt={member.fullName}
                              className="w-10 h-10 rounded-full bg-gray-100" 
                            />
                            <div>
                              <p className="font-bold text-slate-900">{member.fullName || member.email}</p>
                              <p className="text-xs text-gray-500">{member.role || 'Traveler'}</p>
                            </div>
                          </div>
                          {user.id !== member.id && (
                             <button className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                               <Trash2 size={16} />
                             </button>
                          )}
                        </div>
                      ))}
                      
                      {(!activeItinerary.collaborators || activeItinerary.collaborators.length === 0) && (
                        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p className="text-gray-500">No other members yet. Invite your friends!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* EXPENSES TAB */}
                {activeTab === 'expenses' && (
                  <div className="p-8 max-w-4xl mx-auto overflow-y-auto h-full pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {/* Summary Cards */}
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
                        <div className="flex items-center gap-3 mb-2 opacity-80">
                          <DollarSign size={20} />
                          <span className="text-sm font-bold uppercase tracking-wider">Total Spent</span>
                        </div>
                        <h3 className="text-3xl font-black">
                          ${(activeItinerary.expenses || []).reduce((acc, curr) => acc + Number(curr.amount), 0).toFixed(2)}
                        </h3>
                      </div>
                      
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                          <PieChart size={20} />
                          <span className="text-sm font-bold uppercase tracking-wider">Budget</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">$5,000.00</h3>
                        <p className="text-xs text-green-500 font-bold mt-1">On Track</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                          <TrendingUp size={20} />
                          <span className="text-sm font-bold uppercase tracking-wider">Top Category</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Food & Dining</h3>
                        <p className="text-xs text-gray-400 mt-1">45% of expenses</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Add Expense Form */}
                      <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
                          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Plus size={18} className="bg-slate-100 p-1 rounded-md box-content" />
                            Add Expense
                          </h3>
                          <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                              <input 
                                type="text"
                                value={expenseForm.description}
                                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="e.g. Dinner at Mario's"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount ($)</label>
                              <input 
                                type="number"
                                value={expenseForm.amount}
                                onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                              <select 
                                value={expenseForm.category}
                                onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              >
                                <option>Food</option>
                                <option>Transport</option>
                                <option>Accommodation</option>
                                <option>Activities</option>
                                <option>Shopping</option>
                                <option>Other</option>
                              </select>
                            </div>
                            <button 
                              type="submit"
                              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                            >
                              Add Expense
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Expenses List */}
                      <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Recent Transactions</h3>
                        {(activeItinerary.expenses || []).length === 0 ? (
                          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                              <DollarSign size={24} className="text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">No expenses recorded yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Start tracking your trip budget!</p>
                          </div>
                        ) : (
                          [...(activeItinerary.expenses || [])].reverse().map((expense) => (
                            <div key={expense.id} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  expense.category === 'Food' ? 'bg-orange-50 text-orange-500' :
                                  expense.category === 'Transport' ? 'bg-blue-50 text-blue-500' :
                                  expense.category === 'Accommodation' ? 'bg-purple-50 text-purple-500' :
                                  'bg-gray-50 text-gray-500'
                                }`}>
                                  {expense.category === 'Food' ? <PieChart size={20} /> :
                                   expense.category === 'Transport' ? <MapPin size={20} /> :
                                   <DollarSign size={20} />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900">{expense.description}</h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                    <span>{expense.user}</span>
                                    <span>•</span>
                                    <span>{expense.date}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block font-black text-slate-900 text-lg">-${expense.amount.toFixed(2)}</span>
                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{expense.category}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </>
          ) : (
            // EMPTY STATE
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                <Globe className="text-blue-500 w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome to Community</h2>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                Connect with fellow travelers, plan group expeditions, and share your adventures in real-time.
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Circle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">New Travel Circle</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <Users size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer in Paris"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={newGroup.title}
                  onChange={(e) => setNewGroup({...newGroup, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={newGroup.destination}
                    onChange={(e) => setNewGroup({...newGroup, destination: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={newGroup.startDate}
                    onChange={(e) => setNewGroup({...newGroup, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={newGroup.endDate}
                    onChange={(e) => setNewGroup({...newGroup, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationPage;
