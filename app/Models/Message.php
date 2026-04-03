<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Conversation;

class Message extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'message',
        'seen_at',
    ];

    protected $casts = [
        'seen_at' => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(
            User::class,     // kis model se relation
            'sender_id'      // foreign key
        );
    }

    public function conversation()
    {
        return $this->belongsTo(
            Conversation::class,  // kis model se relation
            'conversation_id'     // foreign key
        );
    }
}
