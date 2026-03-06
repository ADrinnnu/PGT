import React, { useState } from 'react';
import { Building2, Mail, User, Lock, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = 'http://localhost:5072';

const Companies = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('tms_token');
      
      const response = await fetch(`${API_URL}/api/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create company');
      }

      setStatus({ type: 'success', message: 'Company and Admin created successfully!' });
      setFormData({
        companyName: '',
        contactEmail: '',
        adminName: '',
        adminEmail: '',
        adminPassword: ''
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Register New Company</h1>
        <p className="text-slate-500 mt-2">Create a new transit company and assign their primary administrator.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Company Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Company Name</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-slate-400">
                    <Building2 size={20} />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Company Contact Email</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-slate-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Company Admin Credentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Admin Full Name</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-slate-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="adminName"
                    required
                    value={formData.adminName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Admin Login Email</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-slate-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    name="adminEmail"
                    required
                    value={formData.adminEmail}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">Admin Temporary Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-slate-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    name="adminPassword"
                    required
                    value={formData.adminPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {status.message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {status.message}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><Plus size={20} /> Register Company</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Companies;