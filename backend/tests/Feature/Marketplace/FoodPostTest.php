<?php

use App\Models\FoodPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can list available food posts', function () {
    $restaurant = User::factory()->create([
        'role' => 'restaurant',
        'name' => 'Dapur Berkah',
    ]);

    $restaurant->profile()->create([
        'name' => 'Dapur Berkah',
        'address' => 'Jl. Melati No. 10',
        'verification_status' => 'verified',
    ]);

    FoodPost::create([
        'user_id' => $restaurant->id,
        'title' => 'Nasi Box Siap Ambil',
        'description' => 'Makanan berlebih setelah acara kantor.',
        'quantity' => 10,
        'quantity_unit' => 'box',
        'pickup_address' => 'Jl. Melati No. 10',
        'available_until' => now()->addHours(3),
        'status' => 'available',
    ]);

    $response = $this->getJson('/api/food-posts');

    $response->assertOk();
    $response->assertJsonCount(1, 'food_posts');
    $response->assertJsonPath('food_posts.0.title', 'Nasi Box Siap Ambil');
});

it('restaurant can create a food post', function () {
    $restaurant = User::factory()->create([
        'role' => 'restaurant',
    ]);

    $restaurant->profile()->create([
        'name' => 'Restoran Test',
        'address' => 'Jl. Sudirman No. 1',
        'verification_status' => 'verified',
    ]);

    $response = $this->actingAs($restaurant)
        ->postJson('/api/food-posts', [
            'title' => 'Roti Sisa Produksi',
            'description' => 'Masih layak konsumsi sampai malam.',
            'quantity' => 12,
            'quantity_unit' => 'pcs',
            'pickup_address' => 'Jl. Sudirman No. 1',
            'lat' => -6.2,
            'long' => 106.8,
            'available_until' => now()->addHours(5)->toISOString(),
            'image_url' => 'https://example.com/roti.jpg',
        ]);

    $response->assertCreated();
    $this->assertDatabaseHas('food_posts', [
        'title' => 'Roti Sisa Produksi',
        'user_id' => $restaurant->id,
        'status' => 'available',
    ]);
});

it('verified restaurant can see its own food posts', function () {
    $restaurant = User::factory()->create([
        'role' => 'restaurant',
    ]);

    $restaurant->profile()->create([
        'name' => 'Restoran Saya',
        'address' => 'Jl. Mawar No. 7',
        'verification_status' => 'verified',
    ]);

    FoodPost::create([
        'user_id' => $restaurant->id,
        'title' => 'Sup Hangat',
        'quantity' => 7,
        'quantity_unit' => 'porsi',
        'pickup_address' => 'Jl. Mawar No. 7',
        'available_until' => now()->addHours(2),
        'status' => 'available',
    ]);

    $response = $this->actingAs($restaurant)->getJson('/api/my-food-posts');

    $response->assertOk();
    $response->assertJsonCount(1, 'food_posts');
    $response->assertJsonPath('food_posts.0.title', 'Sup Hangat');
});

it('restaurant can update status of its own food post', function () {
    $restaurant = User::factory()->create([
        'role' => 'restaurant',
    ]);

    $restaurant->profile()->create([
        'name' => 'Restoran Update',
        'address' => 'Jl. Kenanga No. 9',
        'verification_status' => 'verified',
    ]);

    $foodPost = FoodPost::create([
        'user_id' => $restaurant->id,
        'title' => 'Lauk Siap Ambil',
        'quantity' => 4,
        'quantity_unit' => 'paket',
        'pickup_address' => 'Jl. Kenanga No. 9',
        'available_until' => now()->addHours(2),
        'status' => 'available',
    ]);

    $response = $this->actingAs($restaurant)
        ->patchJson("/api/food-posts/{$foodPost->id}", [
            'status' => 'completed',
        ]);

    $response->assertOk();
    $this->assertDatabaseHas('food_posts', [
        'id' => $foodPost->id,
        'status' => 'completed',
    ]);
});
