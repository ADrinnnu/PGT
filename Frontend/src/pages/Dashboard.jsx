import React, { useState, useEffect } from 'react';
import { Truck, Users, Building, Activity } from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    totalCompanies: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const userStr = localStorage.getItem('tms_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isHeadAdmin = user?.role === 'HeadAdmin';

  useEffect(() => {
    const fetchStats = async () => {
      try {
    const response = await api.get(`/dashboard/stats?t=${new Date().getTime()}`); setStats(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 5000);
    return () => clearInterval(intervalId);

  }, []);

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-6 animate-fade-in-up">
      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${colorClass}`}>
        <Icon size={32} />
      </div>
      <div>
        <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">{title}</h3>
        <div className="text-4xl font-extrabold text-slate-800 mt-1 mb-1">{isLoading ? '-' : value}</div>
        <p className="text-sm text-slate-400 font-medium">{subtext}</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-slate-900">
          Welcome back, {user?.name || 'Admin'} 👋
        </h1>
        <p className="text-slate-500 mt-3 text-lg">
          Here is what is happening with your transit operations today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Fleet" 
          value={stats.totalVehicles} 
          subtext={`${stats.activeVehicles} currently active on road`}
          icon={Truck} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Total Personnel" 
          value={stats.totalDrivers} 
          subtext={`${stats.activeDrivers} active drivers`}
          icon={Users} 
          colorClass="bg-emerald-500" 
        />
        <StatCard 
          title="System Health" 
          value={stats.totalVehicles > 0 ? `${Math.round((stats.activeVehicles / stats.totalVehicles) * 100)}%` : '0%'} 
          subtext="Fleet active ratio"
          icon={Activity} 
          colorClass="bg-violet-500" 
        />
        {isHeadAdmin && (
          <StatCard 
            title="Registered Companies" 
            value={stats.totalCompanies} 
            subtext="Using the TMS platform"
            icon={Building} 
            colorClass="bg-amber-500" 
          />
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in-up">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/vehicles" className="p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors group flex items-center gap-4">
             <div className="h-10 w-10 bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-600 rounded-lg flex items-center justify-center text-slate-500 transition-colors">
               <Truck size={20} />
             </div>
             <span className="font-bold text-slate-700 group-hover:text-emerald-700">Register New Vehicle</span>
          </a>
          <a href="/drivers" className="p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors group flex items-center gap-4">
             <div className="h-10 w-10 bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-600 rounded-lg flex items-center justify-center text-slate-500 transition-colors">
               <Users size={20} />
             </div>
             <span className="font-bold text-slate-700 group-hover:text-emerald-700">Register New Driver</span>
          </a>
          {isHeadAdmin && (
            <a href="/companies" className="p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors group flex items-center gap-4">
               <div className="h-10 w-10 bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-600 rounded-lg flex items-center justify-center text-slate-500 transition-colors">
                 <Building size={20} />
               </div>
               <span className="font-bold text-slate-700 group-hover:text-emerald-700">Manage Companies</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;