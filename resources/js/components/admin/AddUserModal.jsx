import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function AddUserModal({ onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = () => {
    setLoading(true);
    router.post('/admin/users', form, {
      onError: (errs) => {
        setErrors(errs);
        setLoading(false);
      },
      onSuccess: () => {
        setLoading(false);
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-[#242424]">Register New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        {/* Fields */}
        <div className="space-y-3">

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#5b5fc7] transition-colors"
            />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#5b5fc7] transition-colors"
            />
            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#5b5fc7] transition-colors"
            />
            {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Confirm Password</label>
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#5b5fc7] transition-colors"
            />
          </div>

          <div>
            <input type="hidden" name="role" value="user"/>
          </div>
          


        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold bg-[#5b5fc7] text-white rounded-md hover:bg-[#4a4eb5] transition-colors disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register User'}
          </button>
        </div>

      </div>
    </div>
  );
}