@foreach($conversations as $chat)
    <div style="border:1px solid #ccc; margin:10px; padding:10px;">
        
        <a href="/chat/{{ $chat->id }}">
            <strong>
                @foreach($chat->users as $u)
                    @if($u->id !== auth()->id())
                        {{ $u->name }}
                    @endif
                @endforeach
            </strong>
        </a>

        @php $lastMsg = $chat->latestMessage; @endphp

        <p>
            @if($lastMsg)
                @if($lastMsg->sender_id === auth()->id())
                    You: {{ $lastMsg->message }}
                @else
                    {{ $lastMsg->sender->name }}: {{ $lastMsg->message }}
                @endif
            @else
                No messages yet
            @endif
        </p>

    </div>
@endforeach