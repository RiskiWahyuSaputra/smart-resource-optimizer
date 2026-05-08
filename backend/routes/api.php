<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClaimController;
use App\Http\Controllers\Api\DashboardAnalyticsController;
use App\Http\Controllers\Api\FoodPostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/food-posts', [FoodPostController::class, 'index']);
Route::get('/food-posts/{foodPost}', [FoodPostController::class, 'show']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user()->load('profile');
    });
    Route::get('/dashboard/analytics', [DashboardAnalyticsController::class, 'show']);
    Route::get('/my-food-posts', [FoodPostController::class, 'mine']);
    Route::post('/food-posts', [FoodPostController::class, 'store']);
    Route::patch('/food-posts/{foodPost}', [FoodPostController::class, 'update']);
    Route::get('/claims', [ClaimController::class, 'index']);
    Route::get('/incoming-claims', [ClaimController::class, 'incoming']);
    Route::patch('/claims/{claim}', [ClaimController::class, 'update']);
    Route::post('/food-posts/{foodPost}/claims', [ClaimController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'can:admin-only'])->group(function () {
    Route::get('/admin/users', [AdminController::class, 'index']);
    Route::get('/admin/users/{user}/document', [AdminController::class, 'document']);
    Route::patch('/admin/verify/{user}', [AdminController::class, 'verify']);
});
