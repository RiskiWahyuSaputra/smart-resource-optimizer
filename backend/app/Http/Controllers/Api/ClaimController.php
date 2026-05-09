<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\FoodPost;
use Illuminate\Http\Request;
use App\Events\ClaimCreated;
use App\Events\ClaimUpdated;
use App\Events\FoodPostUpdated;

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

        // Kurangi quantity food post
        $newQuantity = $foodPost->quantity - $validated['quantity'];
        
        // Update quantity dan status
        $foodPost->update([
            'quantity' => $newQuantity,
            'status' => $newQuantity <= 0 ? 'claimed' : 'available',
        ]);

        // Broadcast events
        broadcast(new ClaimCreated($claim))->toOthers();
        broadcast(new FoodPostUpdated($foodPost))->toOthers();

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
            // Jangan ubah status, biarkan tetap available jika masih ada sisa
            // Status sudah diatur saat claim dibuat berdasarkan quantity
        }

        if ($validated['status'] === 'completed') {
            // Hanya ubah ke completed jika memang sudah selesai pickup
            // Cek apakah masih ada quantity tersisa
            if ($claim->foodPost->quantity <= 0) {
                $claim->foodPost->update([
                    'status' => 'completed',
                ]);
            }
        }

        if (in_array($validated['status'], ['rejected', 'cancelled'], true)) {
            // Kembalikan quantity ke food post
            $claim->foodPost->update([
                'quantity' => $claim->foodPost->quantity + $claim->quantity,
                'status' => 'available',
            ]);
            
            // Broadcast food post update
            broadcast(new FoodPostUpdated($claim->foodPost))->toOthers();
        }

        // Broadcast claim update
        broadcast(new ClaimUpdated($claim))->toOthers();

        return response()->json([
            'claim' => $claim->fresh()->load(['foodPost.user.profile', 'user.profile']),
        ]);
    }
}
