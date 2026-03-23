<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;

class ChatController extends Controller
{

    public function index()
    {
        $user = Auth::user();

        $conversations = $user->conversations()
            ->with(['users', 'latestMessage.sender'])
            ->get();

        $connectedUserIds = [];

        foreach ($conversations as $conv) {
            foreach ($conv->users as $u) {
                if ($u->id != $user->id) {
                    $connectedUserIds[] = $u->id;
                }
            }
        }

        $connectedUserIds = array_unique($connectedUserIds);

        $otherUsers = \App\Models\User::where('id', '!=', $user->id)
            ->whereNotIn('id', $connectedUserIds)
            ->get();

        //  ROLE BASED VIEW
        if ($user->role === 'admin') {
            return view('admin.chat.index', compact('conversations', 'otherUsers'));
        }

        return view('chat.index', compact('conversations', 'otherUsers'));
    }

    /**
     *  Open Chat (Messages)
     */
    public function show($id)
    {
        $user = Auth::user();

        $conversation = $user->conversations()
            ->with('messages.sender')
            ->findOrFail($id);

        if ($user->role === 'admin') {
            return view('admin.chat.show', compact('conversation'));
        }

        return view('chat.show', compact('conversation'));
    }

    /**
     *  Send Message
     */
    public function send(Request $request)
    {
        // Validation
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'required|string|min:1'
        ]);

        $user = Auth::user();

        // Security: user must belong to this conversation
        $conversation = $user->conversations()
            ->findOrFail($request->conversation_id);

        //  Create message
        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'message' => $request->message
        ]);

        return back()->with('success', 'Message sent');
    }

    // All users
    public function allUsers()
    {
        $users = \App\Models\User::where('id', '!=', auth()->id())->get();

        return view('chat.users', compact('users'));
    }



    //start chat---------
    public function startChat($userId)
    {
        $authUser = Auth::user();

        // check existing conversation
        $conversation = $authUser->conversations()
            ->whereHas('users', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->where('type', 'private')
            ->first();

        // agar exist nahi hai → create karo
        if (!$conversation) {
            $conversation = \App\Models\Conversation::create([
                'type' => 'private'
            ]);

            $conversation->users()->attach([$authUser->id, $userId]);
        }

        return redirect('/chat/' . $conversation->id);
    }
}
