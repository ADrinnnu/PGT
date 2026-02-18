import React, { useState } from 'react';
import { User, Lock, Building, Bell, Save, Camera } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Mock User Data
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@tms-tarlac.com",
    role: "Head Admin",
    company: "Tarlac Provincial Transport",
    bio: "Super Administrator for Tarlac Logistics Operations."
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User size={18} /> Edit Profile
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'security' ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lock size={18} /> Password & Security
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'company' ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building size={18} /> Company Info
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'notifications' ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bell size={18} /> Notifications
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 border-4 border-white shadow-sm">
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
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input type="text" defaultValue={user.name} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <input type="email" defaultValue={user.email} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Bio / Notes</label>
                  <textarea defaultValue={user.bio} rows="4" className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* COMPANY TAB */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Organization Details</h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Company Name</label>
                    <input type="text" defaultValue={user.company} readOnly className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" />
                    <p className="text-xs text-slate-400">Contact Head Admin to change company details.</p>
                 </div>
              </div>
            </div>
          )}

          {/* FOOTER ACTION */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-sm font-medium transition-all">
              <Save size={18} /> Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;