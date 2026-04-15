<h1>All Users</h1>

@foreach($users as $user)
    <div style="border:1px solid #ccc; margin:10px; padding:10px;">
        <a href="/start-chat/{{ $user->id }}">
            {{ $user->name }}
        </a>
    </div>
@endforeach