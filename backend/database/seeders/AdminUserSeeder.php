<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the application's admin user.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@sro.local')],
            [
                'name' => env('ADMIN_NAME', 'SRO Admin'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'password')),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $admin->profile()->updateOrCreate(
            ['user_id' => $admin->id],
            [
                'name' => env('ADMIN_NAME', 'SRO Admin'),
                'address' => env('ADMIN_ADDRESS', 'Kantor Admin SRO'),
                'verification_status' => 'verified',
                'document_url' => null,
            ]
        );
    }
}
