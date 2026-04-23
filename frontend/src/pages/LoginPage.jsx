import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function LoginPage() {
  const navigate = useNavigate();
  const adminEmail = 'admin@pulsepay.com';
  const [selectedLoginType, setSelectedLoginType] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetForm, setResetForm] = useState({ email: '', password: '' });
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
      const loginPayload = {
        ...form,
        loginType: selectedLoginType,
      };
      console.log('[LOGIN REQUEST] POST http://localhost:5000/api/auth/login', {
        email: loginPayload.email,
        loginType: loginPayload.loginType,
      });

      const response = await api.post('/api/auth/login', {
        ...loginPayload,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('[LOGIN RESPONSE]', response.data);

      const token = response.data?.token;
      const responseRole = response.data?.role || response.data?.user?.role || selectedLoginType;
      const role = responseRole === 'admin' ? 'admin' : 'user';

      if (!token) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      console.log('[RESET PASSWORD REQUEST] POST http://localhost:5000/api/auth/reset-password', {
        email: resetForm.email,
      });

      const response = await api.post('/api/auth/reset-password', {
        email: resetForm.email,
        password: resetForm.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSuccess(response.data.message || 'Password updated successfully');
      setResetForm({ email: '', password: '' });
      setShowResetForm(false);
      setSelectedLoginType('');
      setForm({ email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
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
        <h1 className="text-3xl font-semibold text-[#334EAC]">Welcome Back</h1>
        <p className="mt-1 text-sm text-[#7096D1]">Choose login type to continue.</p>

        {!selectedLoginType ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedLoginType('admin');
                setForm({ email: adminEmail, password: '' });
                setError('');
              }}
              className="rounded-xl bg-[#334EAC] px-4 py-2.5 font-semibold text-white hover:bg-[#081F5C]"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLoginType('user');
                setForm({ email: '', password: '' });
                setError('');
              }}
              className="rounded-xl border border-[#7096D1] bg-[#7096D1] px-4 py-2.5 font-semibold text-white hover:bg-[#334EAC]"
            >
              User
            </button>
          </div>
        ) : (
          showResetForm ? (
            <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7096D1]">Reset Password</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs font-semibold text-[#334EAC] underline"
                >
                  Back
                </button>
              </div>

              <input
                type="email"
                name="email"
                value={resetForm.email}
                onChange={(event) => setResetForm((prev) => ({ ...prev, email: event.target.value }))}
                required
                placeholder="Email"
                className="w-full rounded-xl border border-[#7096D1] bg-white px-4 py-2.5 outline-none focus:border-[#334EAC]"
              />
              <input
                type="password"
                name="password"
                value={resetForm.password}
                onChange={(event) => setResetForm((prev) => ({ ...prev, password: event.target.value }))}
                required
                placeholder="New Password"
                className="w-full rounded-xl border border-[#7096D1] bg-white px-4 py-2.5 outline-none focus:border-[#334EAC]"
              />

              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}

              <button className="w-full rounded-xl bg-[#334EAC] px-4 py-2.5 font-semibold text-white hover:bg-[#081F5C]" type="submit">
                Update Password
              </button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7096D1]">
                  {selectedLoginType} Login
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLoginType('');
                    setForm({ email: '', password: '' });
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs font-semibold text-[#334EAC] underline"
                >
                  Change
                </button>
              </div>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email"
                readOnly={selectedLoginType === 'admin'}
                className="w-full rounded-xl border border-[#7096D1] bg-white px-4 py-2.5 outline-none focus:border-[#334EAC] read-only:bg-[#D0E3FF]/40"
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

              {selectedLoginType === 'admin' && (
                <p className="text-xs text-[#7096D1]">Admin email is fixed as {adminEmail}.</p>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowResetForm(true);
                  setError('');
                  setSuccess('');
                  setResetForm((prev) => ({ ...prev, email: form.email || '' }));
                }}
                className="text-left text-xs font-semibold text-[#334EAC] underline"
              >
                Forgot Password?
              </button>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}

              <button className="w-full rounded-xl bg-[#334EAC] px-4 py-2.5 font-semibold text-white hover:bg-[#081F5C]" type="submit">
                Login
              </button>
            </form>
          )
        )}

        <p className="mt-4 text-sm text-[#081F5C]/80">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-[#334EAC] underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
