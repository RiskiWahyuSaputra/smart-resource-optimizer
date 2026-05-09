'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

interface FoodPost {
  id: number;
  title: string;
  restaurantName: string;
  lat: number;
  lng: number;
  pickupAddress?: string;
  storeImage?: string;
}

interface MapViewProps {
  posts: FoodPost[];
  center?: [number, number];
  zoom?: number;
}

const MapView: React.FC<MapViewProps> = ({ 
  posts, 
  center = [-6.2088, 106.8456], // Jakarta default
  zoom = 13 
}) => {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {posts.map((post) => (
          <Marker key={post.id} position={[post.lat, post.lng]}>
            <Popup>
              <div className="min-w-[200px]">
                {post.storeImage && (
                  <div className="mb-2 h-24 w-full overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={post.storeImage}
                      alt={post.restaurantName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-1">
                  <h4 className="font-bold text-slate-900">{post.title}</h4>
                  <p className="text-sm text-slate-600 font-medium">{post.restaurantName}</p>
                  {post.pickupAddress && (
                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                      <span className="shrink-0 text-sky-500">📍</span>
                      {post.pickupAddress}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
