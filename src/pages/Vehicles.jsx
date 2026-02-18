import React, { useState } from 'react';
import { Plus, Search, Filter, Truck, Settings, Trash2, MoreVertical, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

const Vehicles = () => {
  // 1. MOCK DATA
  const [vehicles, setVehicles] = useState([
    { id: 101, plate: "ABC-1234", type: "Toyota HiAce (Van)", capacity: "14 Seats", status: "Active", driver: "Cameron W.", lastMaintenance: "Oct 20, 2023" },
    { id: 102, plate: "TAR-8821", type: "Hino Bus (Aircon)", capacity: "45 Seats", status: "In Transit", driver: "Brooklyn S.", lastMaintenance: "Sep 15, 2023" },
    { id: 103, plate: "XTY-552", type: "Modern Jeepney", capacity: "22 Seats", status: "Maintenance", driver: "N/A", lastMaintenance: "Nov 01, 2023" },
    { id: 104, plate: "NLE-902", type: "Yutong Bus", capacity: "49 Seats", status: "Active", driver: "Leslie A.", lastMaintenance: "Oct 05, 2023" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newVehicle, setNewVehicle] = useState({
    plate: "", type: "Toyota HiAce (Van)", capacity: "", status: "Active"
  });

  // 2. SEARCH LOGIC
  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. ADD VEHICLE LOGIC
  const handleAddVehicle = (e) => {
    e.preventDefault();
    const vehicleToAdd = {
      id: vehicles.length + 101,
      ...newVehicle,
      driver: "Unassigned", // Default
      lastMaintenance: "Just Now"
    };
    setVehicles([...vehicles, vehicleToAdd]);
    setIsModalOpen(false);
    setNewVehicle({ plate: "", type: "Toyota HiAce (Van)", capacity: "", status: "Active" });
  };

  // 4. DELETE LOGIC
  const handleDelete = (id) => {
    if (window.confirm("Remove this vehicle from the fleet?")) {
      setVehicles(vehicles.filter(v => v.id !== id));
    }
  };

  // Helper for Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Maintenance': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vehicle Fleet</h1>
          <p className="text-slate-500">Manage buses, vans, and maintenance schedules</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all shadow-sm font-medium"
        >
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search plate number or type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <button className="px-4 py-2 border border-slate-200 rounded-2xl flex items-center gap-2 hover:bg-slate-50 text-slate-600 font-medium">
          <Filter size={18} /> Filter Status
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Info</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plate No.</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Driver</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Truck size={20} />
                      </div>
                      <span className="font-semibold text-slate-700">{vehicle.type}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm text-slate-600 font-bold">{vehicle.plate}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{vehicle.capacity}</td>
                  <td className="p-4 text-sm text-slate-600">{vehicle.driver}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => handleDelete(vehicle.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                         <Trash2 size={18} />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                         <Settings size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD VEHICLE MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
        <form onSubmit={handleAddVehicle} className="space-y-4">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Plate Number</label>
            <input 
              type="text" 
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
              placeholder="ABC-1234"
              value={newVehicle.plate}
              onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Vehicle Type</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={newVehicle.type}
                onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
              >
                <option>Toyota HiAce (Van)</option>
                <option>Hino Bus (Aircon)</option>
                <option>Modern Jeepney</option>
                <option>Traditional Jeep</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Seating Capacity</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. 14 Seats"
                value={newVehicle.capacity}
                onChange={(e) => setNewVehicle({...newVehicle, capacity: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Initial Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="status" 
                  checked={newVehicle.status === 'Active'} 
                  onChange={() => setNewVehicle({...newVehicle, status: 'Active'})}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-600">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="status" 
                  checked={newVehicle.status === 'Maintenance'} 
                  onChange={() => setNewVehicle({...newVehicle, status: 'Maintenance'})}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-600">Maintenance</span>
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
              <Save size={18} /> Save Vehicle
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Vehicles;