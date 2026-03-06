import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Map, User as UserIcon, Truck, Clock, Building, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = 'http://localhost:5072';

const Schedule = () => {
  const [dispatches, setDispatches] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const userStr = localStorage.getItem('tms_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isHeadAdmin = user?.role === 'HeadAdmin';

  const [formData, setFormData] = useState({
    routeId: '',
    driverId: '',
    vehicleId: '',
    departureTime: '',
    companyId: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('tms_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [dispRes, routeRes, driverRes, vehRes] = await Promise.all([
        fetch(`${API_URL}/api/dispatch`, { headers }),
        fetch(`${API_URL}/api/transitroutes`, { headers }),
        fetch(`${API_URL}/api/drivers`, { headers }),
        fetch(`${API_URL}/api/vehicles`, { headers })
      ]);

      if (dispRes.ok) setDispatches(await dispRes.json());
      if (routeRes.ok) setRoutes(await routeRes.json());
      if (driverRes.ok) setDrivers(await driverRes.json());
      if (vehRes.ok) setVehicles(await vehRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('tms_token');
      const payload = {
        routeId: parseInt(formData.routeId),
        driverId: parseInt(formData.driverId),
        vehicleId: parseInt(formData.vehicleId),
        departureTime: new Date(formData.departureTime).toISOString(),
      };

      if (isHeadAdmin) {
        payload.companyId = parseInt(formData.companyId);
      }

      const response = await fetch(`${API_URL}/api/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create dispatch');

      setStatus({ type: 'success', message: 'Dispatch scheduled successfully!' });
      setFormData({ routeId: '', driverId: '', vehicleId: '', departureTime: '', companyId: '' });
      fetchData();
      
      setTimeout(() => {
        setShowForm(false);
        setStatus({ type: '', message: '' });
      }, 2000);

    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Dispatch & Scheduling</h1>
          <p className="text-slate-500 mt-2">Assign drivers and vehicles to transit routes.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={20} /> {showForm ? 'Cancel' : 'New Dispatch'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 animate-fade-in-up">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-6">Create Schedule</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Select Transit Route</label>
                <div className="relative">
                  <Map className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <select name="routeId" required value={formData.routeId} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                    <option value="">-- Choose Route --</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.origin} to {r.destination}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Assign Driver</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <select name="driverId" required value={formData.driverId} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                    <option value="">-- Choose Driver --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Assign Vehicle</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <select name="vehicleId" required value={formData.vehicleId} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                    <option value="">-- Choose Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.plateNumber} ({v.model})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Departure Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input type="datetime-local" name="departureTime" required value={formData.departureTime} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
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
                {isSubmitting ? 'Saving...' : 'Confirm Dispatch'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading dispatch schedule...</div>
        ) : dispatches.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">No active dispatches found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-bold">ROUTE</th>
                <th className="p-4 font-bold">DRIVER & VEHICLE</th>
                <th className="p-4 font-bold">DEPARTURE TIME</th>
                <th className="p-4 font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dispatches.map((dispatch) => (
                <tr key={dispatch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">
                    <div>{dispatch.routeOrigin} <span className="text-slate-400 mx-1">→</span> {dispatch.routeDestination}</div>
                    <div className="text-xs text-slate-400 font-normal mt-0.5">Route ID: {dispatch.routeId}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-700">{dispatch.driverName}</div>
                    <div className="text-sm text-slate-500">Plate: <span className="font-semibold">{dispatch.vehiclePlate}</span></div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-700 flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-500"/>
                      {formatDate(dispatch.departureTime)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full">
                      {dispatch.status}
                    </span>
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

export default Schedule;