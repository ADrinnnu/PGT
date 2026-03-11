import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, Search, Smartphone, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5072';

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [fareLogs, setFareLogs] = useState([]);
  const [commuters, setCommuters] = useState([]);
  const [stats, setStats] = useState({ todaysRevenue: 0, totalCredits: 0, activeCommuters: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('tms_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [walletsRes, logsRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/api/transactions/wallets`, { headers }),
          fetch(`${API_URL}/api/transactions/logs`, { headers }),
          fetch(`${API_URL}/api/transactions/stats`, { headers })
        ]);

        if (walletsRes.ok) setCommuters(await walletsRes.json());
        if (logsRes.ok) setFareLogs(await logsRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Transaction Monitoring</h1>
          <p className="text-slate-500 mt-2">Track app payments and commuter wallet balances</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'live' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Live Feed
          </button>
          <button 
            onClick={() => setActiveTab('wallets')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'wallets' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Commuter Wallets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ArrowUpRight size={24} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Today's Revenue</p><h3 className="text-2xl font-black text-slate-800">₱ {stats.todaysRevenue.toFixed(2)}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Wallet size={24} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Total User Credits</p><h3 className="text-2xl font-black text-slate-800">₱ {stats.totalCredits.toFixed(2)}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center"><Smartphone size={24} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Active Commuters</p><h3 className="text-2xl font-black text-slate-800">{stats.activeCommuters}</h3></div>
        </div>
      </div>

      {activeTab === 'live' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
           <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ArrowDownLeft size={20} className="text-red-500"/> Live Fare Deductions
              </h3>
              <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-1 rounded-full animate-pulse">Live</span>
           </div>
           <div className="flex-1 overflow-auto">
             {isLoading ? (
               <div className="p-12 text-center text-slate-500 font-medium">Loading transactions...</div>
             ) : fareLogs.length === 0 ? (
               <div className="p-12 text-center text-slate-500 font-medium">No transactions found.</div>
             ) : (
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Passenger</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Route</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Time</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {fareLogs.map((log) => (
                     <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                       <td className="p-4 flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><User size={14}/></div>
                         <span className="font-bold text-slate-700 text-sm">{log.passengerName}</span>
                       </td>
                       <td className="p-4 text-sm text-slate-600">{log.route}</td>
                       <td className="p-4 text-right">
                         <p className="font-bold text-red-600">- ₱ {log.amount.toFixed(2)}</p>
                         <p className="text-xs text-slate-400">Bal: ₱ {log.remainingBalance.toFixed(2)}</p>
                       </td>
                       <td className="p-4 text-xs font-mono text-slate-400 text-right">{formatTime(log.timestamp)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
           </div>
        </div>
      )}

      {activeTab === 'wallets' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" placeholder="Search commuter..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
             </div>
          </div>
          {isLoading ? (
             <div className="p-12 text-center text-slate-500 font-medium">Loading wallets...</div>
          ) : commuters.length === 0 ? (
             <div className="p-12 text-center text-slate-500 font-medium">No commuter wallets found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Commuter</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Balance</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commuters.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-bold text-slate-700">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-600">₱ {user.balance.toFixed(2)}</td>
                    <td className="p-4"><span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-bold">{user.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Transactions;