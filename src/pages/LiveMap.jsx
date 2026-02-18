import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Truck, Navigation, Search } from 'lucide-react';

// 1. MAP SETTINGS
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center (e.g., Manila)
const center = {
  lat: 14.5995,
  lng: 120.9842
};

// Custom Map Styles (Optional: Makes it look cleaner/techy)
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
};

const LiveMap = () => {
  // 2. LOAD THE API KEY
  const { isLoaded } = useJsApiLoader({
  id: 'google-map-script',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY // <--- UPDATED
});

  const [map, setMap] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Mock Drivers Data
  const drivers = [
    { id: 1, name: "Cameron W.", lat: 14.5995, lng: 120.9842, status: "On Trip", destination: "Manila Port" },
    { id: 2, name: "Brooklyn S.", lat: 14.5547, lng: 121.0244, status: "Idle", destination: "Makati Hub" },
  ];

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  if (!isLoaded) return <div className="h-full flex items-center justify-center">Loading Maps...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      
      {/* OVERLAY: Fleet Stats */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 w-64">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Truck size={18} className="text-emerald-600"/> Fleet Overview
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
             <span className="text-slate-500">Active Trips</span>
             <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">8</span>
          </div>
          <div className="flex justify-between items-center text-sm">
             <span className="text-slate-500">Idle / Parked</span>
             <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">4</span>
          </div>
        </div>
      </div>

      {/* GOOGLE MAP */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Render Driver Markers */}
        {drivers.map(driver => (
          <Marker
            key={driver.id}
            position={{ lat: driver.lat, lng: driver.lng }}
            onClick={() => setSelectedDriver(driver)}
            // You can use a custom icon here if you have a URL
            // icon={{ url: "https://path-to-truck-icon.png", scaledSize: new window.google.maps.Size(40, 40) }}
          />
        ))}

        {/* Info Window (Popup) */}
        {selectedDriver && (
          <InfoWindow
            position={{ lat: selectedDriver.lat, lng: selectedDriver.lng }}
            onCloseClick={() => setSelectedDriver(null)}
          >
            <div className="p-1 min-w-[150px]">
              <h4 className="font-bold text-slate-800 text-sm mb-1">{selectedDriver.name}</h4>
              <div className="text-xs text-slate-500 flex flex-col gap-1">
                <span className="flex items-center gap-1"><Navigation size={10}/> {selectedDriver.destination}</span>
                <span className={`inline-block px-1.5 py-0.5 rounded w-fit ${selectedDriver.status === 'On Trip' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>
                  {selectedDriver.status}
                </span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default LiveMap;