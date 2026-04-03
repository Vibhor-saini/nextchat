<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSeen implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $conversationId;
    public int $seenByUserId;
    public string $seenAt;

    public function __construct(int $conversationId, int $seenByUserId, string $seenAt)
    {
        $this->conversationId = $conversationId;
        $this->seenByUserId   = $seenByUserId;
        $this->seenAt         = $seenAt;
    }

    public function broadcastOn(): array
    {
        // Private channel — sirf conversation ke members sun'te hain
        return [
            new PresenceChannel("conversation.{$this->conversationId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.seen';
    }
}