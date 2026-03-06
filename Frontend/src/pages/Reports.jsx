import React, { useState } from 'react';
import { 
  Download, Printer, Filter, FileText, TrendingUp, Users, Map 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('revenue');

  // Mock Data: Revenue per Route
  const revenueData = [
    { name: 'Paniqui', revenue: 45000, trips: 120 },
    { name: 'Capas', revenue: 38000, trips: 98 },
    { name: 'Camiling', revenue: 52000, trips: 145 },
    { name: 'Victoria', revenue: 28000, trips: 80 },
    { name: 'Moncada', revenue: 31000, trips: 90 },
  ];

  // Mock Data: Recent Trip Logs
  const tripLogs = [
    { id: 101, date: "2023-10-25", route: "Tarlac - Paniqui", driver: "C. Williamson", status: "Completed", amount: "₱ 450" },
    { id: 102, date: "2023-10-25", route: "Tarlac - Capas", driver: "B. Simmons", status: "Completed", amount: "₱ 400" },
    { id: 103, date: "2023-10-26", route: "Victoria - Pura", driver: "R. Richards", status: "Cancelled", amount: "₱ 0" },
    { id: 104, date: "2023-10-26", route: "Camiling - Tarlac", driver: "L. Alexander", status: "Completed", amount: "₱ 600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Reports</h1>
          <p className="text-slate-500">Analytics, financial summaries, and operational logs</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Printer size={18} /> Print
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm font-medium">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('revenue')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === 'revenue' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <div className="flex items-center gap-2"><TrendingUp size={16}/> Revenue Analysis</div>
          {activeTab === 'revenue' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('trips')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === 'trips' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <div className="flex items-center gap-2"><Map size={16}/> Trip Logs</div>
          {activeTab === 'trips' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('drivers')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === 'drivers' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <div className="flex items-center gap-2"><Users size={16}/> Driver Performance</div>
          {activeTab === 'drivers' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></div>}
        </button>
      </div>

      {/* CONTENT: REVENUE TAB */}
      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Chart */}
           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6">Revenue by Route (This Month)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue (₱)" />
                    <Bar dataKey="trips" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Trips" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Summary Cards */}
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <h4 className="text-sm font-medium text-slate-500 mb-2">Highest Earning Route</h4>
                 <p className="text-2xl font-bold text-slate-800">Camiling - Tarlac</p>
                 <p className="text-sm text-emerald-600 mt-1">₱ 52,000.00</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <h4 className="text-sm font-medium text-slate-500 mb-2">Total Monthly Revenue</h4>
                 <p className="text-2xl font-bold text-slate-800">₱ 194,000.00</p>
                 <p className="text-sm text-emerald-600 mt-1">+12% vs last month</p>
              </div>
           </div>
        </div>
      )}

      {/* CONTENT: TRIP LOGS TAB */}
      {activeTab === 'trips' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                 <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Trip ID</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Route</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Driver</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {tripLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                       <td className="p-4 text-sm font-mono text-slate-600">#{log.id}</td>
                       <td className="p-4 text-sm text-slate-600">{log.date}</td>
                       <td className="p-4 text-sm font-medium text-slate-800">{log.route}</td>
                       <td className="p-4 text-sm text-slate-600">{log.driver}</td>
                       <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                             log.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                             {log.status}
                          </span>
                       </td>
                       <td className="p-4 text-sm font-bold text-slate-800 text-right">{log.amount}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default Reports;