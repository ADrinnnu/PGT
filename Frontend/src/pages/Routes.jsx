import React, { useState } from 'react';
import { Plus, Search, MapPin, Navigation, MoreVertical, Trash2, Edit, Save, ArrowRight } from 'lucide-react';
import Modal from '../components/Modal';

const RoutesPage = () => {
  // 1. MOCK DATA: Tarlac Routes
  const [routes, setRoutes] = useState([
    { id: 1, origin: "Tarlac City", destination: "Paniqui", distance: "22.5 km", fare: "₱ 45.00", status: "Active", vehicles: 12 },
    { id: 2, origin: "Tarlac City", destination: "Capas", distance: "18.2 km", fare: "₱ 35.00", status: "Active", vehicles: 8 },
    { id: 3, origin: "Victoria", destination: "Pura", distance: "14.0 km", fare: "₱ 25.00", status: "Under Repair", vehicles: 0 },
    { id: 4, origin: "Camiling", destination: "San Clemente", distance: "10.5 km", fare: "₱ 20.00", status: "Active", vehicles: 5 },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newRoute, setNewRoute] = useState({
    origin: "", destination: "", distance: "", fare: "", status: "Active"
  });

  const filteredRoutes = routes.filter(r => 
    r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. ADD ROUTE LOGIC
  const handleAddRoute = (e) => {
    e.preventDefault();
    const routeToAdd = {
      id: routes.length + 1,
      ...newRoute,
      vehicles: 0 // Start with 0 vehicles assigned
    };
    setRoutes([...routes, routeToAdd]);
    setIsModalOpen(false);
    setNewRoute({ origin: "", destination: "", distance: "", fare: "", status: "Active" });
  };

  // 4. DELETE LOGIC
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      setRoutes(routes.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Route Management</h1>
          <p className="text-slate-500">Set tariffs, distances, and operational paths</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all shadow-sm font-medium"
        >
          <Plus size={18} /> Add New Route
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search origin or destination..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Route Path</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Distance</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fare (Regular)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicles</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-700">
                          {route.origin} <ArrowRight size={14} className="text-slate-400"/> {route.destination}
                        </div>
                        <p className="text-xs text-slate-400">ID: R-{route.id.toString().padStart(3, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600">{route.distance}</td>
                  <td className="p-4 text-sm font-bold text-emerald-600">{route.fare}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      route.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Navigation size={14} className="text-slate-400" />
                      {route.vehicles} Active
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => handleDelete(route.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
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
        </div>
      </div>

      {/* --- ADD ROUTE MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Route">
        <form onSubmit={handleAddRoute} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Origin</label>
              <input 
                type="text" required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Tarlac City"
                value={newRoute.origin}
                onChange={(e) => setNewRoute({...newRoute, origin: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Destination</label>
              <input 
                type="text" required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Gerona"
                value={newRoute.destination}
                onChange={(e) => setNewRoute({...newRoute, destination: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Distance (km)</label>
              <input 
                type="text" required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. 15 km"
                value={newRoute.distance}
                onChange={(e) => setNewRoute({...newRoute, distance: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Base Fare (₱)</label>
              <input 
                type="text" required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. ₱ 25.00"
                value={newRoute.fare}
                onChange={(e) => setNewRoute({...newRoute, fare: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Route Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" name="r_status"
                  checked={newRoute.status === 'Active'} 
                  onChange={() => setNewRoute({...newRoute, status: 'Active'})}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-600">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" name="r_status"
                  checked={newRoute.status === 'Under Repair'} 
                  onChange={() => setNewRoute({...newRoute, status: 'Under Repair'})}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-slate-600">Under Repair / Inactive</span>
              </label>
            </div>
          </div>
          
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors flex justify-center items-center gap-2"
            >
              <Save size={18} /> Save Route
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default RoutesPage;