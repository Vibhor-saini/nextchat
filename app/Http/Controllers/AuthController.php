<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('login');
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {

            $user = Auth::user();

            // inactive check
            if (!$user->is_active) {
                Auth::logout();
                return back()->withErrors(['email' => 'Account inactive']);
            }

            // ROLE BASED REDIRECT
            if ($user->role === 'admin') {
                return redirect('/admin/dashboard');
            }

            return redirect('/chat');
        }

        return back()->withErrors(['email' => 'Invalid credentials']);
    }

    public function logout()
    {
        Auth::logout();
        return redirect('/login');
    }
}
