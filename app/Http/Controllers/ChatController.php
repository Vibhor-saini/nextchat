<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;
use Inertia\Inertia;
use App\Events\MessageSeen;
use Carbon\Carbon;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $selectedId = $request->query('selected');

        $conversations = $user->conversations()
            ->with([
                'users' => fn($q) => $q->where('users.id', '!=', $user->id)->select('users.id', 'name'),
                'latestMessage:messages.id,messages.conversation_id,sender_id,message,created_at,seen_at'
            ])
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
        $conversation = null;

        if ($selectedId) {
            $conversation = $user->conversations()
                ->whereHas('users', fn($q) => $q->where('user_id', $selectedId))
                ->first();

            if ($conversation) {
                $chatHistory = $conversation->messages()
                    ->with('sender:id,name')
                    ->orderBy('created_at', 'asc')
                    ->get();

                // Mark all unseen messages as seen (jo current user ne receive kiye hain)
                $this->markConversationSeen($conversation->id, $user->id);
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





    // Dedicated API route ke liye bhi (AJAX call se)
    public function markSeen(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        $user = Auth::user();

        // Verify user is part of this conversation
        $conversation = $user->conversations()->findOrFail($request->conversation_id);

        $this->markConversationSeen($conversation->id, $user->id);

        return response()->json(['status' => 'ok']);
    }


    // Reusable private helper
    private function markConversationSeen(int $conversationId, int $userId): void
    {
        $now = Carbon::now();

        $updated = Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)   // apne messages ko seen mat karo
            ->whereNull('seen_at')                  // sirf unseen messages
            ->update(['seen_at' => $now]);

        if ($updated > 0) {
            // Broadcast to conversation channel so sender sees double-tick
            event(new MessageSeen($conversationId, $userId, $now->toISOString()));
        }
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
}
