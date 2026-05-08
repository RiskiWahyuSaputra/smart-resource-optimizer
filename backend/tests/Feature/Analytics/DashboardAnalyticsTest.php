<?php

use App\Models\FoodPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns restaurant analytics summary', function () {
    $restaurant = User::factory()->create([
        'role' => 'restaurant',
    ]);
    $community = User::factory()->create([
        'role' => 'community',
    ]);

    $restaurant->profile()->create([
        'name' => 'Resto Analytics',
        'address' => 'Jl. Statistik No. 1',
        'verification_status' => 'verified',
    ]);

    $community->profile()->create([
        'name' => 'Komunitas Analytics',
        'address' => 'Jl. Statistik No. 2',
        'verification_status' => 'verified',
    ]);

    $foodPost = FoodPost::create([
        'user_id' => $restaurant->id,
        'title' => 'Makanan Pagi',
        'quantity' => 10,
        'quantity_unit' => 'porsi',
        'pickup_address' => 'Jl. Statistik No. 1',
        'available_until' => now()->addHours(3),
        'status' => 'claimed',
    ]);

    $community->claims()->create([
        'food_post_id' => $foodPost->id,
        'quantity' => 3,
        'notes' => 'Siap pickup',
        'status' => 'completed',
    ]);

    $response = $this->actingAs($restaurant)
        ->getJson('/api/dashboard/analytics');

    $response->assertOk();
    $response->assertJsonPath('headline.eyebrow', 'Restaurant Flow');
    $response->assertJsonPath('highlights.0.value', 10);
    $response->assertJsonPath('highlights.1.value', 3);
});

it('returns community analytics summary', function () {
    $restaurant = User::factory()->create([
        'role' => 'restaurant',
    ]);
    $community = User::factory()->create([
        'role' => 'community',
    ]);

    $restaurant->profile()->create([
        'name' => 'Resto Komunitas',
        'address' => 'Jl. Analitik No. 1',
        'verification_status' => 'verified',
    ]);

    $community->profile()->create([
        'name' => 'Komunitas Analitik',
        'address' => 'Jl. Analitik No. 2',
        'verification_status' => 'verified',
    ]);

    $foodPost = FoodPost::create([
        'user_id' => $restaurant->id,
        'title' => 'Paket Siang',
        'quantity' => 5,
        'quantity_unit' => 'paket',
        'pickup_address' => 'Jl. Analitik No. 1',
        'available_until' => now()->addHours(3),
        'status' => 'completed',
    ]);

    $community->claims()->create([
        'food_post_id' => $foodPost->id,
        'quantity' => 2,
        'status' => 'completed',
    ]);

    $response = $this->actingAs($community)
        ->getJson('/api/dashboard/analytics');

    $response->assertOk();
    $response->assertJsonPath('headline.eyebrow', 'Community Impact');
    $response->assertJsonPath('highlights.0.value', 2);
});

it('returns admin analytics summary', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);
    $restaurant = User::factory()->create([
        'role' => 'restaurant',
    ]);
    $community = User::factory()->create([
        'role' => 'community',
    ]);

    $restaurant->profile()->create([
        'name' => 'Resto Admin View',
        'address' => 'Jl. Admin No. 1',
        'verification_status' => 'verified',
    ]);

    $community->profile()->create([
        'name' => 'Komunitas Admin View',
        'address' => 'Jl. Admin No. 2',
        'verification_status' => 'pending',
    ]);

    $foodPost = FoodPost::create([
        'user_id' => $restaurant->id,
        'title' => 'Paket Admin',
        'quantity' => 7,
        'quantity_unit' => 'paket',
        'pickup_address' => 'Jl. Admin No. 1',
        'available_until' => now()->addHours(4),
        'status' => 'completed',
    ]);

    $community->claims()->create([
        'food_post_id' => $foodPost->id,
        'quantity' => 4,
        'status' => 'completed',
    ]);

    $response = $this->actingAs($admin)
        ->getJson('/api/dashboard/analytics');

    $response->assertOk();
    $response->assertJsonPath('headline.eyebrow', 'Control Tower');
    $response->assertJsonPath('highlights.0.value', 4);
});
