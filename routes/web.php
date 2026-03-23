<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Inertia\Inertia;

Route::get('/login', [AuthController::class, 'showLogin']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);



// Admin routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
         return "ADMIN DASHBOARD";
    });
});



// User routes
Route::middleware(['auth', 'user'])->group(function () {
    Route::get('/chat', function () {
        return "CHAT PAGE";
    });
});