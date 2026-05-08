<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FoodPost;
use Illuminate\Http\Request;

class FoodPostController extends Controller
{
    public function mine(Request $request)
    {
        $foodPosts = $request->user()
            ->foodPosts()
            ->with(['user.profile', 'claims.user.profile'])
            ->latest()
            ->get();

        return response()->json([
            'food_posts' => $foodPosts,
        ]);
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:available,claimed,completed,expired,all'],
        ]);

        $search = $validated['search'] ?? null;
        $status = $validated['status'] ?? 'available';

        $foodPosts = FoodPost::query()
            ->with(['user.profile'])
            ->when($status !== 'all', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when($search, function ($query) use ($search) {
                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('user.profile', function ($profileQuery) use ($search) {
                            $profileQuery
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('address', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('available_until')
            ->latest()
            ->get();

        return response()->json([
            'food_posts' => $foodPosts,
        ]);
    }

    public function show(FoodPost $foodPost)
    {
        return response()->json([
            'food_post' => $foodPost->load(['user.profile', 'claims.user']),
        ]);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->isRestaurant() || $request->user()->isAdmin(), 403);
        abort_unless(
            $request->user()->isAdmin() || $request->user()->profile?->verification_status === 'verified',
            403,
            'Akun Anda harus terverifikasi untuk membuat food post.'
        );

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quantity' => ['required', 'integer', 'min:1'],
            'quantity_unit' => ['nullable', 'string', 'max:50'],
            'pickup_address' => ['required', 'string'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'long' => ['nullable', 'numeric', 'between:-180,180'],
            'available_until' => ['required', 'date', 'after:now'],
            'image_url' => ['nullable', 'url', 'max:2048'],
            'status' => ['nullable', 'string', 'in:available,claimed,completed,expired'],
        ]);

        $foodPost = $request->user()->foodPosts()->create([
            ...$validated,
            'quantity_unit' => $validated['quantity_unit'] ?? 'porsi',
            'status' => $validated['status'] ?? 'available',
        ]);

        return response()->json([
            'food_post' => $foodPost->load('user.profile'),
        ], 201);
    }

    public function update(Request $request, FoodPost $foodPost)
    {
        abort_unless(
            $request->user()->isAdmin() || $foodPost->user_id === $request->user()->id,
            403
        );

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'quantity' => ['sometimes', 'required', 'integer', 'min:1'],
            'quantity_unit' => ['sometimes', 'nullable', 'string', 'max:50'],
            'pickup_address' => ['sometimes', 'required', 'string'],
            'lat' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'long' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'available_until' => ['sometimes', 'required', 'date'],
            'image_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'status' => ['sometimes', 'required', 'string', 'in:available,claimed,completed,expired'],
        ]);

        $foodPost->update($validated);

        return response()->json([
            'food_post' => $foodPost->fresh()->load(['user.profile', 'claims.user.profile']),
        ]);
    }
}
