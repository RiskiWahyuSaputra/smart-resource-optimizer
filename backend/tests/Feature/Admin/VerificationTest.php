<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

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

it('can list users awaiting verification as an admin', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $pendingUser = User::factory()->create(['role' => 'restaurant']);
    $verifiedUser = User::factory()->create(['role' => 'community']);

    $pendingUser->profile()->create([
        'name' => 'Pending User',
        'address' => 'Jl. Pending',
        'verification_status' => 'pending',
    ]);

    $verifiedUser->profile()->create([
        'name' => 'Verified User',
        'address' => 'Jl. Verified',
        'verification_status' => 'verified',
    ]);

    $response = $this->actingAs($admin)
        ->getJson('/api/admin/users?status=pending');

    $response->assertOk();
    $response->assertJsonCount(1, 'users');
    $response->assertJsonPath('counts.pending', 1);
});

it('can open a verification document as an admin', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'restaurant']);
    $path = 'verification-documents/test-proof.pdf';
    Storage::disk('public')->put($path, 'dummy-pdf-content');

    $user->profile()->create([
        'name' => 'Document User',
        'address' => 'Jl. Dokumen',
        'verification_status' => 'pending',
        'document_url' => $path,
    ]);

    $response = $this->actingAs($admin)
        ->get("/api/admin/users/{$user->id}/document");

    $response->assertOk();
});
