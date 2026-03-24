<form method="POST" action="/users">
    @csrf

    <input name="name" placeholder="Name">
    <input name="email" placeholder="Email">
    <input name="password" type="password" placeholder="Password">

    <button>Create</button>
</form>