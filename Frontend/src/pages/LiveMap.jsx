import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { Play, Navigation, Clock, MapPin } from 'lucide-react';

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

const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { animate: true, duration: 1.5 });
  }, [position, map]);
  return null;
};

const LiveMap = () => {
  const [position, setPosition] = useState([15.4828, 120.5943]);
  const destination = [15.4694, 120.5960]; 
  
  const [distanceKm, setDistanceKm] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(0);
  const speedKmh = 45; 

  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
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
            setPosition([lat, lng]);
          });
        })
        .catch(err => console.error(err));
    }
  }, [connection]);

  useEffect(() => {
    const currentLatLng = L.latLng(position[0], position[1]);
    const destLatLng = L.latLng(destination[0], destination[1]);
    
    const distMeters = currentLatLng.distanceTo(destLatLng);
    const distKm = distMeters / 1000;
    
    const timeHours = distKm / speedKmh;
    const timeMinutes = Math.round(timeHours * 60);

    setDistanceKm(distKm.toFixed(2));
    setEtaMinutes(timeMinutes);
  }, [position]);

  const simulateMovement = async () => {
    if (connection && isConnected) {
      const newLat = position[0] - 0.0010;
      const newLng = position[1] + 0.0002;
      
      try {
        await connection.invoke("UpdateLocation", "ABC-1234", newLat, newLng);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Live Vehicle Tracking</h1>
          <p className="text-slate-500 mt-2">
            Status: {isConnected ? <span className="text-emerald-600 font-bold">● Connected to Hub</span> : <span className="text-amber-500 font-bold">Connecting...</span>}
          </p>
        </div>
        
        <button 
          onClick={simulateMovement}
          disabled={!isConnected}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
        >
          <Play size={20} /> Simulate GPS Ping
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[600px] z-0 relative">
        
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 min-w-[280px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Telemetry</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Navigation size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Distance to Dest.</p>
                <p className="font-bold text-slate-800">{distanceKm} km</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Estimated Time</p>
                <p className="font-bold text-slate-800">{etaMinutes} mins (@ {speedKmh} km/h)</p>
              </div>
            </div>
          </div>
        </div>

        <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapUpdater position={position} />
          
          <Marker position={destination} icon={customDestIcon}>
            <Popup>
              <div className="font-bold text-slate-800">Final Destination</div>
              <div className="text-sm text-slate-500">Terminal Hub</div>
            </Popup>
          </Marker>

          <Marker position={position} icon={customBusIcon}>
            <Popup>
              <div className="font-bold text-slate-800">Vehicle: ABC-1234</div>
              <div className="text-sm text-slate-500">Speed: {speedKmh} km/h</div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveMap;