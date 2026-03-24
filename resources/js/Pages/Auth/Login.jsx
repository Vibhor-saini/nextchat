import React from 'react';
import { useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: ''
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-0 sm:p-4">

            <div className="w-full min-h-screen sm:min-h-0 sm:w-[450px] p-8 sm:p-10
                flex flex-col justify-center 
                bg-white sm:bg-white/80 sm:backdrop-blur-xl 
                sm:rounded-3xl sm:shadow-2xl border-none sm:border sm:border-white/40">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        NextChat
                    </h1>
                    <p className="text-gray-500 mt-3 text-lg">
                        Welcome back!
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            /* Using py-4 for better mobile tap target */
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-[0.99] transition-transform disabled:opacity-50"
                    >
                        {processing ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                {/* <p className="mt-8 text-center text-gray-600">
                    New here? <a href="#" className="text-indigo-600 font-bold">Create account</a>
                </p> */}
            </div>
        </div>
    );
}