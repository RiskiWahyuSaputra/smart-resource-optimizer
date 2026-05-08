<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\FoodPost;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardAnalyticsController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json(match ($user->role) {
            'admin' => $this->adminAnalytics(),
            'restaurant' => $this->restaurantAnalytics($user),
            default => $this->communityAnalytics($user),
        });
    }

    protected function adminAnalytics(): array
    {
        $totalUsers = User::query()->whereIn('role', ['restaurant', 'community'])->count();
        $verifiedUsers = User::query()
            ->whereIn('role', ['restaurant', 'community'])
            ->whereHas('profile', fn ($query) => $query->where('verification_status', 'verified'))
            ->count();
        $pendingUsers = User::query()
            ->whereIn('role', ['restaurant', 'community'])
            ->whereHas('profile', fn ($query) => $query->where('verification_status', 'pending'))
            ->count();
        $totalFoodPosts = FoodPost::count();
        $activeClaims = Claim::whereIn('status', ['pending', 'approved'])->count();
        $completedClaims = Claim::where('status', 'completed')->count();
        $rescuedPortions = (int) Claim::where('status', 'completed')->sum('quantity');

        return [
            'headline' => [
                'eyebrow' => 'Control Tower',
                'title' => 'Dampak distribusi pangan di seluruh platform.',
                'description' => 'Pantau verifikasi pengguna, arus stok makanan, dan penyelesaian klaim dalam satu layar.',
            ],
            'stats' => [
                ['label' => 'Total Pengguna', 'value' => $totalUsers, 'tone' => 'sky'],
                ['label' => 'Terverifikasi', 'value' => $verifiedUsers, 'tone' => 'emerald'],
                ['label' => 'Pending Review', 'value' => $pendingUsers, 'tone' => 'amber'],
                ['label' => 'Food Post', 'value' => $totalFoodPosts, 'tone' => 'slate'],
                ['label' => 'Klaim Aktif', 'value' => $activeClaims, 'tone' => 'blue'],
                ['label' => 'Distribusi Selesai', 'value' => $completedClaims, 'tone' => 'purple'],
            ],
            'highlights' => [
                [
                    'label' => 'Porsi Terselamatkan',
                    'value' => $rescuedPortions,
                    'caption' => 'Total porsi yang sudah tercatat selesai dibagikan.',
                ],
            ],
            'chart' => $this->monthlyChart(
                Claim::query(),
                'created_at',
                'Jumlah klaim per bulan',
                'Klaim'
            ),
        ];
    }

    protected function restaurantAnalytics(User $user): array
    {
        $foodPosts = $user->foodPosts();
        $incomingClaims = Claim::whereHas('foodPost', fn ($query) => $query->where('user_id', $user->id));

        $totalPosts = $foodPosts->count();
        $availablePosts = (clone $foodPosts)->where('status', 'available')->count();
        $claimedPosts = (clone $foodPosts)->where('status', 'claimed')->count();
        $completedPosts = (clone $foodPosts)->where('status', 'completed')->count();
        $pendingIncomingClaims = (clone $incomingClaims)->where('status', 'pending')->count();
        $approvedIncomingClaims = (clone $incomingClaims)->where('status', 'approved')->count();
        $rescuedPortions = (int) (clone $incomingClaims)->where('status', 'completed')->sum('quantity');
        $totalPostedPortions = (int) (clone $foodPosts)->sum('quantity');

        return [
            'headline' => [
                'eyebrow' => 'Restaurant Flow',
                'title' => 'Pantau stok, klaim masuk, dan distribusi yang berhasil Anda jalankan.',
                'description' => 'Dashboard ini membantu restoran melihat ritme distribusi makanan berlebih secara cepat.',
            ],
            'stats' => [
                ['label' => 'Food Post', 'value' => $totalPosts, 'tone' => 'slate'],
                ['label' => 'Masih Tersedia', 'value' => $availablePosts, 'tone' => 'emerald'],
                ['label' => 'Sedang Diklaim', 'value' => $claimedPosts, 'tone' => 'blue'],
                ['label' => 'Pickup Selesai', 'value' => $completedPosts, 'tone' => 'purple'],
                ['label' => 'Klaim Pending', 'value' => $pendingIncomingClaims, 'tone' => 'amber'],
                ['label' => 'Klaim Disetujui', 'value' => $approvedIncomingClaims, 'tone' => 'sky'],
            ],
            'highlights' => [
                [
                    'label' => 'Total Porsi Diposting',
                    'value' => $totalPostedPortions,
                    'caption' => 'Akumulasi stok makanan yang Anda unggah ke marketplace.',
                ],
                [
                    'label' => 'Porsi Tersalurkan',
                    'value' => $rescuedPortions,
                    'caption' => 'Porsi yang tercatat selesai diambil oleh komunitas.',
                ],
            ],
            'chart' => $this->monthlyChart(
                $user->foodPosts(),
                'created_at',
                'Food post yang Anda buat per bulan',
                'Post'
            ),
        ];
    }

    protected function communityAnalytics(User $user): array
    {
        $claims = $user->claims();

        $totalClaims = $claims->count();
        $pendingClaims = (clone $claims)->where('status', 'pending')->count();
        $approvedClaims = (clone $claims)->where('status', 'approved')->count();
        $completedClaims = (clone $claims)->where('status', 'completed')->count();
        $cancelledClaims = (clone $claims)->whereIn('status', ['cancelled', 'rejected'])->count();
        $totalClaimedPortions = (int) (clone $claims)->sum('quantity');
        $restaurantConnections = (clone $claims)->distinct('food_post_id')->count('food_post_id');

        return [
            'headline' => [
                'eyebrow' => 'Community Impact',
                'title' => 'Lihat progres klaim dan jangkauan kolaborasi komunitas Anda.',
                'description' => 'Setiap klaim tercatat sebagai langkah nyata penyelamatan pangan dan bantuan sosial.',
            ],
            'stats' => [
                ['label' => 'Total Klaim', 'value' => $totalClaims, 'tone' => 'slate'],
                ['label' => 'Menunggu Proses', 'value' => $pendingClaims, 'tone' => 'amber'],
                ['label' => 'Disetujui', 'value' => $approvedClaims, 'tone' => 'emerald'],
                ['label' => 'Selesai', 'value' => $completedClaims, 'tone' => 'purple'],
                ['label' => 'Batal / Ditolak', 'value' => $cancelledClaims, 'tone' => 'rose'],
                ['label' => 'Mitra Restoran', 'value' => $restaurantConnections, 'tone' => 'sky'],
            ],
            'highlights' => [
                [
                    'label' => 'Total Porsi Diklaim',
                    'value' => $totalClaimedPortions,
                    'caption' => 'Akumulasi porsi yang pernah Anda ajukan melalui platform.',
                ],
            ],
            'chart' => $this->monthlyChart(
                $user->claims(),
                'created_at',
                'Klaim komunitas per bulan',
                'Klaim'
            ),
        ];
    }

    protected function monthlyChart($query, string $column, string $title, string $seriesLabel): array
    {
        $months = collect(range(5, 0))
            ->map(function (int $monthsAgo) {
                $date = Carbon::now()->subMonths($monthsAgo)->startOfMonth();

                return [
                    'key' => $date->format('Y-m'),
                    'label' => $date->translatedFormat('M'),
                    'start' => $date->copy(),
                    'end' => $date->copy()->endOfMonth(),
                ];
            });

        $series = $months->map(function (array $month) use ($query, $column) {
            return [
                'label' => $month['label'],
                'value' => (clone $query)
                    ->whereBetween($column, [$month['start'], $month['end']])
                    ->count(),
            ];
        })->values();

        return [
            'title' => $title,
            'series_label' => $seriesLabel,
            'series' => $series,
        ];
    }
}
