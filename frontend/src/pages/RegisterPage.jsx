import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const registerPayload = {
        ...form,
        role: 'user',
      };
      console.log('[REGISTER REQUEST] POST http://localhost:5000/api/auth/register', {
        email: registerPayload.email,
        role: registerPayload.role,
      });

      await api.post('/api/auth/register', registerPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSuccess('Registration successful. Please login.');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF9F0] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#D0E3FF] bg-[#F7F2EB] p-7 shadow-[0_16px_32px_-18px_rgba(8,31,92,0.4)]">
        <div className="mb-3 flex justify-end">
          <Link to="/" className="text-sm font-semibold text-[#334EAC] underline hover:text-[#081F5C]">
            Home
          </Link>
        </div>
        <h1 className="text-3xl font-semibold text-[#334EAC]">Create Account</h1>
        <p className="mt-1 text-sm text-[#7096D1]">Set up your PulsePay account in seconds.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="w-full rounded-xl border border-[#7096D1] bg-white px-4 py-2.5 outline-none focus:border-[#334EAC]"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Password"
            className="w-full rounded-xl border border-[#7096D1] bg-white px-4 py-2.5 outline-none focus:border-[#334EAC]"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button className="w-full rounded-xl bg-[#334EAC] px-4 py-2.5 font-semibold text-white hover:bg-[#081F5C]" type="submit">
            Register
          </button>
        </form>

        <p className="mt-4 text-sm text-[#081F5C]/80">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#334EAC] underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
