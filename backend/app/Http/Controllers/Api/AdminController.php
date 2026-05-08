<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Actions\Admin\VerifyUserAction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Events\UserVerificationUpdated;

class AdminController extends Controller
{
    public function index(Request $request)
    {

        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:pending,verified,rejected,all'],
        ]);

        $status = $validated['status'] ?? 'all';

        $users = User::query()
            ->with('profile')
            ->whereIn('role', ['restaurant', 'community'])
            ->when($status !== 'all', function ($query) use ($status) {
                $query->whereHas('profile', function ($profileQuery) use ($status) {
                    $profileQuery->where('verification_status', $status);
                });
            })
            ->latest()
            ->get();

        return response()->json([
            'users' => $users,
            'counts' => [
                'pending' => $users->filter(fn (User $user) => $user->profile?->verification_status === 'pending')->count(),
                'verified' => $users->filter(fn (User $user) => $user->profile?->verification_status === 'verified')->count(),
                'rejected' => $users->filter(fn (User $user) => $user->profile?->verification_status === 'rejected')->count(),
            ],
        ]);
    }

    public function verify(Request $request, User $user, VerifyUserAction $action)
    {
        $request->validate([
            'status' => ['required', 'string', 'in:verified,rejected'],
        ]);

        $action->execute($user, $request->status);

        $user->refresh();

        broadcast(new UserVerificationUpdated(
            userId: $user->id,
            verificationStatus: (string) $request->status
        ))->toOthers();


        return response()->json([
            'message' => 'User verification status updated successfully.',
            'user' => $user->load('profile'),
        ]);

    }

    public function document(User $user)
    {
        abort_unless($user->profile?->document_url, 404, 'Document not found.');

        return response()->file(
            Storage::disk('public')->path($user->profile->document_url)
        );
    }
}
