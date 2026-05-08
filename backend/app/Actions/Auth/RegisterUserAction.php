<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegisterUserAction
{
    public function execute(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
            ]);

            $user->profile()->create([
                'name' => $data['name'],
                'address' => $data['address'],
                'lat' => $data['lat'] ?? null,
                'long' => $data['long'] ?? null,
                'verification_status' => 'pending',
                'document_url' => $data['document_url'] ?? null,
            ]);

            return $user;
        });
    }
}
