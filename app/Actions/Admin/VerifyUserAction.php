<?php

namespace App\Actions\Admin;

use App\Models\User;

class VerifyUserAction
{
    public function execute(User $user, string $status): User
    {
        $user->profile()->update([
            'verification_status' => $status
        ]);

        return $user;
    }
}
