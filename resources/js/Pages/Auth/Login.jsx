import React from 'react';
import { useForm } from '@inertiajs/react';

export default function Login() {

    const { data, setData, post } = useForm({
        email: '',
        password: ''
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <form onSubmit={submit}>
            <input
                type="email"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                placeholder="Email"
            />

            <input
                type="password"
                value={data.password}
                onChange={e => setData('password', e.target.value)}
                placeholder="Password"
            />

            <button type="submit">Login</button>
        </form>
    );
}