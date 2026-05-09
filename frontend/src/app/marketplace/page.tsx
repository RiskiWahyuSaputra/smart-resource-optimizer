'use client';

import React, { useDeferredValue, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Filter, List, Map as MapIcon, Search } from 'lucide-react';
import FoodCard from '@/components/marketplace/FoodCard';
import { useAuth } from '@/context/AuthContext';
import {
  claimFoodPost,
  getFoodPosts,
  type MarketplaceFoodPost,
} from '@/services/marketplaceService';
import { useCart } from '@/context/CartContext';

const MapView = dynamic(() => import('@/components/marketplace/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center rounded-xl animate-pulse">
      <p className="text-slate-400 font-medium">Memuat peta...</p>
    </div>
  ),
});

type ViewMode = 'split' | 'map' | 'list';

function formatRemainingTime(value: string) {
  const target = new Date(value).getTime();
  const diffInMs = target - Date.now();

  if (diffInMs <= 0) {
    return 'Sudah berakhir';
  }

  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffInHours > 0) {
    return `${diffInHours} jam ${diffInMinutes} menit`;
  }

  return `${Math.max(diffInMinutes, 1)} menit`;
}

function normalizeCoordinate(value: number | string | null | undefined, fallback: number) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

export default function MarketplacePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [foodPosts, setFoodPosts] = useState<MarketplaceFoodPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { user } = useAuth();
  const { addItem, items: cartItems } = useCart();
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadFoodPosts = async (search?: string) => {
    setLoading(true);
    setError('');

    try {
      const data = await getFoodPosts(search);
      setFoodPosts(data.food_posts ?? []);
      setCurrentPage(1); // Reset to first page on new data/search
    } catch {
      setError('Gagal memuat stok makanan. Coba lagi beberapa saat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadFoodPosts(deferredSearchTerm);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [deferredSearchTerm]);

  const handleAddToCart = (food: (typeof mappedPosts)[0]) => {
    if (!user) {
      setError('Silakan login terlebih dahulu untuk mengklaim makanan.');
      return;
    }
    addItem(food);
    setFeedbackMessage(`"${food.title}" telah ditambahkan ke keranjang klaim.`);
    // Auto clear feedback after 3 seconds
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const mappedPosts = foodPosts.map((post) => ({
    id: post.id,
    title: post.title,
    description: post.description || '',
    restaurantName: post.user.profile?.name || post.user.name,
    quantity: `${post.quantity} ${post.quantity_unit}`,
    location: post.pickup_address,
    expiryTime: formatRemainingTime(post.available_until),
    image: post.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=300&auto=format&fit=crop',
    lat: normalizeCoordinate(post.lat, -6.2088),
    lng: normalizeCoordinate(post.long, 106.8456),
    pickupAddress: post.pickup_address,
  }));

  const mapCenter =
    mappedPosts.length > 0
      ? ([mappedPosts[0].lat, mappedPosts[0].lng] as [number, number])
      : ([-6.2088, 106.8456] as [number, number]);

  const canClaim = user?.role === 'community' || user?.role === 'admin';

  const totalPages = Math.ceil(mappedPosts.length / itemsPerPage);
  const paginatedPosts = mappedPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:flex-row items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari makanan atau restoran..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4 text-emerald-600" />
              Data Live
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

      <div className="max-w-7xl mx-auto w-full px-4 pt-6 sm:px-6">
        {feedbackMessage && (
          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedbackMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-[2000px] mx-auto w-full">
        <div
          className={`
            flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar
            ${viewMode === 'map' ? 'hidden' : 'block'}
            ${viewMode === 'split' ? 'md:w-1/2 lg:w-[480px] xl:w-[540px]' : 'w-full'}
          `}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Pasar Makanan</h1>
            <p className="text-slate-500 text-sm">
              Temukan stok pangan berlebih yang tersedia untuk diselamatkan hari ini.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 grid-cols-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-80 rounded-2xl border border-slate-200 bg-white animate-pulse"
                />
              ))}
            </div>
          ) : mappedPosts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <h3 className="text-lg font-bold text-slate-900">Belum ada stok tersedia</h3>
              <p className="mt-2 text-sm text-slate-500">
                Coba kata kunci lain atau tambahkan food post baru dari dashboard restoran.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className={`grid gap-4 sm:gap-6 ${viewMode === 'list' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {paginatedPosts.map((food) => {
                  const isInCart = cartItems.some(item => item.id === food.id);
                  return (
                    <FoodCard
                      key={food.id}
                      food={food}
                      actionLabel={
                        isInCart ? 'Sudah di Keranjang' : (user ? 'Tambah ke Keranjang' : 'Login untuk Klaim')
                      }
                      actionDisabled={isInCart || !user}
                      onAction={() => {
                        if (user) {
                          handleAddToCart(food);
                        }
                      }}
                    />
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors"
                  >
                    Prev
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          currentPage === i + 1
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`
            flex-1 p-4 sm:p-6 md:pl-0 h-[500px] md:h-auto
            ${viewMode === 'list' ? 'hidden' : 'block'}
            ${viewMode === 'split' ? 'md:w-1/2' : 'w-full'}
            sticky top-[73px]
          `}
        >
          <MapView posts={mappedPosts} center={mapCenter} />
        </div>
      </div>

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
