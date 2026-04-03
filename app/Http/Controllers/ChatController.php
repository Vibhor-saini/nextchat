<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $selectedId = $request->query('selected');

        $conversations = $user->conversations()
            ->with([
                'users' => fn($q) => $q->where('users.id', '!=', $user->id)->select('users.id', 'name'),
                'latestMessage:messages.id,messages.conversation_id,sender_id,message,created_at'  
            ])

            ->orderBy('updated_at', 'desc') 
            ->get();

        $otherUsers = User::where('id', '!=', $user->id)
        ->whereNotIn('id', function($query) use ($user) {
            $query->select('conversation_user.user_id')
                ->from('conversation_user')
                ->whereIn('conversation_user.conversation_id', function($q) use ($user) {
                    $q->select('conversation_user.conversation_id')
                        ->from('conversation_user')
                        ->where('conversation_user.user_id', $user->id);
                });
        })
        ->select('id', 'name')
        ->get();

        $chatHistory = [];
        if ($selectedId) {
            $conversation = $user->conversations()
                ->whereHas('users', fn($q) => $q->where('user_id', $selectedId))
                ->first();

            if ($conversation) {
                $chatHistory = $conversation->messages()
                    ->with('sender:id,name')
                    ->orderBy('created_at', 'asc')
                    ->get();
            }
        }

        $view = $user->role === 'admin' ? 'Admin/Chat/Index' : 'Chat/Index';

        return Inertia::render($view, [
            'conversations' => $conversations,
            'otherUsers' => $otherUsers,
            'authUser' => $user,
            'chatHistory' => $chatHistory,
        ]);
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
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
            'client_id' => 'required|string',
        ]);

        $authUser = Auth::user();
        $receiverId = $request->receiver_id;

        $conversation = $authUser->conversations()
            ->where('type', 'private')
            ->whereHas('users', function ($q) use ($receiverId) {
                $q->where('user_id', $receiverId);
            })->first();

        if (!$conversation) {
            $conversation = Conversation::create(['type' => 'private']);
            $conversation->users()->attach([$authUser->id, $receiverId]);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $authUser->id,
            'message' => $request->message,
            'client_id' => $request->client_id,
        ]);

        event(new MessageSent($message, $request->client_id));

        return back(); 
    }

    // All users
    public function allUsers()
    {
        $users = User::where('id', '!=', auth()->id())->get();

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
            $conversation = Conversation::create([
                'type' => 'private'
            ]);

            $conversation->users()->attach([$authUser->id, $userId]);
        }

        return redirect('/chat/' . $conversation->id);
    }
}
