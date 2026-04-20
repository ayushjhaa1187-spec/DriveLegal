'use client';

import React, { useState, useCallback } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle } from 'lucide-react';

interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'gps' | 'manual' | 'search';
}

interface GeoCoordinatesInputProps {
  onCoordinatesChange: (coords: GeoCoordinates | null) => void;
  className?: string;
  label?: string;
  required?: boolean;
}

export default function GeoCoordinatesInput({
  onCoordinatesChange,
  className = '',
  label = 'Incident Location',
  required = false,
}: GeoCoordinatesInputProps) {
  const [mode, setMode] = useState<'gps' | 'manual'>('gps');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);

  const handleGPSDetect = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }
    setStatus('loading');
    setStatusMessage('Detecting your location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected: GeoCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'gps',
        };
        setCoords(detected);
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        setStatus('success');
        setStatusMessage(`Location detected (±${Math.round(position.coords.accuracy)}m accuracy)`);
        onCoordinatesChange(detected);
      },
      (error) => {
        setStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setStatusMessage('Location access denied. Please use manual entry.');
            break;
          case error.POSITION_UNAVAILABLE:
            setStatusMessage('Location unavailable. Please use manual entry.');
            break;
          default:
            setStatusMessage('Unable to detect location. Please use manual entry.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onCoordinatesChange]);

  const handleManualSubmit = useCallback(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      setStatus('error');
      setStatusMessage('Please enter valid decimal coordinates.');
      return;
    }
    if (lat < -90 || lat > 90) {
      setStatus('error');
      setStatusMessage('Latitude must be between -90 and 90.');
      return;
    }
    if (lng < -180 || lng > 180) {
      setStatus('error');
      setStatusMessage('Longitude must be between -180 and 180.');
      return;
    }
    const manual: GeoCoordinates = { latitude: lat, longitude: lng, source: 'manual' };
    setCoords(manual);
    setStatus('success');
    setStatusMessage(`Coordinates set: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    onCoordinatesChange(manual);
  }, [latitude, longitude, onCoordinatesChange]);

  const handleClear = () => {
    setCoords(null);
    setLatitude('');
    setLongitude('');
    setStatus('idle');
    setStatusMessage('');
    onCoordinatesChange(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('gps')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'gps'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Auto-detect GPS
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Manual Entry
        </button>
      </div>

      {/* GPS Mode */}
      {mode === 'gps' && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGPSDetect}
            disabled={status === 'loading'}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Navigation className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
            {status === 'loading' ? 'Detecting...' : 'Detect My Location'}
          </button>
          {coords && status === 'success' && (
            <button type="button" onClick={handleClear} className="text-xs text-gray-500 hover:text-red-500 underline">
              Clear
            </button>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {mode === 'manual' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latitude</label>
              <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 12.9716"
                step="any"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Longitude</label>
              <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 77.5946"
                step="any"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleManualSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Set Coordinates
            </button>
            {coords && (
              <button type="button" onClick={handleClear} className="text-xs text-gray-500 hover:text-red-500 underline">
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className={`flex items-start gap-2 text-sm ${
          status === 'error' ? 'text-red-600' :
          status === 'success' ? 'text-green-600' :
          'text-blue-600'
        }`}>
          {status === 'error' && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          {status === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Coordinates Display */}
      {coords && (
        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-xs text-gray-500 font-mono">
          {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
          {coords.source === 'gps' && coords.accuracy && ` (GPS ±${Math.round(coords.accuracy)}m)`}
          {coords.source === 'manual' && ' (manual)'}
        </div>
      )}
    </div>
  );
}
