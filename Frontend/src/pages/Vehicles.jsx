import React, { useState, useEffect } from 'react';
import { Plus, Truck, Hash, Users, Activity, Building, AlertCircle, CheckCircle2, Trash2, Edit, Filter } from 'lucide-react';
import api from '../api/axios';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [editingId, setEditingId] = useState(null);

  // Filter state
  const [filterCompany, setFilterCompany] = useState('All');

  const userStr = localStorage.getItem('tms_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isHeadAdmin = user?.role === 'HeadAdmin';

  const [formData, setFormData] = useState({
    plateNumber: '',
    model: '',
    capacity: '',
    status: 'Active',
    companyId: ''
  });

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = (vehicle) => {
    setEditingId(vehicle.id);
    setFormData({
      plateNumber: vehicle.plateNumber,
      model: vehicle.model,
      capacity: vehicle.capacity,
      status: vehicle.status,
      companyId: vehicle.companyId || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ plateNumber: '', model: '', capacity: '', status: 'Active', companyId: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = {
        plateNumber: formData.plateNumber,
        model: formData.model,
        capacity: parseInt(formData.capacity, 10),
        status: formData.status
      };

      if (isHeadAdmin) {
        payload.companyId = parseInt(formData.companyId, 10);
      }

      if (editingId) {
        await api.put(`/vehicles/${editingId}`, payload);
        setStatus({ type: 'success', message: 'Vehicle updated successfully!' });
      } else {
        await api.post('/vehicles', payload);
        setStatus({ type: 'success', message: 'Vehicle added successfully!' });
      }

      resetForm();
      fetchVehicles();
      
      setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 2000);

    } catch (err) {
      setStatus({ type: 'error', message: err?.response?.data?.message || 'Failed to save vehicle' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle? This cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/vehicles/${id}`);
      setStatus({ type: 'success', message: 'Vehicle deleted successfully!' });
      fetchVehicles(); 
      setTimeout(() => setStatus({ type: '', message: '' }), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err?.response?.data?.message || 'Failed to delete vehicle' });
    }
  };

  // Generate unique companies for the dropdown
  const uniqueCompanies = ['All', ...new Set(vehicles.map(v => v.companyName).filter(Boolean))];

  // Filter the vehicles list
  const filteredVehicles = isHeadAdmin && filterCompany !== 'All' 
    ? vehicles.filter(v => v.companyName === filterCompany)
    : vehicles;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Fleet Management</h1>
          <p className="text-slate-500 mt-2">Register and monitor your transit vehicles.</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={20} /> {showForm ? 'Cancel' : 'Add New Vehicle'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 animate-fade-in-up">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-6">
            {editingId ? 'Edit Vehicle Details' : 'Vehicle Registration'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Plate Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input type="text" name="plateNumber" required placeholder="e.g. ABC 1234" value={formData.plateNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Vehicle Model / Make</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input type="text" name="model" required placeholder="e.g. Toyota Coaster" value={formData.model} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Passenger Capacity</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input type="number" name="capacity" required min="1" placeholder="e.g. 24" value={formData.capacity} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Current Status</label>
                <div className="relative">
                  <Activity className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <select name="status" required value={formData.status} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                    <option value="Active">Active</option>
                    <option value="Maintenance">Under Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {isHeadAdmin && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Assign to Company (ID)</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input type="number" name="companyId" required value={formData.companyId} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              )}
            </div>

            {status.message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                {status.message}
              </div>
            )}

            <div className="flex justify-end">
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50">
                {isSubmitting ? 'Saving...' : editingId ? 'Update Vehicle' : 'Register Vehicle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {status.message && !showForm && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {status.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">Registered Vehicles</h2>
          <span className="text-sm text-slate-500 bg-slate-200 px-3 py-1 rounded-full font-bold">
            {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'}
          </span>
        </div>

        {/* Head Admin Filter Dropdown */}
        {isHeadAdmin && vehicles.length > 0 && (
          <div className="relative flex items-center">
            <Filter className="absolute left-3 text-emerald-600 pointer-events-none" size={16} />
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
            >
              {uniqueCompanies.map((company) => (
                <option key={company} value={company}>
                  {company === 'All' ? 'View All Companies' : company}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading fleet data...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">No vehicles found. Add your first vehicle above.</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">No vehicles found for this company.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-bold">VEHICLE INFO</th>
                <th className="p-4 font-bold">CAPACITY</th>
                <th className="p-4 font-bold">STATUS</th>
                {isHeadAdmin && <th className="p-4 font-bold">COMPANY</th>}
                <th className="p-4 font-bold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                      <Truck size={24} />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-800 text-lg uppercase">{vehicle.plateNumber}</div>
                      <div className="text-sm text-slate-500 font-medium">{vehicle.model}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <Users size={16} className="text-slate-400" />
                      {vehicle.capacity} Seats
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 font-bold text-xs rounded-full ${
                      vehicle.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 
                      vehicle.status === 'Maintenance' ? 'bg-amber-50 text-amber-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  {isHeadAdmin && <td className="p-4 text-emerald-700 font-bold bg-emerald-50/50">{vehicle.companyName}</td>}
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleUpdate(vehicle)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center mr-2"
                      title="Edit Vehicle"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                      title="Delete Vehicle"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Vehicles;