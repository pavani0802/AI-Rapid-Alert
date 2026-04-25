import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface MapPickerProps {
  onLocationSelect: (location: Location) => void;
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const [loading, setLoading] = useState(false);
  const [currentLoc, setCurrentLoc] = useState<Location | null>(null);

  const getBrowserLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLoc(loc);
          onLocationSelect(loc);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
          alert("Could not get your location. Please enter it manually or check permissions.");
        }
      );
    } else {
      setLoading(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={getBrowserLocation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          Use Current Location
        </button>
      </div>

      <div className="relative h-64 bg-slate-100 rounded-xl border-2 border-slate-200 overflow-hidden flex flex-col items-center justify-center text-slate-400">
        {currentLoc ? (
          <div className="text-center space-y-2">
            <MapPin className="w-8 h-8 text-red-600 mx-auto" />
            <p className="text-slate-900 font-medium">Location Selected</p>
            <p className="text-xs">Lat: {currentLoc.lat.toFixed(6)}, Lng: {currentLoc.lng.toFixed(6)}</p>
            <p className="text-[10px] text-slate-500 mt-4 px-4">
              (In a production app, a Google Map would be displayed here for precise selection)
            </p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <MapPin className="w-8 h-8 opacity-20 mx-auto" />
            <p>No location selected</p>
          </div>
        )}
      </div>
    </div>
  );
}
