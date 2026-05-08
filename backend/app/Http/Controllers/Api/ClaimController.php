<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
}
