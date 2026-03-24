<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ChatController;
use Inertia\Inertia;

Route::get('/login', [AuthController::class, 'showLogin']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);



// Admin routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
});

// User routes
Route::middleware(['auth'])->group(function () {
    Route::get('/chat', [ChatController::class, 'index']);
    Route::get('/chat/{id}', [ChatController::class, 'show']);
    Route::post('/messages', [ChatController::class, 'send']);
    Route::get('/start-chat/{userId}', [ChatController::class, 'startChat']);
    Route::get('/users', [ChatController::class, 'allUsers']);
});

// Route::get('/dashboard', function () {
//     return view('dashboard');
// })->middleware('auth');