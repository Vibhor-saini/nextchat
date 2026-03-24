<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\Conversation;

class UserController extends Controller
{
    public function store(Request $request)
    {
        //  Validation (basic)
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6'
        ]);

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'is_active' => true
        ]);

        //  AUTO CONNECT (admin ↔ user)
        $adminId = Auth::id();

        $conversation = Conversation::create([
            'type' => 'private'
        ]);

        $conversation->users()->attach([$adminId, $user->id]);

        //  Inertia friendly response
        return back()->with('success', 'User created successfully');
    }
}
