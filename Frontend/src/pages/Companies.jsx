import React, { useState, useEffect } from 'react';
import { Building2, Mail, User, Lock, Plus, AlertCircle, CheckCircle2, Pencil, Trash2, ArrowLeft, Key } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5072';

const Companies = () => {
  const [view, setView] = useState('list');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [view]);

  const fetchCompanies = async () => {
    setIsLoadingList(true);
    try {
      const token = localStorage.getItem('tms_token');
      const response = await fetch(`${API_URL}/api/companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleResetPassword = async (company) => {
    const newPassword = window.prompt(`Enter new temporary password for ${company.name} admin:`);
    if (!newPassword) return;
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    try {
      const token = localStorage.getItem('tms_token');
      const response = await fetch(`${API_URL}/api/auth/admin-reset-password/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        alert("Password updated successfully.");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const token = localStorage.getItem('tms_token');
      const response = await fetch(`${API_URL}/api/companies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCompanies(companies.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (company) => {
    setIsEditing(true);
    setEditId(company.id);
    setFormData({
      companyName: company.name,
      contactEmail: company.contactEmail,
      adminName: '',
      adminEmail: company.adminEmail || '',
      adminPassword: ''
    });
    setStatus({ type: '', message: '' });
    setView('form');
  };

  const handleAddNewClick = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ companyName: '', contactEmail: '', adminName: '', adminEmail: '', adminPassword: '' });
    setStatus({ type: '', message: '' });
    setView('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const token = localStorage.getItem('tms_token');
      const url = isEditing ? `${API_URL}/api/companies/${editId}` : `${API_URL}/api/companies`;
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing 
        ? { companyName: formData.companyName, contactEmail: formData.contactEmail, adminEmail: formData.adminEmail } 
        : formData;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Action failed");

      setStatus({ type: 'success', message: "Operation successful!" });
      setTimeout(() => setView('list'), 1500);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (view === 'list') {
    return (
      <div className="animate-fade-in-up space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Companies</h1>
            <p className="text-slate-500 mt-2">Manage transit cooperatives and their details.</p>
          </div>
          <button onClick={handleAddNewClick} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg flex items-center gap-2">
            <Plus size={20} /> Register New Company
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoadingList ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-bold text-slate-700">Company ID</th>
                    <th className="p-4 font-bold text-slate-700">Company Name</th>
                    <th className="p-4 font-bold text-slate-700">Contact & Login</th>
                    <th className="p-4 font-bold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-sm text-slate-500">#{company.id}</td>
                      <td className="p-4 font-bold text-slate-800">{company.name}</td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">
                           <span className="font-bold text-slate-400 text-xs">CONTACT: </span> 
                           {company.contactEmail}
                        </div>
                        <div className="text-emerald-700 font-bold text-sm mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded">
                           <span className="text-emerald-600/70 text-xs mr-1">LOGIN:</span> 
                           {company.adminEmail || "No Admin Assigned"}
                        </div>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button onClick={() => handleResetPassword(company)} className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg" title="Reset Admin Password">
                          <Key size={18} />
                        </button>
                        <button onClick={() => handleEditClick(company)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg" title="Edit Company">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(company.id, company.name)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg" title="Delete Company">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-2 font-medium">
            <ArrowLeft size={18} /> Back to Companies List
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900">{isEditing ? 'Edit Company' : 'Register Company'}</h1>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Company Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Company Name</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-slate-400"><Building2 size={20} /></div>
                  <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Company Contact Email</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-slate-400"><Mail size={20} /></div>
                  <input type="email" name="contactEmail" required value={formData.contactEmail} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Admin Credentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isEditing && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3.5 text-slate-400"><User size={20} /></div>
                    <input type="text" name="adminName" required={!isEditing} value={formData.adminName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
              )}
              
              <div className={`space-y-2 ${isEditing ? 'md:col-span-2' : ''}`}>
                <label className="text-sm font-bold text-slate-700">Admin Login Email</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-slate-400"><Mail size={20} /></div>
                  <input type="email" name="adminEmail" required value={formData.adminEmail} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                </div>
              </div>

              {!isEditing && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Temporary Password</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3.5 text-slate-400"><Lock size={20} /></div>
                    <input type="password" name="adminPassword" required={!isEditing} value={formData.adminPassword} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {status.message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {status.message}
            </div>
          )}
          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isLoading} className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 flex items-center gap-2">
              {isLoading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>{isEditing ? <CheckCircle2 size={20} /> : <Plus size={20} />} {isEditing ? 'Save Changes' : 'Register Company'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Companies;