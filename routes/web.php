<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Inertia\Inertia;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/', function () {
    return Inertia::render('Home');
});

Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

Route::get('/login', function () {
    return Inertia::render('Auth/Login');
});

Route::post('/login', [AuthController::class, 'login']);

// Route::get('/login', [AuthController::class, 'showLogin']);
// Route::post('/login', [AuthController::class, 'login']);
// Route::post('/logout', [AuthController::class, 'logout']);

// Route::get('/dashboard', function () {
//     return view('dashboard');
// })->middleware('auth');