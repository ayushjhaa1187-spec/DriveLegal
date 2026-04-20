"use client";

import { useState, useCallback } from "react";
import { MapPin, Crosshair, Navigation, AlertCircle } from "lucide-react";

interface LocationResult {
  lat: number;
  lng: number;
  stateCode: string;
  stateName: string;
  district?: string;
  source: "auto" | "manual";
}

interface LocationInputProps {
  onLocationSelect: (location: LocationResult) => void;
  className?: string;
}

// India state code mapping from Nominatim state names
const STATE_NAME_TO_CODE: Record<string, string> = {
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  "Assam": "AS",
  "Bihar": "BR",
  "Chhattisgarh": "CG",
  "Goa": "GA",
  "Gujarat": "GJ",
  "Haryana": "HR",
  "Himachal Pradesh": "HP",
  "Jharkhand": "JH",
  "Karnataka": "KA",
  "Kerala": "KL",
  "Madhya Pradesh": "MP",
  "Maharashtra": "MH",
  "Manipur": "MN",
  "Meghalaya": "ML",
  "Mizoram": "MZ",
  "Nagaland": "NL",
  "Odisha": "OD",
  "Punjab": "PB",
  "Rajasthan": "RJ",
  "Sikkim": "SK",
  "Tamil Nadu": "TN",
  "Telangana": "TS",
  "Tripura": "TR",
  "Uttar Pradesh": "UP",
  "Uttarakhand": "UK",
  "West Bengal": "WB",
  "Delhi": "DL",
  "Jammu and Kashmir": "JK",
  "Ladakh": "LA",
  "Puducherry": "PY",
  "Chandigarh": "CH",
};

function extractStateCode(stateName: string | undefined): { code: string; name: string } {
  if (!stateName) return { code: "IN", name: "India" };
  const code = STATE_NAME_TO_CODE[stateName] ?? "IN";
  return { code, name: stateName };
}

export function LocationInput({ onLocationSelect, className = "" }: LocationInputProps) {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number, source: "auto" | "manual") => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
        { headers: { "User-Agent": "DriveLegal/1.0" } }
      );
      const data = await response.json();
      const { code: stateCode, name: stateName } = extractStateCode(data.address?.state);
      const district = data.address?.county || data.address?.city_district || undefined;
      const result: LocationResult = {
        lat: latitude,
        lng: longitude,
        stateCode,
        stateName,
        district,
        source,
      };
      setSelectedLocation(result);
      onLocationSelect(result);
    } catch {
      // Fallback: no reverse geocode
      const result: LocationResult = {
        lat: latitude,
        lng: longitude,
        stateCode: "IN",
        stateName: "India",
        source,
      };
      setSelectedLocation(result);
      onLocationSelect(result);
    }
  }, [onLocationSelect]);

  async function handleAutoDetect() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await reverseGeocode(pos.coords.latitude, pos.coords.longitude, "auto");
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location access denied. Please enter coordinates manually."
            : "Could not detect location. Please enter coordinates manually."
        );
        setLoading(false);
        setMode("manual");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async function handleManualSubmit() {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      setError("Please enter valid numeric coordinates.");
      return;
    }
    if (latitude < 8 || latitude > 37.5 || longitude < 68 || longitude > 97.5) {
      setError("Coordinates are outside India. Please enter valid Indian coordinates.");
      return;
    }
    setLoading(true);
    setError(null);
    await reverseGeocode(latitude, longitude, "manual");
    setLoading(false);
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Mode toggle */}
      <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setMode("auto")}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            mode === "auto"
              ? "bg-amber-500 text-slate-900"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-700"
          }`}
        >
          Auto-detect
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            mode === "manual"
              ? "bg-amber-500 text-slate-900"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-700"
          }`}
        >
          Enter Coordinates
        </button>
      </div>

      {/* Auto-detect mode */}
      {mode === "auto" && (
        <button
          onClick={handleAutoDetect}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-semibold text-sm transition-colors"
        >
          {loading ? (
            <span className="animate-spin">&#9696;</span>
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
          {loading ? "Detecting location..." : "Auto-detect my location"}
        </button>
      )}

      {/* Manual coordinate input mode */}
      {mode === "manual" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                min="8"
                max="37.5"
                placeholder="e.g. 12.9716"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                min="68"
                max="97.5"
                placeholder="e.g. 77.5946"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Tip: Use Google Maps to find your lat/lng (right-click a location)
          </p>
          <button
            onClick={handleManualSubmit}
            disabled={loading || !lat || !lng}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-semibold text-sm transition-colors"
          >
            <Navigation className="h-4 w-4" />
            {loading ? "Looking up location..." : "Use these coordinates"}
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Selected location display */}
      {selectedLocation && (
        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <MapPin className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-300">
              {selectedLocation.stateName}
              {selectedLocation.district && ` — ${selectedLocation.district}`}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°E
              {" · "}
              <span className="uppercase font-mono">{selectedLocation.stateCode}</span>
              {" laws will apply"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
