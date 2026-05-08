<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\FoodPost;
use Illuminate\Http\Request;

class ClaimController extends Controller
{
    public function index(Request $request)
    {
        $claims = $request->user()
            ->claims()
            ->with(['foodPost.user.profile'])
            ->latest()
            ->get();

        return response()->json([
            'claims' => $claims,
        ]);
    }

    public function incoming(Request $request)
    {
        abort_unless($request->user()->isRestaurant() || $request->user()->isAdmin(), 403);

        $claims = Claim::query()
            ->with(['foodPost.user.profile', 'user.profile'])
            ->whereHas('foodPost', function ($query) use ($request) {
                if (! $request->user()->isAdmin()) {
                    $query->where('user_id', $request->user()->id);
                }
            })
            ->latest()
            ->get();

        return response()->json([
            'claims' => $claims,
        ]);
    }

    public function store(Request $request, FoodPost $foodPost)
    {
        abort_unless($request->user()->isCommunity() || $request->user()->isAdmin(), 403);

        if ($foodPost->status !== 'available') {
            return response()->json([
                'message' => 'Makanan ini sudah tidak tersedia untuk diklaim.',
            ], 422);
        }

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        if ($validated['quantity'] > $foodPost->quantity) {
            return response()->json([
                'message' => 'Jumlah klaim melebihi stok yang tersedia.',
            ], 422);
        }

        $claim = $request->user()->claims()->create([
            'food_post_id' => $foodPost->id,
            'quantity' => $validated['quantity'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        $foodPost->update([
            'status' => 'claimed',
        ]);

        return response()->json([
            'claim' => $claim->load(['foodPost.user.profile', 'user.profile']),
        ], 201);
    }

    public function update(Request $request, Claim $claim)
    {
        $isAdmin = $request->user()->isAdmin();
        $ownsFoodPost = $claim->foodPost->user_id === $request->user()->id;
        $isClaimOwner = $claim->user_id === $request->user()->id;

        abort_unless($isAdmin || $ownsFoodPost || $isClaimOwner, 403);

        $allowedStatuses = $isAdmin || $ownsFoodPost
            ? ['approved', 'rejected', 'completed']
            : ['cancelled'];

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', $allowedStatuses)],
        ]);

        $claim->update([
            'status' => $validated['status'],
        ]);

        if ($validated['status'] === 'approved') {
            $claim->foodPost->update([
                'status' => 'claimed',
            ]);
        }

        if ($validated['status'] === 'completed') {
            $claim->foodPost->update([
                'status' => 'completed',
            ]);
        }

        if (in_array($validated['status'], ['rejected', 'cancelled'], true)) {
            $claim->foodPost->update([
                'status' => 'available',
            ]);
        }

        return response()->json([
            'claim' => $claim->fresh()->load(['foodPost.user.profile', 'user.profile']),
        ]);
    }
}
