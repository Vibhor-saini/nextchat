@foreach($conversation->messages as $msg)
    <div style="border-bottom:1px solid #ccc; margin:5px; padding:5px;">
        
        @if($msg->sender_id === auth()->id())
            <strong>You:</strong>
        @else
            <strong>{{ $msg->sender->name }}:</strong>
        @endif

        <p>{{ $msg->message }}</p>
    </div>
@endforeach

<form method="POST" action="/messages">
    @csrf

    <input type="hidden" name="conversation_id" value="{{ $conversation->id }}">

    <input type="text" name="message" placeholder="Type message...">

    <button type="submit">Send</button>
</form>