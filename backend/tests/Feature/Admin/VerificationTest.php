<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can verify a user as an admin', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'restaurant']);
    $user->profile()->create([
        'name' => 'Restaurant Test',
        'address' => 'Test Address',
        'verification_status' => 'pending',
    ]);

    $response = $this->actingAs($admin)
        ->patchJson("/api/admin/verify/{$user->id}", [
            'status' => 'verified'
        ]);

    $response->assertStatus(200);
    expect($user->profile->fresh()->verification_status)->toBe('verified');
});

it('cannot verify a user if not an admin', function () {
    $nonAdmin = User::factory()->create(['role' => 'restaurant']);
    $user = User::factory()->create(['role' => 'restaurant']);
    
    $response = $this->actingAs($nonAdmin)
        ->patchJson("/api/admin/verify/{$user->id}", [
            'status' => 'verified'
        ]);

    $response->assertStatus(403);
});
