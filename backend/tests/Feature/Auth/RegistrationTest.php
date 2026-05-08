<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('can register a new user with profile', function () {
    Storage::fake('public');

    $response = $this->post('/api/register', [
        'name' => 'Restoran Enak',
        'email' => 'restoran@test.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'restaurant',
        'address' => 'Jl. Kebagusan No 1',
        'verification_document' => UploadedFile::fake()->create('legalitas.pdf', 120, 'application/pdf'),
    ], [
        'Accept' => 'application/json',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['email' => 'restoran@test.com', 'role' => 'restaurant']);
    $this->assertDatabaseHas('profiles', ['name' => 'Restoran Enak', 'address' => 'Jl. Kebagusan No 1']);
    
    $user = User::where('email', 'restoran@test.com')->first();
    expect($user->profile)->not->toBeNull();
    expect($user->profile->document_url)->not->toBeNull();
    Storage::disk('public')->assertExists($user->profile->document_url);
});
