<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public $message;
    public $client_id;
    public $receiver_id;

    public function __construct($message, $client_id = null, $receiver_id = null)
    {
        Log::info('Broadcasting message:', [
            'id'              => $message->id,
            'sender_id'       => $message->sender_id,
            'conversation_id' => $message->conversation_id,
            'receiver_id'     => $receiver_id,
        ]);

        $this->message     = $message->load('sender');
        $this->client_id   = $client_id;
        $this->receiver_id = $receiver_id;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
            new PrivateChannel('user.' . $this->receiver_id),
            new PrivateChannel('user.' . $this->message->sender_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'message'     => $this->message,
            'client_id'   => $this->client_id,
            'receiver_id' => $this->receiver_id,
        ];
    }
}