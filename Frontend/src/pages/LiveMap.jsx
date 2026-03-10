import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { Play, Truck, Route as RouteIcon, Filter } from 'lucide-react';

// ... (SVGs and Custom Icons remain the same as your provided code)
const busSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`;
const destSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

const customBusIcon = L.divIcon({
  className: 'custom-bus-icon',
  html: `<div style="background-color: #059669; border-radius: 50%; padding: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); border: 2px solid white;">${busSvg}</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

const customDestIcon = L.divIcon({
  className: 'custom-dest-icon',
  html: `<div style="background-color: #EF4444; border-radius: 50%; padding: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); border: 2px solid white;">${destSvg}</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

const ROUTE_COLORS = ['#6366f1', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#06b6d4', '#ef4444'];

const MapUpdater = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [positions, map]);
  return null;
};

const LiveMap = () => {
  const [fleet, setFleet] = useState({});
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [filterCompany, setFilterCompany] = useState('All');

  const userStr = localStorage.getItem('tms_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isHeadAdmin = user?.role === 'HeadAdmin';

  const fetchFleetData = async () => {
    const token = localStorage.getItem('tms_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [dispRes, routeRes, vehRes] = await Promise.all([
        fetch('http://localhost:5072/api/dispatch', { headers }),
        fetch('http://localhost:5072/api/transitroutes', { headers }),
        fetch('http://localhost:5072/api/vehicles', { headers })
      ]);

      const dispatches = await dispRes.json();
      const routes = await routeRes.json();
      const vehicles = await vehRes.json();

      const initialFleet = {};

      dispatches.forEach((d, index) => {
        const route = routes.find(r => `${r.origin} → ${r.destination}` === d.routeName);
        const vehicle = vehicles.find(v => v.id === d.vehicleId);
        const assignedColor = ROUTE_COLORS[index % ROUTE_COLORS.length];

        if (route && vehicle && route.routeCoordinates) {
          const coords = JSON.parse(route.routeCoordinates);
          if (coords.length > 0) {
            initialFleet[d.id] = {
              id: d.id,
              plate: vehicle.plateNumber,
              routeName: d.routeName,
              position: [coords[0][0] + (index * 0.0003), coords[0][1] + (index * 0.0003)],
              destination: coords[coords.length - 1],
              path: coords,
              pathIndex: 0,
              color: assignedColor,
              companyName: vehicle.companyName // Captured from the new C# Vehicle join
            };
          }
        }
      });

      setFleet(initialFleet);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFleetData();
    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5072/trackingHub")
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          setIsConnected(true);
          connection.on("ReceiveLocationUpdate", (vehicleId, lat, lng) => {
            setFleet(prev => {
              const updated = { ...prev };
              Object.keys(updated).forEach(key => {
                if (updated[key].plate === vehicleId) {
                  updated[key].position = [lat, lng];
                }
              });
              return updated;
            });
          });
        })
        .catch(err => console.error(err));
    }
  }, [connection]);

  // Logic to handle filtering
  const fleetArray = Object.values(fleet);
  const uniqueCompanies = ['All', ...new Set(fleetArray.map(v => v.companyName).filter(Boolean))];
  
  const filteredFleet = isHeadAdmin && filterCompany !== 'All' 
    ? fleetArray.filter(v => v.companyName === filterCompany)
    : fleetArray;

  const simulateMovement = async () => {
    if (!connection || !isConnected) return;
    const updatedFleet = { ...fleet };
    for (const key of Object.keys(updatedFleet)) {
      const v = updatedFleet[key];
      let nextIdx = v.pathIndex + 5;
      if (nextIdx >= v.path.length) nextIdx = v.path.length - 1;
      updatedFleet[key].pathIndex = nextIdx;
      const nextPos = v.path[nextIdx];
      try {
        await connection.invoke("UpdateLocation", v.plate, nextPos[0], nextPos[1]);
      } catch(e) { console.error(e); }
    }
    setFleet(updatedFleet);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Live Fleet Tracking</h1>
          <p className="text-slate-500 mt-2">
            Status: {isConnected ? <span className="text-emerald-600 font-bold">● Connected</span> : <span className="text-amber-500 font-bold">Connecting...</span>}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Head Admin Filter Dropdown */}
          {isHeadAdmin && fleetArray.length > 0 && (
            <div className="relative flex items-center">
              <Filter className="absolute left-3 text-emerald-600 pointer-events-none" size={16} />
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
              >
                {uniqueCompanies.map((company) => (
                  <option key={company} value={company}>{company === 'All' ? 'View All Companies' : company}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            onClick={simulateMovement}
            disabled={!isConnected || fleetArray.length === 0}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
          >
            <Play size={20} /> Simulate Ping
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[600px] z-0 relative">
        {/* Status Panel Overlay */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl border border-slate-200 min-w-[280px] max-h-[550px] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Active Fleet ({filteredFleet.length})</h3>
          <div className="space-y-4">
            {filteredFleet.length === 0 ? (
              <p className="text-sm text-slate-500 font-medium">No active units match filter.</p>
            ) : (
              filteredFleet.map((vehicle) => (
                <div key={vehicle.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                      <Truck size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{vehicle.plate}</p>
                      {isHeadAdmin && <p className="text-[10px] text-emerald-600 font-bold uppercase">{vehicle.companyName}</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <MapContainer center={[15.4828, 120.5943]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapUpdater positions={filteredFleet.map(v => v.position)} />
          
          {filteredFleet.map(vehicle => (
            <React.Fragment key={vehicle.id}>
              <Polyline positions={vehicle.path} color={vehicle.color} weight={5} opacity={0.6} />
              
              <Marker position={vehicle.destination} icon={customDestIcon}>
                <Popup>
                  <div className="font-bold">Destination</div>
                  <div className="text-xs">{vehicle.routeName}</div>
                </Popup>
              </Marker>

              <Marker position={vehicle.position} icon={customBusIcon}>
                <Popup>
                  <div className="font-bold">{vehicle.plate}</div>
                  <div className="text-xs">{vehicle.routeName}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">{vehicle.companyName}</div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveMap;