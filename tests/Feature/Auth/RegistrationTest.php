<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can register a new user with profile', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Restoran Enak',
        'email' => 'restoran@test.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'restaurant',
        'address' => 'Jl. Kebagusan No 1',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['email' => 'restoran@test.com', 'role' => 'restaurant']);
    $this->assertDatabaseHas('profiles', ['name' => 'Restoran Enak', 'address' => 'Jl. Kebagusan No 1']);
    
    $user = User::where('email', 'restoran@test.com')->first();
    expect($user->profile)->not->toBeNull();
});
