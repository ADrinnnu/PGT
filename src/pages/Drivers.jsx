import React, { useState } from 'react';
import { Plus, Search, Filter, Phone, MapPin, Trash2, MoreVertical, Save, X } from 'lucide-react';
import Modal from '../components/Modal'; // Import the Modal we just made

const Drivers = () => {
  // 1. STATE: Manage our data and UI status
  const [drivers, setDrivers] = useState([
    { id: 1, name: "Cameron Williamson", license: "DL-98212", status: "Online", location: "Route 66", contact: "(205) 555-0100", avatar: "C" },
    { id: 2, name: "Brooklyn Simmons", license: "DL-11223", status: "On Trip", location: "Interstate 95", contact: "(219) 555-0114", avatar: "B" },
    { id: 3, name: "Leslie Alexander", license: "DL-55432", status: "Offline", location: "Depot", contact: "(603) 555-0123", avatar: "L" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State for New Driver
  const [newDriver, setNewDriver] = useState({
    name: "", license: "", contact: ""
  });

  // 2. LOGIC: Filter the list based on search
  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. LOGIC: Add a new driver
  const handleAddDriver = (e) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.license) return; // Simple validation

    const driverToAdd = {
      id: drivers.length + 1,
      ...newDriver,
      status: "Offline",
      location: "Depot",
      avatar: newDriver.name.charAt(0).toUpperCase()
    };

    setDrivers([...drivers, driverToAdd]); // Add to list
    setIsModalOpen(false); // Close modal
    setNewDriver({ name: "", license: "", contact: "" }); // Reset form
  };

  // 4. LOGIC: Delete a driver
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      setDrivers(drivers.filter(d => d.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Online': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'On Trip': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Driver Management</h1>
          <p className="text-slate-500">Manage your fleet workforce and schedules</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all shadow-sm font-medium"
        >
          <Plus size={18} /> Add New Driver
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, ID or license..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <button className="px-4 py-2 border border-slate-200 rounded-2xl flex items-center gap-2 hover:bg-slate-50 text-slate-600 font-medium">
          <Filter size={18} /> Filter Status
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Driver</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">License ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                          {driver.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{driver.name}</p>
                          <p className="text-xs text-slate-400">Joined 2023</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-sm">{driver.license}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(driver.status)}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" /> {driver.location}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" /> {driver.contact}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDelete(driver.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Driver"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No drivers found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD DRIVER MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Driver">
        <form onSubmit={handleAddDriver} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. Juan Dela Cruz"
              value={newDriver.name}
              onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">License ID</label>
              <input 
                type="text" 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="DL-XXXXX"
                value={newDriver.license}
                onChange={(e) => setNewDriver({...newDriver, license: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Contact Number</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="0912..."
                value={newDriver.contact}
                onChange={(e) => setNewDriver({...newDriver, contact: e.target.value})}
              />
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
              <Save size={18} /> Save Driver
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Drivers;