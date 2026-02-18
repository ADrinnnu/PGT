import React, { useState } from 'react';
import { Plus, Search, Calendar, Clock, MapPin, User, Truck, MoreVertical } from 'lucide-react';

const Schedule = () => {
  // Mock Data: Daily Trip Manifest
  const [trips] = useState([
    { 
      id: 101, 
      route: "Paniqui ⇄ Tarlac City", 
      time: "08:00 AM", 
      driver: "Cameron Williamson", 
      vehicle: "ABC-1234 (Van)", 
      status: "In Transit", 
      passengers: "14/14" 
    },
    { 
      id: 102, 
      route: "Capas ⇄ Bamban", 
      time: "08:30 AM", 
      driver: "Brooklyn Simmons", 
      vehicle: "TAR-8821 (Bus)", 
      status: "Boarding", 
      passengers: "32/45" 
    },
    { 
      id: 103, 
      route: "Camiling ⇄ Tarlac City", 
      time: "09:00 AM", 
      driver: "Leslie Alexander", 
      vehicle: "NLE-902 (Bus)", 
      status: "Scheduled", 
      passengers: "0/45" 
    },
    { 
      id: 104, 
      route: "Victoria ⇄ Pura", 
      time: "10:15 AM", 
      driver: "Ronald Richards", 
      vehicle: "XTY-552 (Jeep)", 
      status: "Delayed", 
      passengers: "0/22" 
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Boarding': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Scheduled': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Delayed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dispatch Schedule</h1>
          <p className="text-slate-500">Manage daily trips and vehicle assignments</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Calendar size={18} /> Today, Feb 16
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm font-medium">
            <Plus size={18} /> Create Trip
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search trip ID, driver, or route..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center gap-6 group">
            
            {/* Time & ID */}
            <div className="min-w-[100px]">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                <Clock size={18} className="text-emerald-600" />
                {trip.time}
              </div>
              <span className="text-xs font-mono text-slate-400">ID: #{trip.id}</span>
            </div>

            {/* Route Info */}
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg mb-1">{trip.route}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><User size={14}/> {trip.driver}</span>
                <span className="flex items-center gap-1.5"><Truck size={14}/> {trip.vehicle}</span>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
              <div className="text-right mr-4">
                <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Status</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(trip.status)}`}>
                  {trip.status}
                </span>
              </div>
              
              <div className="text-right mr-4 hidden sm:block">
                 <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Load</span>
                 <span className="font-mono font-bold text-slate-700">{trip.passengers}</span>
              </div>

              <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;