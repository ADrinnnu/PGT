import React from 'react';
import { StatCard } from '../components/StatCard';
import { 
  DollarSign, TrendingUp, Package, Truck, CheckCircle, Users 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Mock Data for Charts
const trafficData = [
  { name: 'Mon', visits: 4000, unique: 2400 },
  { name: 'Tue', visits: 3000, unique: 1398 },
  { name: 'Wed', visits: 2000, unique: 9800 },
  { name: 'Thu', visits: 2780, unique: 3908 },
  { name: 'Fri', visits: 1890, unique: 4800 },
  { name: 'Sat', visits: 2390, unique: 3800 },
  { name: 'Sun', visits: 3490, unique: 4300 },
];

export default function Dashboard() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      
      {/* --- ROW 1: PRIMARY METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="TOTAL REVENUE" value="₱ 845,245" icon={DollarSign} trend={16} color="blue" />
        <StatCard title="NET PROFIT" value="₱ 142,752" icon={TrendingUp} trend={-4} color="pink" />
        <StatCard title="FUEL COSTS" value="₱ 56,546" icon={Package} trend={23} color="orange" />
        <StatCard title="ACTIVE TRIPS" value="24" icon={Truck} trend={44} color="green" />
        <StatCard title="COMPLETED" value="128" icon={CheckCircle} trend={10} color="purple" />
      </div>

      {/* --- ROW 2: SECONDARY METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Payments" value="₱ 24,256" icon={DollarSign} trend={46} color="white" subText="Last Week" />
        <StatCard title="App Visitors" value="5,472" icon={Users} trend={32} color="white" subText="Last Week" />
        <StatCard title="New Bookings" value="1,750" icon={Package} trend={20} color="white" subText="Last Week" />
        <StatCard title="New Drivers" value="12" icon={Users} trend={12} color="white" subText="New Members" />
      </div>

      {/* --- ROW 3: CHARTS AREA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        
        {/* Main Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-700">Trip Volume (Central Luzon)</h3>
              <p className="text-sm text-slate-400">Daily trips vs Completed deliveries</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center text-sm text-slate-600"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Trips</div>
               <div className="flex items-center text-sm text-slate-600"><span className="w-3 h-3 rounded-full bg-pink-500 mr-2"></span>Completed</div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                <Area type="monotone" dataKey="unique" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorUnique)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- TARLAC ROUTE ACTIVITY (UPDATED) --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="font-bold text-slate-700 mb-4">Tarlac Route Status</h3>
          
          <div className="space-y-6">
            {/* 1. North Route */}
            <ProgressBar label="Paniqui ⇄ Tarlac City" color="bg-pink-500" width="85%" />
            
            {/* 2. South Route */}
            <ProgressBar label="Capas ⇄ Bamban" color="bg-orange-500" width="60%" />
            
            {/* 3. North-West Route */}
            <ProgressBar label="Moncada ⇄ Gerona" color="bg-red-500" width="45%" />
            
            {/* 4. West Route */}
            <ProgressBar label="Camiling ⇄ San Clemente" color="bg-green-500" width="90%" />
            
            {/* 5. East Route */}
            <ProgressBar label="Victoria ⇄ Pura" color="bg-purple-500" width="30%" />
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
             <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Provincial Efficiency</span>
                <span className="font-bold text-slate-800">84%</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper Component for the Progress Bars
const ProgressBar = ({ label, width, color }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-sm font-medium text-slate-400">{width}</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div className={`${color} h-2 rounded-full relative`} style={{ width }}>
        {/* The little vertical ticker line */}
        <div className={`absolute right-0 -top-1 w-1 h-4 ${color} rounded-sm`}></div>
      </div>
    </div>
  </div>
);