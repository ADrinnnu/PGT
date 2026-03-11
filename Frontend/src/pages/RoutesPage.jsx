import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Clock, Banknote, Trash2, Edit, Building, AlertCircle, CheckCircle2, Route as RouteIcon, Undo, X, Ruler, Filter } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const API_URL = 'http://localhost:5072';

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick([e.latlng.lat, e.latlng.lng]) });
  return null;
};

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [viewRoute, setViewRoute] = useState(null); 
  const [filterCompany, setFilterCompany] = useState('All');
  const [waypoints, setWaypoints] = useState([]); 
  const [routePath, setRoutePath] = useState([]); 
  const [isCalculating, setIsCalculating] = useState(false);
  
  const userStr = localStorage.getItem('tms_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isHeadAdmin = user?.role === 'HeadAdmin';

  const [formData, setFormData] = useState({
    origin: '', destination: '', estimatedMinutes: '', baseFare: '', companyId: '', distanceKm: 0, pricePerKm: 4
  });

  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem('tms_token');
      const response = await fetch(`${API_URL}/api/transitroutes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch routes');
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRoutes(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value) || 0;
    const newFare = (formData.distanceKm * newPrice).toFixed(2);
    setFormData({ ...formData, pricePerKm: newPrice, baseFare: newFare });
  };

  const handleMapClick = async (latlng) => {
    if (waypoints.length === 0) {
      setWaypoints([latlng]);
      setRoutePath([]);
      setFormData(prev => ({ ...prev, distanceKm: 0, estimatedMinutes: '', baseFare: '' }));
    } else if (waypoints.length === 1) {
      const newWaypoints = [...waypoints, latlng];
      setWaypoints(newWaypoints);
      await calculateRoadRoute(newWaypoints[0], latlng);
    } else {
      setWaypoints([latlng]);
      setRoutePath([]);
      setFormData(prev => ({ ...prev, distanceKm: 0, estimatedMinutes: '', baseFare: '' }));
    }
  };

  const calculateRoadRoute = async (start, end) => {
    setIsCalculating(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.code === 'Ok') {
        const roadCoordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoutePath(roadCoordinates);
        const minutes = Math.round(data.routes[0].duration / 60);
        const totalKm = (data.routes[0].distance / 1000).toFixed(1);
        const autoFare = (totalKm * formData.pricePerKm).toFixed(2);

        setFormData(prev => ({ 
          ...prev, 
          estimatedMinutes: minutes.toString(),
          distanceKm: parseFloat(totalKm),
          baseFare: autoFare
        }));
      }
    } catch (err) {
      console.error("Routing error:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const clearMap = () => {
    setWaypoints([]);
    setRoutePath([]);
    setFormData(prev => ({ ...prev, distanceKm: 0, estimatedMinutes: '', baseFare: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('tms_token');
      const payload = { 
        origin: formData.origin,
        destination: formData.destination,
        estimatedMinutes: parseInt(formData.estimatedMinutes, 10),
        baseFare: parseFloat(formData.baseFare),
        distanceKm: parseFloat(formData.distanceKm),
        routeCoordinates: JSON.stringify(routePath) 
      };
      
      if (isHeadAdmin && formData.companyId) {
          payload.companyId = parseInt(formData.companyId, 10);
      }

      const response = await fetch(`${API_URL}/api/transitroutes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to save route");

      setStatus({ type: 'success', message: 'Route configured successfully!' });
      setFormData({ origin: '', destination: '', estimatedMinutes: '', baseFare: '', companyId: '', distanceKm: 0, pricePerKm: 4 });
      clearMap(); 
      fetchRoutes(); 
      setTimeout(() => { setShowForm(false); setStatus({ type: '', message: '' }); }, 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueCompanies = ['All', ...new Set(routes.map(r => r.companyName).filter(Boolean))];
  const filteredRoutes = isHeadAdmin && filterCompany !== 'All' 
    ? routes.filter(r => r.companyName === filterCompany)
    : routes;

  const getSavedCoordinates = (jsonString) => {
    try { return JSON.parse(jsonString || "[]"); } 
    catch { return []; }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        const token = localStorage.getItem('tms_token');
        const response = await fetch(`${API_URL}/api/transitroutes/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete route');
        setRoutes(routes.filter(r => r.id !== id));
      } catch (error) {
        alert("Failed to delete route.");
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Route Management</h1>
          <p className="text-slate-500 mt-2">Map routes, calculate distances, and set custom pricing.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
          <Plus size={20} /> {showForm ? 'Cancel' : 'Add New Route'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 animate-fade-in-up">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-6">Draw Route Path</h2>
          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <p className="text-sm text-slate-500 font-medium">Click Origin, then click Destination to snap to roads.</p>
              <button type="button" onClick={clearMap} disabled={waypoints.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50 transition-colors">
                <Undo size={16} /> Reset Map
              </button>
            </div>
            <div className="h-96 w-full rounded-xl overflow-hidden border-2 border-slate-200 shadow-inner z-0 relative">
              {isCalculating && <div className="absolute inset-0 bg-white/60 z-[9999] flex items-center justify-center font-bold text-emerald-700 backdrop-blur-sm">Calculating Route & Distance...</div>}
              <MapContainer center={[15.480, 120.597]} zoom={11} className="h-full w-full" style={{ zIndex: 1 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler onMapClick={handleMapClick} />
                {waypoints.map((pos, idx) => <Marker key={idx} position={pos} icon={customIcon} />)}
                {routePath.length > 0 && <Polyline positions={routePath} color="#059669" weight={6} opacity={0.8} />}
              </MapContainer>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Origin Terminal Name</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input type="text" name="origin" required placeholder="e.g. Paniqui" value={formData.origin} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Destination Terminal Name</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input type="text" name="destination" required placeholder="e.g. Tarlac City" value={formData.destination} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              {isHeadAdmin && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Assign to Company (ID)</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input type="number" name="companyId" required value={formData.companyId} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Total Distance (KM)</label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-3.5 text-blue-500" size={20} />
                  <input type="text" readOnly value={`${formData.distanceKm} km`} className="w-full pl-10 pr-4 py-3 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-xl outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Price per KM (₱)</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input type="number" step="0.50" min="1" required value={formData.pricePerKm} onChange={handlePriceChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-700">Calculated Base Fare</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-3.5 text-emerald-500" size={20} />
                  <input type="number" name="baseFare" step="0.01" required value={formData.baseFare} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
            </div>
            {status.message && <div className={`p-4 rounded-xl flex items-center gap-3 font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{status.message}</div>}
            <div className="flex justify-end">
              <button type="submit" disabled={isSubmitting || routePath.length === 0} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50">Save Calculated Route</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">Available Routes</h2>
          <span className="text-sm text-slate-500 bg-slate-200 px-3 py-1 rounded-full font-bold">
            {filteredRoutes.length} {filteredRoutes.length === 1 ? 'route' : 'routes'}
          </span>
        </div>
        {isHeadAdmin && routes.length > 0 && (
          <div className="relative flex items-center">
            <Filter className="absolute left-3 text-emerald-600 pointer-events-none" size={16} />
            <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold text-slate-700 shadow-sm appearance-none cursor-pointer">
              {uniqueCompanies.map((company) => (
                <option key={company} value={company}>{company === 'All' ? 'View All Companies' : company}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading routes...</div>
        ) : filteredRoutes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">No routes match the selection.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-bold">ROUTE PATH</th>
                <th className="p-4 font-bold">DISTANCE</th>
                <th className="p-4 font-bold">FARE</th>
                {isHeadAdmin && <th className="p-4 font-bold">COMPANY</th>}
                <th className="p-4 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.map((route) => (
                <tr key={route.id} onClick={() => setViewRoute(route)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                      <RouteIcon size={20} />
                    </div>
                    <div>
                      <div>{route.origin} <span className="text-slate-400 mx-2">→</span> {route.destination}</div>
                      <div className="text-xs text-blue-500 font-medium mt-0.5 uppercase tracking-tighter">Click to view map</div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{route.distanceKm || "0"} km</td>
                  <td className="p-4 text-emerald-600 font-bold">₱ {route.baseFare.toFixed(2)}</td>
                  {isHeadAdmin && <td className="p-4 text-emerald-700 font-bold bg-emerald-50/50 uppercase tracking-tight">{route.companyName}</td>}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={(e) => handleDelete(route.id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                         <Trash2 size={18} />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                         <Edit size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewRoute && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Route Map Viewer</h3>
                <p className="text-slate-500 font-medium mt-1">{viewRoute.origin} to {viewRoute.destination} • {viewRoute.distanceKm} km</p>
              </div>
              <button onClick={() => setViewRoute(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="h-[500px] w-full bg-slate-100 relative z-0">
              {getSavedCoordinates(viewRoute.routeCoordinates).length > 0 ? (
                <MapContainer center={getSavedCoordinates(viewRoute.routeCoordinates)[0]} zoom={12} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={getSavedCoordinates(viewRoute.routeCoordinates)[0]} icon={customIcon} />
                  <Marker position={getSavedCoordinates(viewRoute.routeCoordinates)[getSavedCoordinates(viewRoute.routeCoordinates).length - 1]} icon={customIcon} />
                  <Polyline positions={getSavedCoordinates(viewRoute.routeCoordinates)} color="#059669" weight={6} opacity={0.8} />
                </MapContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 font-medium">No GPS data was saved for this older route.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;