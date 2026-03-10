import React, { useState, useEffect } from 'react';
import { Video, Camera, AlertCircle, Wifi, WifiOff, Maximize, Users, Gauge, Filter } from 'lucide-react';

const API_URL = 'http://localhost:5072';

const CCTV = () => {
  const [cameraFeeds, setCameraFeeds] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW: State for the company filter
  const [filterCompany, setFilterCompany] = useState('All');

  const userStr = localStorage.getItem('tms_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isHeadAdmin = user?.role === 'HeadAdmin';

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const token = localStorage.getItem('tms_token');
        const response = await fetch(`${API_URL}/api/cctv/feeds`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCameraFeeds(data);
          
          // Keep the currently selected feed active, but update its live stats
          setSelectedFeed(prev => {
            if (!prev && data.length > 0) return data[0];
            if (prev) {
              const updated = data.find(f => f.id === prev.id);
              return updated || prev;
            }
            return null;
          });
        }
      } catch (error) {
        console.error("Failed to fetch CCTV feeds", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately, then poll every 5 seconds for live telemetry updates
    fetchFeeds();
    const interval = setInterval(fetchFeeds, 5000);
    return () => clearInterval(interval);
  }, []);

  // NEW: Generate unique companies for the dropdown
  const uniqueCompanies = ['All', ...new Set(cameraFeeds.map(f => f.companyName).filter(Boolean))];

  // NEW: Filter the feeds list based on the dropdown selection
  const filteredFeeds = isHeadAdmin && filterCompany !== 'All' 
    ? cameraFeeds.filter(f => f.companyName === filterCompany)
    : cameraFeeds;

  // Auto-select the first feed in the newly filtered list if the active one gets filtered out
  useEffect(() => {
    if (filteredFeeds.length > 0 && (!selectedFeed || !filteredFeeds.find(f => f.id === selectedFeed.id))) {
      setSelectedFeed(filteredFeeds[0]);
    } else if (filteredFeeds.length === 0) {
      setSelectedFeed(null);
    }
  }, [filterCompany, filteredFeeds.length]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">CCTV Video Feed</h1>
          <p className="text-slate-500 mt-2">Live security monitoring for active fleet</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* NEW: Head Admin Filter Dropdown */}
          {isHeadAdmin && cameraFeeds.length > 0 && (
            <div className="relative flex items-center">
              <Filter className="absolute left-3 text-emerald-600 pointer-events-none" size={16} />
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
              >
                {uniqueCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company === 'All' ? 'All Companies' : company}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              System Active
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 font-medium h-[600px] flex items-center justify-center">
          Establishing secure connection to fleet cameras...
        </div>
      ) : cameraFeeds.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 font-medium h-[600px] flex flex-col items-center justify-center">
          <Video size={48} className="text-slate-300 mb-4" />
          <p className="text-xl font-bold text-slate-700">No Active Feeds</p>
          <p className="text-sm">Schedule a dispatch to view live vehicle cameras.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Viewport */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden relative group min-h-[400px]">
              <div className="aspect-video flex flex-col items-center justify-center relative">
                {selectedFeed && selectedFeed.status === 'Online' ? (
                  <>
                    {/* Simulated Camera Static/Darkness */}
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                       <Camera size={48} className="text-slate-700 opacity-50 mb-4" />
                       <p className="absolute text-slate-600 font-mono text-sm tracking-widest mt-16 animate-pulse">AWAITING VIDEO STREAM...</p>
                    </div>
                    
                    {/* Camera Overlay HUD */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse flex items-center gap-1">
                        <div className="h-2 w-2 bg-white rounded-full"></div> REC
                      </span>
                      <span className="bg-black/50 backdrop-blur text-white text-xs font-mono px-2 py-1 rounded">
                        CAM-01 (CABIN)
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur text-white text-xs font-mono px-2 py-1 rounded">
                      {new Date().toLocaleString()}
                    </div>
                    <button className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur transition-colors opacity-0 group-hover:opacity-100">
                      <Maximize size={16} />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-500">
                    <WifiOff size={48} className="mb-4 opacity-50" />
                    <p className="font-bold text-lg">Signal Lost</p>
                    <p className="text-sm">Unable to connect to vehicle</p>
                  </div>
                )}
              </div>
              
              {/* Telemetry Bar underneath Main Video */}
              {selectedFeed && (
                <div className="bg-slate-800 p-4 border-t border-slate-700 flex flex-wrap justify-between items-center gap-4 transition-all">
                   <div>
                     <h3 className="text-white font-bold text-lg">{selectedFeed.plate}</h3>
                     <p className="text-slate-400 text-sm">{selectedFeed.route}</p>
                     {isHeadAdmin && <p className="text-emerald-400 text-xs font-bold mt-1 uppercase">{selectedFeed.companyName}</p>}
                   </div>
                   <div className="flex gap-6">
                     <div className="flex items-center gap-2 text-slate-300">
                       <Users size={18} className="text-blue-400"/>
                       <span className="font-mono font-bold w-6">{selectedFeed.passengers}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-300">
                       <Gauge size={18} className="text-emerald-400"/>
                       <span className="font-mono font-bold w-16 text-right">{selectedFeed.speed}</span>
                     </div>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Side Grid of other cameras */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <Video size={20} className="text-slate-400" /> Camera Roster
               </h3>
               <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">{filteredFeeds.length} Active</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {filteredFeeds.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-10">No cameras match the current filter.</div>
              ) : (
                filteredFeeds.map((feed) => (
                  <button 
                    key={feed.id}
                    onClick={() => setSelectedFeed(feed)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedFeed?.id === feed.id 
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' 
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-800">{feed.plate}</span>
                      {feed.status === 'Online' ? (
                        <span className="text-emerald-500"><Wifi size={16} /></span>
                      ) : (
                        <span className="text-red-400"><WifiOff size={16} /></span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-slate-500 mb-1 line-clamp-1">{feed.route}</div>
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span>{feed.driver}</span>
                      {feed.status === 'Offline' && <span className="flex items-center gap-1 text-red-500"><AlertCircle size={12}/> Offline</span>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CCTV;