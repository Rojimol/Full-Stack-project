import { useState, useEffect } from 'react';
import { 
  Bell, Check, Trash2, Filter, Loader2, Plane, Hotel
} from 'lucide-react';
import { notificationAPI } from '../services/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      // Ensure we have an array
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.type === filter;
  });

  const getIcon = (type) => {
    switch(type) {
      case 'flight': return <Plane size={20} className="text-blue-500" />;
      case 'hotel': return <Hotel size={20} className="text-rose-500" />;
      default: return <Bell size={20} className="text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              Notifications
              <span className="bg-blue-100 text-blue-600 text-sm font-bold px-3 py-1 rounded-full">
                {notifications.filter(n => !n.isRead).length} New
              </span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Stay updated with your travel plans</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Check size={16} />
              Mark all read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {['all', 'unread', 'booking', 'alert'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={24} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No notifications yet</h3>
              <p className="text-slate-500">We'll notify you when something important happens.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`group bg-white p-5 rounded-2xl border transition-all hover:shadow-md flex gap-4 ${
                  notification.isRead ? 'border-slate-100 opacity-75' : 'border-blue-100 shadow-sm ring-1 ring-blue-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.isRead ? 'bg-slate-100' : 'bg-blue-50'
                }`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className={`font-bold mb-1 ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      <span className="text-xs font-bold text-slate-400">
                        {new Date(notification.date).toLocaleDateString(undefined, { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
