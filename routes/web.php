<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ChatController;
use Inertia\Inertia;

Route::get('/login', [AuthController::class, 'showLogin']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/logout', [AuthController::class, 'logout'])->name('login');



// Admin routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/chat', [ChatController::class, 'index']);
    Route::post('admin/users', [UserController::class, 'store'])->name('users.store');
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


Route::post('/messages/delivered', [ChatController::class, 'markDelivered']);
Route::post('/messages/seen', [ChatController::class, 'markSeen']);
Route::post('/typing', [ChatController::class, 'typing']);