<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Actions\Admin\VerifyUserAction;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function verify(Request $request, User $user, VerifyUserAction $action)
    {
        $request->validate([
            'status' => ['required', 'string', 'in:verified,rejected'],
        ]);

        $action->execute($user, $request->status);

        return response()->json([
            'message' => 'User verification status updated successfully.',
            'user' => $user->load('profile'),
        ]);
    }
}
