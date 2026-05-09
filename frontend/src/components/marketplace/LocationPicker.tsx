'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onChange: (lat: number, lng: number) => void;
}

function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat = -6.2088,
  initialLng = 106.8456,
  onChange,
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onChange(lat, lng);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          onChange(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Gagal mendapatkan lokasi. Pastikan izin lokasi aktif.');
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Klik pada peta untuk menentukan lokasi pickup</p>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="text-xs font-bold text-emerald-600 hover:underline"
        >
          Gunakan Lokasi Saya Saat Ini
        </button>
      </div>
      
      <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <MapEvents onClick={handleMapClick} />
        </MapContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400">Latitude</p>
          <p className="text-sm font-mono text-slate-700">{position[0].toFixed(8)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400">Longitude</p>
          <p className="text-sm font-mono text-slate-700">{position[1].toFixed(8)}</p>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
