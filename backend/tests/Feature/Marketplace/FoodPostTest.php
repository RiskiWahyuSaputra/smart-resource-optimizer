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
