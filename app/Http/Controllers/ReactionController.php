<?php
namespace App\Http\Controllers;

use App\Models\Message;
use App\Events\ReactionUpdated;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    public function toggle(Request $request, Message $message)
    {
        $emoji  = $request->validate(['emoji' => 'required|string|max:10'])['emoji'];
        $userId = auth()->id();

        $existing = $message->reactions()
            ->where('user_id', $userId)
            ->where('emoji', $emoji)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            $message->reactions()->create(['user_id' => $userId, 'emoji' => $emoji]);
        }

        $reactions = $this->buildPayload($message);

        broadcast(new ReactionUpdated($message->conversation_id, $message->id, $reactions));

        return response()->json($reactions);
    }

    public function index(Message $message)
    {
        return response()->json($this->buildPayload($message));
    }

    private function buildPayload(Message $message): array
    {
        return $message->reactions()
            ->selectRaw('emoji, COUNT(*) as count')
            ->groupBy('emoji')
            ->get()
            ->mapWithKeys(fn($row) => [
                $row->emoji => [
                    'count' => $row->count,
                    'users' => $message->reactions()
                        ->where('emoji', $row->emoji)
                        ->pluck('user_id')
                        ->toArray(),
                ]
            ])
            ->toArray();
    }
}