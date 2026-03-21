<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {

            $user = Auth::user();

            if ($user->role === 'admin') {
                return Inertia::render('Home');
            }

            // return Inertia::render('Home');
        }

        return back()->withErrors([
            'email' => 'Invalid credentials'
        ]);
    }
}
