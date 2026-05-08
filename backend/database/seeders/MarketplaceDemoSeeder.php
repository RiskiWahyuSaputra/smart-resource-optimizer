<?php

namespace Database\Seeders;

use App\Models\FoodPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MarketplaceDemoSeeder extends Seeder
{
    /**
     * Seed demo marketplace data.
     */
    public function run(): void
    {
        $restaurantA = User::updateOrCreate(
            ['email' => 'resto-demo-1@sro.local'],
            [
                'name' => 'Dapur Berkah',
                'password' => Hash::make('password'),
                'role' => 'restaurant',
                'email_verified_at' => now(),
            ]
        );

        $restaurantA->profile()->updateOrCreate(
            ['user_id' => $restaurantA->id],
            [
                'name' => 'Dapur Berkah',
                'address' => 'Jl. Kebon Sirih No. 12, Jakarta',
                'lat' => -6.18648630,
                'long' => 106.83409110,
                'verification_status' => 'verified',
            ]
        );

        $restaurantB = User::updateOrCreate(
            ['email' => 'resto-demo-2@sro.local'],
            [
                'name' => 'Roti Pagi',
                'password' => Hash::make('password'),
                'role' => 'restaurant',
                'email_verified_at' => now(),
            ]
        );

        $restaurantB->profile()->updateOrCreate(
            ['user_id' => $restaurantB->id],
            [
                'name' => 'Roti Pagi',
                'address' => 'Jl. Cikini Raya No. 8, Jakarta',
                'lat' => -6.19842050,
                'long' => 106.84198120,
                'verification_status' => 'verified',
            ]
        );

        $community = User::updateOrCreate(
            ['email' => 'community-demo@sro.local'],
            [
                'name' => 'Komunitas Pangan Kota',
                'password' => Hash::make('password'),
                'role' => 'community',
                'email_verified_at' => now(),
            ]
        );

        $community->profile()->updateOrCreate(
            ['user_id' => $community->id],
            [
                'name' => 'Komunitas Pangan Kota',
                'address' => 'Jl. Menteng Wadas No. 5, Jakarta',
                'lat' => -6.21416210,
                'long' => 106.84864220,
                'verification_status' => 'verified',
            ]
        );

        $posts = [
            [
                'user_id' => $restaurantA->id,
                'title' => 'Nasi Box Acara Siang',
                'description' => 'Masih segar dan siap diambil hari ini untuk distribusi cepat.',
                'quantity' => 18,
                'quantity_unit' => 'box',
                'pickup_address' => 'Jl. Kebon Sirih No. 12, Jakarta',
                'lat' => -6.18648630,
                'long' => 106.83409110,
                'available_until' => now()->addHours(4),
                'image_url' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=300&auto=format&fit=crop',
            ],
            [
                'user_id' => $restaurantB->id,
                'title' => 'Roti dan Pastry Berlebih',
                'description' => 'Cocok untuk distribusi sore. Kondisi baik dan tersimpan rapi.',
                'quantity' => 24,
                'quantity_unit' => 'pcs',
                'pickup_address' => 'Jl. Cikini Raya No. 8, Jakarta',
                'lat' => -6.19842050,
                'long' => 106.84198120,
                'available_until' => now()->addHours(6),
                'image_url' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&h=300&auto=format&fit=crop',
            ],
            [
                'user_id' => $restaurantA->id,
                'title' => 'Sayur Matang Siap Distribusi',
                'description' => 'Porsi keluarga, cocok untuk disalurkan ke komunitas sekitar.',
                'quantity' => 9,
                'quantity_unit' => 'porsi',
                'pickup_address' => 'Jl. Kebon Sirih No. 12, Jakarta',
                'lat' => -6.18648630,
                'long' => 106.83409110,
                'available_until' => now()->addHours(3),
                'image_url' => 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=400&h=300&auto=format&fit=crop',
            ],
        ];

        foreach ($posts as $post) {
            FoodPost::updateOrCreate(
                [
                    'user_id' => $post['user_id'],
                    'title' => $post['title'],
                ],
                [
                    ...$post,
                    'status' => 'available',
                ]
            );
        }
    }
}
