import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Building, Bell, Save, Camera, LogOut } from 'lucide-react';

const API_URL = 'http://localhost:5072';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const storedUser = JSON.parse(localStorage.getItem('tms_user')) || {};
  const [user, setUser] = useState({
    name: storedUser.name || "Admin User",
    email: storedUser.email || "admin@tms-tarlac.com",
    role: storedUser.role || "Head Admin",
    company: "Tarlac Provincial Transport",
    bio: "Super Administrator for Tarlac Logistics Operations."
  });

  const handleLogout = () => {
    localStorage.removeItem('tms_token');
    localStorage.removeItem('tms_user');
    navigate('/login');
  };

  const handleSave = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('tms_token');

    try {
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          bio: user.bio
        }),
      });

      if (response.ok) {
        const updatedUser = { ...storedUser, name: user.name, email: user.email };
        localStorage.setItem('tms_user', JSON.stringify(updatedUser));
        alert("Profile updated successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update profile.");
      }
    } catch (error) {
      alert("Network error. Please check your backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm border border-slate-100'
            }`}
          >
            <User size={18} /> Edit Profile
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'security' ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm border border-slate-100'
            }`}
          >
            <Lock size={18} /> Password & Security
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'company' ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm border border-slate-100'
            }`}
          >
            <Building size={18} /> Company Info
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'notifications' ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm border border-slate-100'
            }`}
          >
            <Bell size={18} /> Notifications
          </button>

          <div className="my-4 border-t border-slate-100"></div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut size={18} /> Log Out System
          </button>
        </div>

        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-500 border-4 border-white shadow-md">
                    {user.name.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shadow-sm">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
                  <p className="text-slate-500">{user.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <input 
                    type="text" 
                    value={user.name} 
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Bio / Notes</label>
                  <textarea 
                    value={user.bio} 
                    onChange={(e) => setUser({...user, bio: e.target.value})}
                    rows="4" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in-up">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-6 animate-fade-in-up">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Organization Details</h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Company Name</label>
                    <input type="text" value={user.company} readOnly className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed" />
                    <p className="text-xs text-slate-400">Restricted: Contact Head Admin to modify organization settings.</p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fade-in-up">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <NotificationToggle label="Email Alerts for New Trips" defaultChecked={true} />
                <NotificationToggle label="Browser Push Notifications" defaultChecked={true} />
                <NotificationToggle label="Driver Arrival Notifications" defaultChecked={false} />
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-200 font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationToggle = ({ label, defaultChecked }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
    </label>
  </div>
);

export default Settings;