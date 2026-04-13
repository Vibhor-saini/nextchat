<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Inertia\Inertia;
use App\Events\TypingEvent;
use App\Events\MessageSeen;
use App\Events\MessageSent;
use App\Events\MessageDelivered;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user       = Auth::user();
        $selectedId = $request->query('selected');
 
        $conversations = $user->conversations()
            ->with([
                'users' => fn($q) => $q->where('users.id', '!=', $user->id)->select('users.id', 'name'),
                'latestMessage:messages.id,messages.conversation_id,sender_id,message,created_at',
            ])

            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('sender_id', '!=', $user->id)
                  ->whereNull('seen_at');
            }])
            ->orderBy('updated_at', 'desc')
            ->get();
 
        $otherUsers = User::where('id', '!=', $user->id)
            ->whereNotIn('id', function ($query) use ($user) {
                $query->select('conversation_user.user_id')
                    ->from('conversation_user')
                    ->whereIn('conversation_user.conversation_id', function ($q) use ($user) {
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
                    ->get(['id', 'conversation_id', 'sender_id', 'message', 'created_at', 'delivered_at', 'seen_at']);
            }
        }
 
        $view = $user->role === 'admin' ? 'Admin/Chat/Index' : 'Chat/Index';
 
        return Inertia::render($view, [
            'conversations' => $conversations,
            'otherUsers'    => $otherUsers,
            'authUser'      => $user,
            'chatHistory'   => $chatHistory,
        ]);
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

        event(new MessageSent($message, $request->client_id, $request->receiver_id));

        return back(); 
    }

    public function markDelivered(Request $request)
    {
        $ids = $request->message_ids;
 
        $messages = Message::whereIn('id', $ids)
            ->whereNull('delivered_at')
            ->get();
 
        foreach ($messages as $msg) {
            $msg->update(['delivered_at' => now()]);
            broadcast(new MessageDelivered($msg->id, $msg->conversation_id))->toOthers();
        }
 
        return response()->json(['ok']);
    }

    public function markSeen(Request $request)
    {
        $conversationId = $request->conversation_id;
        $user           = Auth::user();
 
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('seen_at')
            ->update(['seen_at' => now()]);
 
        broadcast(new MessageSeen($conversationId))->toOthers();
 
        return response()->json(['ok']);
    }

    public function typing(Request $request)
    {
        event(new TypingEvent(
            $request->conversation_id,
            auth()->id()
        ));

        return response()->json(['ok']);
    }
}


