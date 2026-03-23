<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Message;

class Conversation extends Model
{
    protected $fillable = [
        'type',
        'name'
    ];


    public function users()
    {
        return $this->belongsToMany(
            User::class,           // kis model se relation
            'conversation_user',   // pivot table
            'conversation_id',     // current model ka FK
            'user_id'              // related model ka FK
        );
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
