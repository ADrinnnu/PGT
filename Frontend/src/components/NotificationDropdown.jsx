import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'warning': return <AlertCircle className="text-amber-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  const formatTime = (dateString) => {
    // Ensure the date is parsed as UTC if it doesn't already specify a timezone.
    const safeDateString = dateString.endsWith('Z') || dateString.includes('+') ? dateString : `${dateString}Z`;
    const date = new Date(safeDateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
        title="Notifications"
      >
         <Bell size={20} />
         {unreadCount > 0 && (
           <span className="absolute top-1.5 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
         )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-100 transition-colors flex gap-3 cursor-pointer ${!notif.isRead ? 'bg-emerald-50/50' : ''}`}>
                  <div className="mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">{formatTime(notif.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No new notifications.
              </div>
            )}
          </div>
          <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
            <button className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
              View All Activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
