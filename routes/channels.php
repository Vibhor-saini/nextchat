<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports.
|
*/

Broadcast::channel('conversation.{id}', function ($user, $id) {
    return DB::table('conversation_user')
        ->where('conversation_id', $id)
        ->where('user_id', $user->id)
        ->exists();
});