'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  History,
  Inbox,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Utensils,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getEchoClient } from '@/lib/reverbClient';
import {
  getDashboardAnalytics,
  type DashboardAnalytics,
  type DashboardStatTone,
} from '@/services/dashboardService';
import {
  getVerificationDocument,
  getVerificationUsers,
  verifyUser,
} from '@/services/authService';
import {
  createFoodPost,
  getIncomingClaims,
  getMyClaims,
  getMyFoodPosts,
  updateClaimStatus,
  updateFoodPost,
  type FoodPostPayload,
  type MarketplaceClaim,
  type MarketplaceFoodPost,
} from '@/services/marketplaceService';

const LocationPicker = dynamic(() => import('@/components/marketplace/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-slate-100 flex items-center justify-center rounded-xl animate-pulse">
      <p className="text-slate-400 font-medium">Memuat peta lokasi...</p>
    </div>
  ),
});

type VerificationStatus = 'pending' | 'verified' | 'rejected';
type VerificationFilter = VerificationStatus | 'all';
type FoodPostStatus = 'available' | 'claimed' | 'completed' | 'expired';

type VerificationUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  profile?: {
    name?: string;
    address?: string;
    verification_status?: VerificationStatus;
    document_url?: string | null;
  } | null;
};

type VerificationCounts = {
  pending: number;
  verified: number;
  rejected: number;
};

type DocumentPreview = {
  fileName: string;
  url: string;
  userName: string;
};

type FoodPostFormState = {
  title: string;
  description: string;
  quantity: string;
  quantity_unit: string;
  pickup_address: string;
  lat: string;
  long: string;
  available_until: string;
  image_url: string;
  image_file: File | null;
};

const statusConfig: Record<
  VerificationStatus,
  {
    badge: string;
    wrapper: string;
    iconWrapper: string;
    icon: typeof Clock;
    title: string;
    description: string;
  }
> = {
  pending: {
    badge: 'Status: Pending',
    wrapper: 'bg-amber-50 border-amber-100 text-amber-800',
    iconWrapper: 'bg-amber-100 text-amber-600',
    icon: Clock,
    title: 'Akun Menunggu Verifikasi',
    description:
      'Dokumen Anda sedang ditinjau oleh tim kami. Anda tetap bisa melihat dashboard, namun fitur utama akan aktif setelah akun terverifikasi.',
  },
  verified: {
    badge: 'Status: Verified',
    wrapper: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    iconWrapper: 'bg-emerald-100 text-emerald-600',
    icon: ShieldCheck,
    title: 'Akun Sudah Terverifikasi',
    description:
      'Akun Anda sudah aktif penuh. Anda bisa menggunakan seluruh fitur yang tersedia di dashboard.',
  },
  rejected: {
    badge: 'Status: Rejected',
    wrapper: 'bg-rose-50 border-rose-100 text-rose-800',
    iconWrapper: 'bg-rose-100 text-rose-600',
    icon: XCircle,
    title: 'Verifikasi Perlu Diperbarui',
    description:
      'Dokumen akun Anda belum dapat disetujui. Silakan periksa kembali dokumen yang dikirim dan hubungi admin untuk pengajuan ulang.',
  },
};

const filterLabels: Record<VerificationFilter, string> = {
  all: 'Semua',
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  restaurant: 'Restoran',
  community: 'Komunitas',
};

function formatRole(role: string) {
  return roleLabels[role] ?? role;
}

function formatDate(value?: string) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value);
}

function formatDateTimeLocal(value?: string) {
  if (!value) {
    const nextFourHours = new Date(Date.now() + 4 * 60 * 60 * 1000);
    return nextFourHours.toISOString().slice(0, 16);
  }

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function formatFoodPostStatus(status: FoodPostStatus) {
  const config: Record<FoodPostStatus, string> = {
    available: 'Tersedia',
    claimed: 'Sudah Diklaim',
    completed: 'Selesai',
    expired: 'Kedaluwarsa',
  };

  return config[status];
}

function formatFoodPostExpiry(value: string) {
  const targetTime = new Date(value).getTime();
  const diffInMs = targetTime - Date.now();

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

function formatClaimStatus(status: MarketplaceClaim['status']) {
  const config: Record<MarketplaceClaim['status'], string> = {
    pending: 'Menunggu Diproses',
    approved: 'Disetujui',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    rejected: 'Ditolak',
  };

  return config[status];
}

function getToneClasses(tone: DashboardStatTone) {
  const tones: Record<DashboardStatTone, { surface: string; text: string; bar: string }> = {
    emerald: {
      surface: 'bg-emerald-50 text-emerald-700',
      text: 'text-emerald-600',
      bar: 'bg-emerald-500',
    },
    amber: {
      surface: 'bg-amber-50 text-amber-700',
      text: 'text-amber-600',
      bar: 'bg-amber-500',
    },
    blue: {
      surface: 'bg-blue-50 text-blue-700',
      text: 'text-blue-600',
      bar: 'bg-blue-500',
    },
    purple: {
      surface: 'bg-purple-50 text-purple-700',
      text: 'text-purple-600',
      bar: 'bg-purple-500',
    },
    rose: {
      surface: 'bg-rose-50 text-rose-700',
      text: 'text-rose-600',
      bar: 'bg-rose-500',
    },
    sky: {
      surface: 'bg-sky-50 text-sky-700',
      text: 'text-sky-600',
      bar: 'bg-sky-500',
    },
    slate: {
      surface: 'bg-slate-100 text-slate-700',
      text: 'text-slate-600',
      bar: 'bg-slate-500',
    },
  };

  return tones[tone];
}

export default function DashboardPage() {
  const { user, token, loading, logout, checkAuth } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [verificationUsers, setVerificationUsers] = useState<VerificationUser[]>([]);
  const [verificationCounts, setVerificationCounts] = useState<VerificationCounts>({
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [dashboardAnalytics, setDashboardAnalytics] = useState<DashboardAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('pending');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [documentPreview, setDocumentPreview] = useState<DocumentPreview | null>(null);
  const [myFoodPosts, setMyFoodPosts] = useState<MarketplaceFoodPost[]>([]);
  const [foodPostsLoading, setFoodPostsLoading] = useState(false);
  const [foodPostsError, setFoodPostsError] = useState('');
  const [foodPostFeedback, setFoodPostFeedback] = useState('');
  const [foodPostActionId, setFoodPostActionId] = useState<number | null>(null);
  const [showCreateFoodPostForm, setShowCreateFoodPostForm] = useState(false);
  const [submittingFoodPost, setSubmittingFoodPost] = useState(false);
  const [myClaims, setMyClaims] = useState<MarketplaceClaim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState('');
  const [claimsFeedback, setClaimsFeedback] = useState('');
  const [claimActionId, setClaimActionId] = useState<number | null>(null);
  const [incomingClaims, setIncomingClaims] = useState<MarketplaceClaim[]>([]);
  const [incomingClaimsLoading, setIncomingClaimsLoading] = useState(false);
  const [incomingClaimsError, setIncomingClaimsError] = useState('');
  const [incomingClaimActionId, setIncomingClaimActionId] = useState<number | null>(null);
  const [incomingClaimFeedback, setIncomingClaimFeedback] = useState('');
  const [foodPostForm, setFoodPostForm] = useState<FoodPostFormState>({
    title: '',
    description: '',
    quantity: '1',
    quantity_unit: 'porsi',
    pickup_address: '',
    lat: '',
    long: '',
    available_until: formatDateTimeLocal(),
    image_url: '',
    image_file: null,
  });

  const loadDashboardOverviewAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError('');
      const data = await getDashboardAnalytics();
      setDashboardAnalytics(data);
    } catch {
      setAnalyticsError('Gagal memuat analytics dashboard.');
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const loadAllVerifications = useCallback(async () => {
    const data = await getVerificationUsers(verificationFilter);
    setVerificationUsers(data.users ?? []);

    const allData =
      verificationFilter === 'all' ? data : await getVerificationUsers('all');

    setVerificationCounts(
      allData.counts ?? { pending: 0, verified: 0, rejected: 0 }
    );
  }, [verificationFilter]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Realtime updates via Reverb
  useEffect(() => {
    if (!user || !token) return;

    const echo = getEchoClient(token);

    // 1. Listen for user-specific verification updates
    const userChannel = echo.private(`user.${user.id}`);
    userChannel.listen('.user.verification.updated', (data: unknown) => {
      console.log('User verification updated (realtime):', data);
      void checkAuth(); // Refresh user object in context
    });

    // 2. Listen for admin-wide updates
    if (user.role === 'admin') {
      const adminChannel = echo.private('admin');
      
      adminChannel.listen('.user.verification.updated', (data: unknown) => {
        console.log('Admin: User verification updated (realtime):', data);
        void loadAllVerifications();
        void loadDashboardOverviewAnalytics();
      });

      adminChannel.listen('.user.registered', (data: unknown) => {
        console.log('Admin: New user registered (realtime):', data);
        void loadAllVerifications();
        void loadDashboardOverviewAnalytics();
      });

      return () => {
        userChannel.stopListening('.user.verification.updated');
        adminChannel.stopListening('.user.verification.updated');
        adminChannel.stopListening('.user.registered');
      };
    }

    return () => {
      userChannel.stopListening('.user.verification.updated');
    };
  }, [user, token, checkAuth, loadAllVerifications, loadDashboardOverviewAnalytics]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboardOverviewAnalytics();
  }, [user, loadDashboardOverviewAnalytics]);

  useEffect(() => {
    if (!user || !isAdmin) {
      return;
    }

    const loadVerificationUsers = async () => {
      setVerificationLoading(true);
      setVerificationError('');

      try {
        const data = await getVerificationUsers(verificationFilter);
        setVerificationUsers(data.users ?? []);

        if (verificationFilter === 'all') {
          setVerificationCounts(
            data.counts ?? { pending: 0, verified: 0, rejected: 0 }
          );
        } else {
          const allData = await getVerificationUsers('all');
          setVerificationCounts(
            allData.counts ?? { pending: 0, verified: 0, rejected: 0 }
          );
        }
      } catch {
        setVerificationError('Gagal memuat antrean verifikasi.');
      } finally {
        setVerificationLoading(false);
      }
    };

    void loadVerificationUsers();
  }, [user, isAdmin, verificationFilter]);

  useEffect(() => {
    if (!user || user.role !== 'restaurant') {
      return;
    }

    const loadRestaurantFoodPosts = async () => {
      setFoodPostsLoading(true);
      setFoodPostsError('');

      try {
        const data = await getMyFoodPosts();
        setMyFoodPosts(data.food_posts ?? []);
      } catch {
        setFoodPostsError('Gagal memuat postingan makanan Anda.');
      } finally {
        setFoodPostsLoading(false);
      }
    };

    void loadRestaurantFoodPosts();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'restaurant') {
      return;
    }

    const loadRestaurantIncomingClaims = async () => {
      setIncomingClaimsLoading(true);
      setIncomingClaimsError('');

      try {
        const data = await getIncomingClaims();
        setIncomingClaims(data.claims ?? []);
      } catch {
        setIncomingClaimsError('Gagal memuat klaim masuk untuk restoran Anda.');
      } finally {
        setIncomingClaimsLoading(false);
      }
    };

    void loadRestaurantIncomingClaims();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'community') {
      return;
    }

    const loadCommunityClaims = async () => {
      setClaimsLoading(true);
      setClaimsError('');

      try {
        const data = await getMyClaims();
        setMyClaims(data.claims ?? []);
      } catch {
        setClaimsError('Gagal memuat daftar klaim Anda.');
      } finally {
        setClaimsLoading(false);
      }
    };

    void loadCommunityClaims();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600"></div>
          <p className="font-medium text-slate-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200"></div>
          <p className="font-semibold text-slate-700">Sesi login tidak ditemukan.</p>
          <p className="text-sm text-slate-500">Anda sedang diarahkan kembali ke halaman login.</p>
        </div>
      </div>
    );
  }

  const isRestaurant = user.role === 'restaurant';
  const currentStatus = (user.profile?.verification_status ?? 'pending') as VerificationStatus;
  const currentStatusConfig = statusConfig[currentStatus];
  const StatusIcon = currentStatusConfig.icon;
  const analyticsHeadline = dashboardAnalytics?.headline ?? {
    eyebrow: isAdmin ? 'Control Tower' : isRestaurant ? 'Restaurant Flow' : 'Community Impact',
    title: isAdmin
      ? 'Pantau kesehatan platform dan percepat proses verifikasi pengguna.'
      : isRestaurant
        ? 'Lihat ritme distribusi makanan dan klaim yang sedang berjalan.'
        : 'Pantau progres klaim dan dampak distribusi untuk komunitas Anda.',
    description: isAdmin
      ? 'Semua ringkasan utama akan tampil di sini setelah analytics selesai dimuat.'
      : 'Semua ringkasan utama akan tampil di sini setelah analytics selesai dimuat.',
  };
  const analyticsStats = dashboardAnalytics?.stats ?? [];
  const analyticsHighlights = dashboardAnalytics?.highlights ?? [];
  const analyticsSeries = dashboardAnalytics?.chart.series ?? [];
  const analyticsPeak = Math.max(...analyticsSeries.map((point) => point.value), 1);
  const pendingVerificationUsers = verificationUsers
    .filter((verificationUser) => verificationUser.profile?.verification_status === 'pending')
    .slice(0, 3);

  const closeDocumentPreview = () => {
    setDocumentPreview((currentPreview) => {
      if (currentPreview) {
        window.URL.revokeObjectURL(currentPreview.url);
      }

      return null;
    });
  };

  const handleOpenDocument = async (verificationUser: VerificationUser) => {
    try {
      setActionUserId(verificationUser.id);
      const blob = await getVerificationDocument(verificationUser.id);
      const url = window.URL.createObjectURL(blob);

      setDocumentPreview((currentPreview) => {
        if (currentPreview) {
          window.URL.revokeObjectURL(currentPreview.url);
        }

        return {
          fileName:
            verificationUser.profile?.document_url?.split('/').pop() || 'dokumen-verifikasi',
          url,
          userName: verificationUser.profile?.name || verificationUser.name,
        };
      });
    } catch {
      setVerificationError('Dokumen gagal dibuka. Pastikan file sudah tersedia.');
    } finally {
      setActionUserId(null);
    }
  };

  const handleVerificationAction = async (
    userId: number,
    status: 'verified' | 'rejected'
  ) => {
    try {
      setActionUserId(userId);
      await verifyUser(userId, status);
      await loadAllVerifications();
    } catch {
      setVerificationError('Status verifikasi gagal diperbarui.');
    } finally {
      setActionUserId(null);
    }
  };

  const loadMyRestaurantFoodPosts = async () => {
    try {
      setFoodPostsLoading(true);
      setFoodPostsError('');
      const data = await getMyFoodPosts();
      setMyFoodPosts(data.food_posts ?? []);
    } catch {
      setFoodPostsError('Gagal memuat postingan makanan Anda.');
    } finally {
      setFoodPostsLoading(false);
    }
  };

  const loadIncomingRestaurantClaims = async () => {
    try {
      setIncomingClaimsLoading(true);
      setIncomingClaimsError('');
      const data = await getIncomingClaims();
      setIncomingClaims(data.claims ?? []);
    } catch {
      setIncomingClaimsError('Gagal memuat klaim masuk untuk restoran Anda.');
    } finally {
      setIncomingClaimsLoading(false);
    }
  };

  const loadCommunityClaims = async () => {
    try {
      setClaimsLoading(true);
      setClaimsError('');
      const data = await getMyClaims();
      setMyClaims(data.claims ?? []);
    } catch {
      setClaimsError('Gagal memuat daftar klaim Anda.');
    } finally {
      setClaimsLoading(false);
    }
  };

  const handleFoodPostFormChange = (
    field: keyof FoodPostFormState,
    value: string | File | null
  ) => {
    setFoodPostForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const resetFoodPostForm = () => {
    setFoodPostForm({
      title: '',
      description: '',
      quantity: '1',
      quantity_unit: 'porsi',
      pickup_address: user.profile?.address || '',
      lat: '',
      long: '',
      available_until: formatDateTimeLocal(),
      image_url: '',
      image_file: null,
    });
  };

  const openCreateFoodPostForm = () => {
    setFoodPostForm((currentForm) => ({
      ...currentForm,
      pickup_address: currentForm.pickup_address || user.profile?.address || '',
      available_until: currentForm.available_until || formatDateTimeLocal(),
    }));
    setShowCreateFoodPostForm(true);
  };

  const handleCreateFoodPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFoodPostFeedback('');
    setFoodPostsError('');

    try {
      setSubmittingFoodPost(true);

      const formData = new FormData();
      formData.append('title', foodPostForm.title);
      if (foodPostForm.description) formData.append('description', foodPostForm.description);
      formData.append('quantity', foodPostForm.quantity);
      formData.append('quantity_unit', foodPostForm.quantity_unit);
      formData.append('pickup_address', foodPostForm.pickup_address);
      if (foodPostForm.lat) formData.append('lat', foodPostForm.lat);
      if (foodPostForm.long) formData.append('long', foodPostForm.long);
      formData.append('available_until', new Date(foodPostForm.available_until).toISOString());
      if (foodPostForm.image_file) {
        formData.append('image', foodPostForm.image_file);
      } else if (foodPostForm.image_url) {
        formData.append('image_url', foodPostForm.image_url);
      }

      await createFoodPost(formData);
      await Promise.all([loadMyRestaurantFoodPosts(), loadDashboardOverviewAnalytics()]);
      setFoodPostFeedback('Food post berhasil dibuat dan sudah tampil di marketplace.');
      setShowCreateFoodPostForm(false);
      resetFoodPostForm();
    } catch (createError: unknown) {
      if (
        createError &&
        typeof createError === 'object' &&
        'response' in createError &&
        createError.response &&
        typeof createError.response === 'object' &&
        'data' in createError.response
      ) {
        const responseError = createError as {
          response?: { data?: { message?: string } };
        };
        setFoodPostsError(
          responseError.response?.data?.message || 'Food post gagal dibuat.'
        );
      } else {
        setFoodPostsError('Food post gagal dibuat.');
      }
    } finally {
      setSubmittingFoodPost(false);
    }
  };

  const handleUpdateFoodPostStatus = async (
    foodPostId: number,
    status: FoodPostStatus
  ) => {
    try {
      setFoodPostActionId(foodPostId);
      setFoodPostFeedback('');
      setFoodPostsError('');
      await updateFoodPost(foodPostId, { status });
      await Promise.all([loadMyRestaurantFoodPosts(), loadDashboardOverviewAnalytics()]);
      setFoodPostFeedback(`Status food post berhasil diubah menjadi ${formatFoodPostStatus(status)}.`);
    } catch {
      setFoodPostsError('Status food post gagal diperbarui.');
    } finally {
      setFoodPostActionId(null);
    }
  };

  const handleIncomingClaimStatus = async (
    claimId: number,
    status: 'approved' | 'rejected' | 'completed'
  ) => {
    try {
      setIncomingClaimActionId(claimId);
      setIncomingClaimsError('');
      setIncomingClaimFeedback('');
      await updateClaimStatus(claimId, status);
      await Promise.all([
        loadIncomingRestaurantClaims(),
        loadMyRestaurantFoodPosts(),
        loadDashboardOverviewAnalytics(),
      ]);
      setIncomingClaimFeedback(
        status === 'approved'
          ? 'Klaim berhasil disetujui.'
          : status === 'rejected'
          ? 'Klaim berhasil ditolak.'
          : 'Pickup berhasil ditandai selesai.'
      );
    } catch {
      setIncomingClaimsError('Klaim gagal diproses.');
    } finally {
      setIncomingClaimActionId(null);
    }
  };

  const handleCommunityClaimStatus = async (
    claimId: number,
    status: 'cancelled'
  ) => {
    try {
      setClaimActionId(claimId);
      setClaimsError('');
      setClaimsFeedback('');
      await updateClaimStatus(claimId, status);
      await Promise.all([loadCommunityClaims(), loadDashboardOverviewAnalytics()]);
      setClaimsFeedback('Klaim berhasil dibatalkan dan stok dibuka kembali.');
    } catch {
      setClaimsError('Klaim gagal diperbarui.');
    } finally {
      setClaimActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
              S
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-slate-900">
              Optimizer
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5" />
              Ringkasan
            </span>
          </button>

          {isAdmin ? (
            <button
              onClick={() => setActiveTab('verification')}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                activeTab === 'verification'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                Verifikasi User
              </span>
            </button>
          ) : isRestaurant ? (
            <>
              <button
                onClick={() => setActiveTab('posts')}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  activeTab === 'posts'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Utensils className="h-5 w-5" />
                  Kelola Makanan
                </span>
              </button>

              <button
                onClick={() => setActiveTab('incoming-claims')}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  activeTab === 'incoming-claims'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Inbox className="h-5 w-5" />
                  Klaim Masuk
                </span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('claims')}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                activeTab === 'claims'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5" />
                Klaim Saya
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-3">
              <History className="h-5 w-5" />
              Riwayat
            </span>
          </button>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-3">
              <Settings className="h-5 w-5" />
              Pengaturan
            </span>
          </button>
          <button
            onClick={logout}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <span className="flex items-center gap-3">
              <LogOut className="h-5 w-5" />
              Keluar
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeTab === 'overview' && (
          <>
            <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">Halo, {user.name}!</h1>
                <p className="text-slate-500">
                  {isAdmin
                    ? 'Kelola antrean verifikasi dan pantau status akun pengguna dari satu dashboard.'
                    : `Selamat datang kembali di dashboard ${
                        isRestaurant ? 'Restoran' : 'Komunitas'
                      } Anda.`}
                </p>
              </div>

              {!isAdmin && isRestaurant && currentStatus === 'verified' && (
                <button
                  onClick={() => setActiveTab('posts')}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700"
                >
                  <PlusCircle className="h-5 w-5" />
                  Post Makanan Baru
                </button>
              )}
            </header>

            {!isAdmin && currentStatus !== 'verified' && (
              <div className={`mb-8 rounded-2xl border p-6 ${currentStatusConfig.wrapper}`}>
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${currentStatusConfig.iconWrapper}`}
                  >
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold">{currentStatusConfig.title}</h3>
                    <p className="mb-3 text-sm">{currentStatusConfig.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        {currentStatusConfig.badge}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        Dokumen: {user.profile?.document_url ? 'Tersedia' : 'Belum ada'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8 overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/80 to-sky-50 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white">
                    {analyticsHeadline.eyebrow}
                  </span>
                  <h2 className="mt-4 text-2xl font-bold text-slate-950 sm:text-3xl">
                    {analyticsHeadline.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    {analyticsHeadline.description}
                  </p>
                </div>

                <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
                  {analyticsHighlights.length > 0 ? (
                    analyticsHighlights.map((highlight) => (
                      <div
                        key={highlight.label}
                        className="rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {highlight.label}
                        </p>
                        <p className="mt-3 text-3xl font-bold text-slate-950">
                          {formatNumber(highlight.value)}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {highlight.caption}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500 sm:col-span-2">
                      Insight dampak akan tampil otomatis setelah aktivitas mulai tercatat.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {analyticsError && (
              <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
                <p>{analyticsError}</p>
                <button
                  onClick={() => void loadDashboardOverviewAnalytics()}
                  className="rounded-xl bg-white px-4 py-2 font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-100"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {analyticsLoading && !dashboardAnalytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`analytics-skeleton-${index}`}
                      className="h-36 animate-pulse rounded-3xl border border-slate-200 bg-white"
                    ></div>
                  ))}
                </div>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
                  <div className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white"></div>
                  <div className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {analyticsStats.map((stat) => {
                    const toneClasses = getToneClasses(stat.tone);

                    return (
                      <article
                        key={stat.label}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                              {stat.label}
                            </p>
                            <p className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
                              {formatNumber(stat.value)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-bold ${toneClasses.surface}`}
                          >
                            {String(stat.label).slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-5">
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${toneClasses.bar}`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(18, stat.value === 0 ? 18 : stat.value * 12)
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <p className={`mt-3 text-sm font-medium ${toneClasses.text}`}>
                            Ringkasan otomatis dari aktivitas {isAdmin ? 'platform' : 'Anda'} saat
                            ini.
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Analytics Trend
                        </p>
                        <h3 className="mt-2 text-xl font-bold text-slate-950">
                          {dashboardAnalytics?.chart.title ?? 'Aktivitas 6 bulan terakhir'}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Pola aktivitas utama ditampilkan ringkas agar mudah dipantau dari ponsel
                          sampai layar desktop.
                        </p>
                      </div>
                      <button
                        onClick={() => void loadDashboardOverviewAnalytics()}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                      >
                        Muat Ulang
                      </button>
                    </div>

                    <div className="mt-8 overflow-x-auto pb-2">
                      <div className="flex min-w-[340px] items-end gap-3 sm:gap-4">
                        {analyticsSeries.length > 0 ? (
                          analyticsSeries.map((point) => {
                            const barHeight =
                              point.value === 0
                                ? 0
                                : Math.max(12, (point.value / analyticsPeak) * 100);

                            return (
                              <div key={point.label} className="flex min-h-[240px] flex-1 flex-col">
                                <div className="mb-3 text-center text-sm font-semibold text-slate-700">
                                  {formatNumber(point.value)}
                                </div>
                                <div className="relative flex-1 rounded-[24px] bg-slate-100">
                                  <div
                                    className="absolute inset-x-0 bottom-0 rounded-[24px] bg-gradient-to-t from-emerald-500 via-emerald-400 to-sky-400 shadow-lg shadow-emerald-100"
                                    style={{ height: `${barHeight}%` }}
                                  ></div>
                                </div>
                                <div className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                  {point.label}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex min-h-[240px] w-full items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
                            Grafik akan aktif setelah ada histori data yang cukup untuk
                            divisualisasikan.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        {dashboardAnalytics?.chart.series_label ?? 'Aktivitas'}
                      </span>
                      <span>Periode: 6 bulan terakhir</span>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    {isAdmin ? (
                      verificationLoading ? (
                        <div className="space-y-4">
                          <div className="h-6 w-40 animate-pulse rounded bg-slate-100"></div>
                          <div className="h-24 animate-pulse rounded-2xl bg-slate-100"></div>
                          <div className="h-24 animate-pulse rounded-2xl bg-slate-100"></div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                Quick Queue
                              </p>
                              <h3 className="mt-2 text-xl font-bold text-slate-950">
                                Antrean verifikasi prioritas
                              </h3>
                            </div>
                            <button
                              onClick={() => setActiveTab('verification')}
                              className="text-sm font-semibold text-emerald-600 hover:underline"
                            >
                              Buka panel
                            </button>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              Pending: {formatNumber(verificationCounts.pending)}
                            </span>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Verified: {formatNumber(verificationCounts.verified)}
                            </span>
                            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                              Rejected: {formatNumber(verificationCounts.rejected)}
                            </span>
                          </div>

                          <div className="mt-6 space-y-4">
                            {pendingVerificationUsers.length > 0 ? (
                              pendingVerificationUsers.map((verificationUser) => (
                                <article
                                  key={verificationUser.id}
                                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                  <div className="flex flex-col gap-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-semibold text-slate-950">
                                          {verificationUser.profile?.name || verificationUser.name}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                          {verificationUser.email} | {formatRole(verificationUser.role)}
                                        </p>
                                      </div>
                                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-amber-700">
                                        Pending
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => void handleOpenDocument(verificationUser)}
                                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:ring-emerald-200 hover:text-emerald-700"
                                    >
                                      <Eye className="h-4 w-4" />
                                      Lihat dokumen
                                    </button>
                                  </div>
                                </article>
                              ))
                            ) : (
                              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                                Tidak ada antrean pending saat ini.
                              </div>
                            )}
                          </div>
                        </>
                      )
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Quick Actions
                            </p>
                            <h3 className="mt-2 text-xl font-bold text-slate-950">
                              {isRestaurant
                                ? 'Prioritas restoran hari ini'
                                : 'Prioritas komunitas hari ini'}
                            </h3>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                            Live
                          </span>
                        </div>

                        <div className="mt-6 space-y-4">
                          {analyticsHighlights.length > 0 ? (
                            analyticsHighlights.map((highlight) => (
                              <article
                                key={highlight.label}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                              >
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                  {highlight.label}
                                </p>
                                <p className="mt-3 text-3xl font-bold text-slate-950">
                                  {formatNumber(highlight.value)}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                  {highlight.caption}
                                </p>
                              </article>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                              Insight tambahan akan muncul setelah Anda mulai beraktivitas.
                            </div>
                          )}
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          {isRestaurant ? (
                            <>
                              <button
                                onClick={() => setActiveTab('posts')}
                                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Kelola Food Post
                              </button>
                              <button
                                onClick={() => setActiveTab('incoming-claims')}
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                              >
                                Lihat Klaim Masuk
                              </button>
                            </>
                          ) : (
                            <>
                              <Link
                                href="/marketplace"
                                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Buka Marketplace
                              </Link>
                              <button
                                onClick={() => setActiveTab('claims')}
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                              >
                                Lihat Klaim Saya
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </section>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'verification' && isAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">Verifikasi Pengguna</h1>
                <p className="text-slate-500">
                  Buka dokumen, cek detail akun, lalu setujui atau tolak pengajuan.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(Object.keys(filterLabels) as VerificationFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setVerificationFilter(filter)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      verificationFilter === filter
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-emerald-700'
                    }`}
                  >
                    {filterLabels[filter]}
                  </button>
                ))}
              </div>
            </div>

            {verificationError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {verificationError}
              </div>
            )}

            {verificationLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-emerald-600"></div>
                <p className="text-sm text-slate-500">Memuat antrean verifikasi...</p>
              </div>
            ) : verificationUsers.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-slate-900">Tidak ada data untuk filter ini</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Coba ganti filter atau tunggu pengajuan baru masuk.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {verificationUsers.map((verificationUser) => {
                  const verificationStatus =
                    verificationUser.profile?.verification_status ?? 'pending';

                  return (
                    <article
                      key={verificationUser.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-4">
                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                                {formatRole(verificationUser.role)}
                              </span>
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                  verificationStatus === 'verified'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : verificationStatus === 'rejected'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {verificationStatus}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {verificationUser.profile?.name || verificationUser.name}
                            </h3>
                            <p className="text-sm text-slate-500">{verificationUser.email}</p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Alamat
                              </p>
                              <p className="mt-1 text-sm text-slate-700">
                                {verificationUser.profile?.address || '-'}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Dibuat
                              </p>
                              <p className="mt-1 text-sm text-slate-700">
                                {formatDate(verificationUser.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex w-full max-w-sm flex-col gap-3">
                          <button
                            onClick={() => void handleOpenDocument(verificationUser)}
                            disabled={
                              actionUserId === verificationUser.id ||
                              !verificationUser.profile?.document_url
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-60"
                          >
                            <Eye className="h-4 w-4" />
                            {actionUserId === verificationUser.id
                              ? 'Membuka dokumen...'
                              : verificationUser.profile?.document_url
                              ? 'Lihat Dokumen'
                              : 'Dokumen belum ada'}
                          </button>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <button
                              onClick={() =>
                                void handleVerificationAction(verificationUser.id, 'verified')
                              }
                              disabled={
                                actionUserId === verificationUser.id ||
                                verificationStatus === 'verified'
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Setujui
                            </button>

                            <button
                              onClick={() =>
                                void handleVerificationAction(verificationUser.id, 'rejected')
                              }
                              disabled={
                                actionUserId === verificationUser.id ||
                                verificationStatus === 'rejected'
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <XCircle className="h-4 w-4" />
                              Tolak
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && isRestaurant && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">Kelola Makanan</h1>
                <p className="text-slate-500">
                  Daftar makanan yang Anda posting ke marketplace.
                </p>
              </div>
              {currentStatus === 'verified' && (
                <button
                  onClick={() => {
                    if (showCreateFoodPostForm) {
                      setShowCreateFoodPostForm(false);
                    } else {
                      openCreateFoodPostForm();
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700"
                >
                  <PlusCircle className="h-5 w-5" />
                  {showCreateFoodPostForm ? 'Tutup Form' : 'Tambah Post Baru'}
                </button>
              )}
            </div>

            {foodPostFeedback && (
              <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {foodPostFeedback}
              </div>
            )}

            {foodPostsError && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {foodPostsError}
              </div>
            )}

            {currentStatus !== 'verified' && (
              <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-5 text-amber-800">
                <h3 className="font-bold">Posting belum dapat diaktifkan</h3>
                <p className="mt-1 text-sm">
                  Akun restoran Anda masih menunggu verifikasi. Setelah status berubah menjadi verified, Anda bisa menambah dan mengaktifkan stok makanan di marketplace.
                </p>
              </div>
            )}

            {showCreateFoodPostForm && currentStatus === 'verified' && (
              <form
                onSubmit={handleCreateFoodPost}
                className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Buat Food Post Baru</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Informasi ini akan langsung tampil di marketplace setelah disimpan.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Restoran Verified
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Judul makanan</label>
                    <input
                      type="text"
                      required
                      value={foodPostForm.title}
                      onChange={(event) => handleFoodPostFormChange('title', event.target.value)}
                      placeholder="Contoh: Nasi Box Acara Pagi"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Deskripsi singkat</label>
                    <textarea
                      value={foodPostForm.description}
                      onChange={(event) => handleFoodPostFormChange('description', event.target.value)}
                      placeholder="Jelaskan kondisi makanan, waktu pickup, atau catatan penting lainnya."
                      className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Jumlah</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={foodPostForm.quantity}
                      onChange={(event) => handleFoodPostFormChange('quantity', event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Satuan</label>
                    <input
                      type="text"
                      required
                      value={foodPostForm.quantity_unit}
                      onChange={(event) => handleFoodPostFormChange('quantity_unit', event.target.value)}
                      placeholder="box / porsi / pcs"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Alamat pengambilan</label>
                    <input
                      type="text"
                      required
                      value={foodPostForm.pickup_address}
                      onChange={(event) => handleFoodPostFormChange('pickup_address', event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Titik Lokasi Pengambilan</label>
                    <LocationPicker
                      initialLat={foodPostForm.lat ? Number(foodPostForm.lat) : undefined}
                      initialLng={foodPostForm.long ? Number(foodPostForm.long) : undefined}
                      onChange={(lat, lng) => {
                        handleFoodPostFormChange('lat', lat.toString());
                        handleFoodPostFormChange('long', lng.toString());
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Tersedia sampai</label>
                    <input
                      type="datetime-local"
                      required
                      value={foodPostForm.available_until}
                      onChange={(event) => handleFoodPostFormChange('available_until', event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Foto Makanan</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        handleFoodPostFormChange('image_file', file);
                      }}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={submittingFoodPost}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingFoodPost ? 'Menyimpan...' : 'Simpan ke Marketplace'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetFoodPostForm();
                      setShowCreateFoodPostForm(false);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}

            {foodPostsLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-48 rounded-2xl border border-slate-200 bg-white animate-pulse"
                  />
                ))}
              </div>
            ) : myFoodPosts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Utensils className="h-10 w-10" />
                </div>
                <h4 className="mb-1 font-bold text-slate-900">Belum Ada Postingan</h4>
                <p className="mx-auto mb-6 max-w-xs text-sm text-slate-500">
                  Mulai bagikan kelebihan makanan Anda untuk membantu komunitas di sekitar.
                </p>
                {currentStatus === 'verified' ? (
                  <button
                    onClick={openCreateFoodPostForm}
                    className="font-bold text-emerald-600 hover:underline"
                  >
                    Buat Postingan Pertama
                  </button>
                ) : (
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
                    Menunggu Verifikasi Akun
                  </p>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {myFoodPosts.map((foodPost) => (
                  <article
                    key={foodPost.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                foodPost.status === 'available'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : foodPost.status === 'claimed'
                                  ? 'bg-blue-50 text-blue-700'
                                  : foodPost.status === 'completed'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {formatFoodPostStatus(foodPost.status)}
                            </span>
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                              {foodPost.quantity} {foodPost.quantity_unit}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900">{foodPost.title}</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            {foodPost.description || 'Belum ada deskripsi tambahan untuk postingan ini.'}
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Pickup
                            </p>
                            <p className="mt-1 text-sm text-slate-700">{foodPost.pickup_address}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Berakhir
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {formatFoodPostExpiry(foodPost.available_until)}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Dibuat
                            </p>
                            <p className="mt-1 text-sm text-slate-700">{formatDate(foodPost.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full max-w-sm flex-col gap-3">
                        <button
                          onClick={() => void handleUpdateFoodPostStatus(foodPost.id, 'available')}
                          disabled={foodPostActionId === foodPost.id || foodPost.status === 'available'}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Tandai Tersedia
                        </button>
                        <button
                          onClick={() => void handleUpdateFoodPostStatus(foodPost.id, 'completed')}
                          disabled={foodPostActionId === foodPost.id || foodPost.status === 'completed'}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Tandai Selesai
                        </button>
                        <button
                          onClick={() => void handleUpdateFoodPostStatus(foodPost.id, 'expired')}
                          disabled={foodPostActionId === foodPost.id || foodPost.status === 'expired'}
                          className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Tandai Kedaluwarsa
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'incoming-claims' && isRestaurant && (
          <div>
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">Klaim Masuk</h1>
                <p className="text-slate-500">
                  Tinjau permintaan komunitas yang ingin mengambil food post Anda.
                </p>
              </div>
              <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                Pending:{' '}
                {incomingClaims.filter((claim) => claim.status === 'pending').length}
              </div>
            </div>

            {incomingClaimFeedback && (
              <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {incomingClaimFeedback}
              </div>
            )}

            {incomingClaimsError && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {incomingClaimsError}
              </div>
            )}

            {incomingClaimsLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-48 rounded-2xl border border-slate-200 bg-white animate-pulse"
                  />
                ))}
              </div>
            ) : incomingClaims.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Inbox className="h-10 w-10" />
                </div>
                <h4 className="mb-1 font-bold text-slate-900">Belum Ada Klaim Masuk</h4>
                <p className="mx-auto max-w-xs text-sm text-slate-500">
                  Saat komunitas mengklaim stok makanan Anda dari marketplace, datanya akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {incomingClaims.map((claim) => (
                  <article
                    key={claim.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                claim.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : claim.status === 'completed'
                                  ? 'bg-slate-100 text-slate-700'
                                  : claim.status === 'rejected' || claim.status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {formatClaimStatus(claim.status)}
                            </span>
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                              {claim.quantity} {claim.food_post.quantity_unit}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {claim.food_post.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Pengklaim:{' '}
                            {claim.user?.profile?.name || claim.user?.name || 'Komunitas'}
                          </p>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            {claim.notes || 'Belum ada catatan tambahan dari komunitas.'}
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Pickup
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {claim.food_post.pickup_address}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Klaim Dibuat
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {formatDate(claim.created_at)}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Status Post
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {formatFoodPostStatus(claim.food_post.status)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full max-w-sm flex-col gap-3">
                        <button
                          onClick={() => void handleIncomingClaimStatus(claim.id, 'approved')}
                          disabled={
                            incomingClaimActionId === claim.id || claim.status !== 'pending'
                          }
                          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Setujui Klaim
                        </button>
                        <button
                          onClick={() => void handleIncomingClaimStatus(claim.id, 'rejected')}
                          disabled={
                            incomingClaimActionId === claim.id || claim.status !== 'pending'
                          }
                          className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Tolak Klaim
                        </button>
                        <button
                          onClick={() => void handleIncomingClaimStatus(claim.id, 'completed')}
                          disabled={
                            incomingClaimActionId === claim.id || claim.status !== 'approved'
                          }
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Tandai Pickup Selesai
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'claims' && !isRestaurant && !isAdmin && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-950">Klaim Saya</h1>
              <p className="text-slate-500">Daftar makanan yang sedang Anda klaim.</p>
            </div>

            {claimsError && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {claimsError}
              </div>
            )}

            {claimsFeedback && (
              <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {claimsFeedback}
              </div>
            )}

            {claimsLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-44 rounded-2xl border border-slate-200 bg-white animate-pulse"
                  />
                ))}
              </div>
            ) : myClaims.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <h4 className="mb-1 font-bold text-slate-900">Belum Ada Klaim</h4>
                <p className="mx-auto mb-6 max-w-xs text-sm text-slate-500">
                  Jelajahi marketplace untuk menemukan makanan gratis yang tersedia di sekitar Anda.
                </p>
                <Link href="/marketplace" className="font-bold text-emerald-600 hover:underline">
                  Cari Makanan Sekarang
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {myClaims.map((claim) => (
                  <article
                    key={claim.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                claim.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : claim.status === 'completed'
                                  ? 'bg-slate-100 text-slate-700'
                                  : claim.status === 'rejected' || claim.status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {formatClaimStatus(claim.status)}
                            </span>
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                              {claim.quantity} {claim.food_post.quantity_unit}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {claim.food_post.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {claim.food_post.user.profile?.name || claim.food_post.user.name}
                          </p>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            {claim.notes || 'Belum ada catatan tambahan untuk klaim ini.'}
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Pickup
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {claim.food_post.pickup_address}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Klaim Dibuat
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {formatDate(claim.created_at)}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Batas Ambil
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {formatFoodPostExpiry(claim.food_post.available_until)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="font-semibold text-slate-900">Ringkasan Klaim</h4>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <div className="flex items-center justify-between gap-4">
                            <span>Jumlah</span>
                            <span className="font-semibold text-slate-900">
                              {claim.quantity} {claim.food_post.quantity_unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span>Status food post</span>
                            <span className="font-semibold text-slate-900">
                              {formatFoodPostStatus(claim.food_post.status)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span>Restoran asal</span>
                            <span className="text-right font-semibold text-slate-900">
                              {claim.food_post.user.profile?.name || claim.food_post.user.name}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => void handleCommunityClaimStatus(claim.id, 'cancelled')}
                            disabled={claimActionId === claim.id || claim.status !== 'pending'}
                            className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {claimActionId === claim.id ? 'Memproses...' : 'Batalkan Klaim'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-950">Riwayat Aktivitas</h1>
              <p className="text-slate-500">
                {isAdmin
                  ? 'Riwayat perubahan status dan aktivitas verifikasi akan tampil di sini.'
                  : `Semua histori transaksi ${isRestaurant ? 'donasi' : 'klaim'} Anda.`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <History className="h-10 w-10 text-slate-300" />
              </div>
              <h4 className="mb-1 font-bold text-slate-900">Riwayat Kosong</h4>
              <p className="mx-auto max-w-xs text-sm text-slate-500">
                Belum ada data riwayat yang tercatat di platform SRO.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-950">Pengaturan Akun</h1>
              <p className="text-slate-500">Kelola profil dan preferensi akun Anda.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="space-y-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-slate-500"
                  />
                </div>
                {user.profile?.address && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Alamat
                    </label>
                    <textarea
                      defaultValue={user.profile.address}
                      className="min-h-28 w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-700">Status verifikasi</p>
                      <p className="mt-1">
                        {statusConfig[currentStatus].title}. Dokumen:{' '}
                        {user.profile?.document_url ? 'sudah diunggah' : 'belum tersedia'}.
                      </p>
                    </div>
                  </div>
                </div>
                <button className="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white transition-all hover:bg-emerald-700">
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {documentPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
                  Preview Dokumen
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">
                  {documentPreview.userName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{documentPreview.fileName}</p>
              </div>
              <button
                onClick={closeDocumentPreview}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 p-4">
              <iframe
                src={documentPreview.url}
                title={`Dokumen ${documentPreview.userName}`}
                className="h-full w-full rounded-2xl border border-slate-200 bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
              <p className="text-sm text-slate-500">
                Dokumen ditampilkan dalam popup agar proses verifikasi tetap di halaman ini.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={documentPreview.url}
                  download={documentPreview.fileName}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-emerald-200 hover:text-emerald-700"
                >
                  <FileText className="h-4 w-4" />
                  Unduh
                </a>
                <button
                  onClick={closeDocumentPreview}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
