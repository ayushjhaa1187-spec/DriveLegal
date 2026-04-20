"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils/cn";
import { Move, Navigation, MapPin } from "lucide-react";

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const FineIcon = L.divIcon({
  html: '<div class="h-8 w-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg animate-pulse">⚠️</div>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const EnforcementIcon = L.divIcon({
  html: '<div class="h-8 w-8 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg">👮</div>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const DangerIcon = L.divIcon({
  html: '<div class="h-8 w-8 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg">🛑</div>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface MapProps {
  hotspots: any[];
  onMapClick: (lat: number, lng: number) => void;
  onVerify?: (hotspotId: string) => void;
  userLocation?: [number, number] | null;
  center?: [number, number];
}

function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", (e) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={DefaultIcon}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Map({ hotspots, onMapClick, center, userLocation, onVerify }: MapProps) {
  const defaultCenter: [number, number] = center || [28.6139, 77.2090]; // Delhi as fallback

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        className="h-full w-full z-10"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {hotspots.map((h) => {
          let icon = EnforcementIcon;
          if (h.type === "fine") icon = FineIcon;
          if (h.type === "danger") icon = DangerIcon;

          const distance = userLocation ? L.latLng(userLocation).distanceTo([h.lat, h.lng]) : Infinity;
          const isNear = distance < 5000; // 5km in meters

          return (
            <Marker key={h.id} position={[h.lat, h.lng]} icon={icon}>
              <Popup>
                <div className="p-3 min-w-[160px]">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">{h.type}</p>
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                       <Navigation className="h-2 w-2" /> {h.upvotes || 0}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mb-2 leading-relaxed">{h.description}</p>
                  
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    {onVerify && (
                      <button
                        onClick={() => onVerify(h.id)}
                        disabled={!isNear}
                        className={cn(
                          "w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          isNear 
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                      >
                        {isNear ? "Verify Activity" : "Too Far to Verify"}
                      </button>
                    )}
                    <p className="text-[8px] text-center text-slate-400 font-bold uppercase">
                      Reported {new Date(h.timestamp?.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <LocationMarker />
        <MapEvents onClick={onMapClick} />
      </MapContainer>

      {/* Floating Instructions */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-max px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 pointer-events-none border border-white/10">
        <Navigation className="h-3 w-3 text-amber-500" />
        Tap anywhere to report a hotspot
      </div>
    </div>
  );
}
