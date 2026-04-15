<?php
namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class ReactionUpdated implements ShouldBroadcastNow
{
    use Dispatchable;

    public function __construct(
        public int $conversationId,
        public int $messageId,
        public array $reactions,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("conversation.{$this->conversationId}")];
    }

    public function broadcastAs(): string
    {
        return 'reaction.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'message_id' => $this->messageId,
            'reactions'  => $this->reactions,
        ];
    }
}