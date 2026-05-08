'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import FoodCard from '@/components/marketplace/FoodCard';
import { Search, Filter, Map as MapIcon, List } from 'lucide-react';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/marketplace/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center rounded-xl animate-pulse">
      <p className="text-slate-400 font-medium">Memuat peta...</p>
    </div>
  ),
});

const FOOD_POSTS = [
  {
    id: 1,
    title: "Sisa Makanan Pesta (Nasi Box)",
    restaurantName: "Catering Berkah",
    quantity: "15 Box",
    distance: "0.8 km",
    expiryTime: "2 jam",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=300&auto=format&fit=crop",
    lat: -6.2088,
    lng: 106.8456
  },
  {
    id: 2,
    title: "Roti Berlebih (Berbagai Jenis)",
    restaurantName: "BreadTalk Senayan",
    quantity: "20 Pcs",
    distance: "1.5 km",
    expiryTime: "4 jam",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&h=300&auto=format&fit=crop",
    lat: -6.2146,
    lng: 106.8451
  },
  {
    id: 3,
    title: "Sayuran Segar Sisa Display",
    restaurantName: "Super Indo",
    quantity: "5 kg",
    distance: "2.1 km",
    expiryTime: "6 jam",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=400&h=300&auto=format&fit=crop",
    lat: -6.2000,
    lng: 106.8200
  },
  {
    id: 4,
    title: "Donat & Pastry",
    restaurantName: "J.CO Donuts",
    quantity: "12 Pcs",
    distance: "3.2 km",
    expiryTime: "1 jam",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&h=300&auto=format&fit=crop",
    lat: -6.2200,
    lng: 106.8100
  },
  {
    id: 5,
    title: "Nasi Goreng Spesial",
    restaurantName: "Warung Pak Kumis",
    quantity: "5 Porsi",
    distance: "0.5 km",
    expiryTime: "1 jam",
    image: "https://images.unsplash.com/photo-1512058560566-427a1bd565c8?q=80&w=400&h=300&auto=format&fit=crop",
    lat: -6.2050,
    lng: 106.8500
  }
];

export default function MarketplacePage() {
  const [viewMode, setViewMode] = React.useState<'split' | 'map' | 'list'>('split');

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col">
      {/* Header / Filters */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari makanan atau restoran..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4 text-emerald-600" />
              Filter
            </button>
            
            <div className="hidden sm:flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button 
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'split' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="Split View"
              >
                <div className="flex items-center gap-1.5 px-1">
                  <List className="w-4 h-4" />
                  <MapIcon className="w-4 h-4" />
                </div>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-[2000px] mx-auto w-full">
        {/* Left Side: Food List */}
        <div className={`
          flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar
          ${viewMode === 'map' ? 'hidden' : 'block'}
          ${viewMode === 'split' ? 'md:w-1/2 lg:w-[450px] xl:w-[500px]' : 'w-full'}
        `}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Pasar Makanan</h1>
            <p className="text-slate-500 text-sm">Temukan makanan berlebih berkualitas di sekitarmu</p>
          </div>

          <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {FOOD_POSTS.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </div>

        {/* Right Side: Map */}
        <div className={`
          flex-1 p-4 sm:p-6 md:pl-0 h-[500px] md:h-auto
          ${viewMode === 'list' ? 'hidden' : 'block'}
          ${viewMode === 'split' ? 'md:w-1/2' : 'w-full'}
          sticky top-[73px]
        `}>
          <MapView posts={FOOD_POSTS} />
        </div>
      </div>
      
      {/* Mobile Toggle View */}
      <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-4">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 text-sm font-semibold ${viewMode === 'list' ? 'text-emerald-400' : 'text-white'}`}
          >
            <List className="w-4 h-4" />
            Daftar
          </button>
          <div className="w-px h-4 bg-slate-700"></div>
          <button 
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 text-sm font-semibold ${viewMode === 'map' ? 'text-emerald-400' : 'text-white'}`}
          >
            <MapIcon className="w-4 h-4" />
            Peta
          </button>
        </div>
      </div>
    </div>
  );
}
