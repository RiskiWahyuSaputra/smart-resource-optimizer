<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user()->load('profile');
    });
});

Route::middleware(['auth:sanctum', 'can:admin-only'])->group(function () {
    Route::get('/admin/users', [AdminController::class, 'index']);
    Route::get('/admin/users/{user}/document', [AdminController::class, 'document']);
    Route::patch('/admin/verify/{user}', [AdminController::class, 'verify']);
});
