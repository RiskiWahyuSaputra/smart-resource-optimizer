<?php

use App\Models\FoodPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('community can claim an available food post', function () {
    $restaurant = User::factory()->create([
        'role' => 'restaurant',
    ]);
    $community = User::factory()->create([
        'role' => 'community',
    ]);

    $restaurant->profile()->create([
        'name' => 'Warung Sumber',
        'address' => 'Jl. Sumber No. 3',
        'verification_status' => 'verified',
    ]);

    $community->profile()->create([
        'name' => 'Komunitas Pangan',
        'address' => 'Jl. Maju No. 4',
        'verification_status' => 'verified',
    ]);

    $foodPost = FoodPost::create([
        'user_id' => $restaurant->id,
        'title' => 'Sayur Matang',
        'quantity' => 5,
        'quantity_unit' => 'porsi',
        'pickup_address' => 'Jl. Sumber No. 3',
        'available_until' => now()->addHours(2),
        'status' => 'available',
    ]);

    $response = $this->actingAs($community)
        ->postJson("/api/food-posts/{$foodPost->id}/claims", [
            'quantity' => 2,
            'notes' => 'Siap diambil sore ini.',
        ]);

    $response->assertCreated();
    $this->assertDatabaseHas('claims', [
        'food_post_id' => $foodPost->id,
        'user_id' => $community->id,
        'quantity' => 2,
        'status' => 'pending',
    ]);
    expect($foodPost->fresh()->status)->toBe('claimed');
});
