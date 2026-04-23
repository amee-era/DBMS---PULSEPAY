import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function UserDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ receiverEmail: '', amount: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDashboard = async () => {
    try {
      const response = await api.get('/api/user/dashboard');
      setUser(response.data.user);
      setTransactions(response.data.transactions);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleTransfer = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const payload = {
        receiverEmail: form.receiverEmail,
        amount: Number(form.amount),
      };

      const response = await api.post('/api/user/transfer', payload);
      setMessage(response.data.message);
      setForm({ receiverEmail: '', amount: '' });
      loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
      loadDashboard();
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#081F5C] p-5 shadow-[0_16px_30px_-20px_rgba(8,31,92,0.7)]">
          <div>
            <h1 className="text-3xl font-semibold text-white">User Dashboard</h1>
            <p className="text-sm text-[#D0E3FF]">Manage balance and transfers.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-semibold text-[#D0E3FF] underline hover:text-white">
              Home
            </Link>
            <button className="rounded-xl bg-[#334EAC] px-4 py-2 text-white hover:bg-[#081F5C]" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-[#D0E3FF] bg-[#F7F2EB] p-5 shadow-[0_12px_24px_-18px_rgba(8,31,92,0.45)] transition hover:-translate-y-0.5 hover:bg-[#D0E3FF]/45">
          <h2 className="text-xl font-semibold text-[#334EAC]">Current Balance</h2>
          <p className="mt-2 text-3xl font-bold text-emerald-600">${user?.balance?.toFixed(2) || '0.00'}</p>
        </section>

        <section className="rounded-2xl border border-[#D0E3FF] bg-[#F7F2EB] p-5 shadow-[0_12px_24px_-18px_rgba(8,31,92,0.45)] transition hover:-translate-y-0.5 hover:bg-[#D0E3FF]/45">
          <h2 className="text-xl font-semibold text-[#334EAC]">Transfer Money</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handleTransfer}>
            <input
              type="email"
              value={form.receiverEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, receiverEmail: e.target.value }))}
              placeholder="Receiver email"
              required
              className="rounded-xl border border-[#7096D1] bg-white px-4 py-2.5 outline-none focus:border-[#334EAC]"
            />
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="Amount"
              required
              className="rounded-xl border border-[#7096D1] bg-white px-4 py-2.5 outline-none focus:border-[#334EAC]"
            />
            <button type="submit" className="rounded-xl bg-[#334EAC] px-4 py-2.5 font-semibold text-white hover:bg-[#081F5C]">
              Send
            </button>
          </form>
          {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        <section className="rounded-2xl border border-[#D0E3FF] bg-[#F7F2EB] p-5 shadow-[0_12px_24px_-18px_rgba(8,31,92,0.45)]">
          <h2 className="text-xl font-semibold text-[#334EAC]">Transaction History</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[#D0E3FF]">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#334EAC] text-left text-white">
                  <th className="px-3 py-2">Sender</th>
                  <th className="px-3 py-2">Receiver</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Retries</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={tx.id} className={`${index % 2 === 0 ? 'bg-[#F7F2EB]' : 'bg-[#FFF9F0]'} border-b border-[#D0E3FF] hover:bg-[#D0E3FF]/70`}>
                    <td className="px-3 py-2">{tx.sender?.email}</td>
                    <td className="px-3 py-2">{tx.receiver?.email}</td>
                    <td className="px-3 py-2">${tx.amount.toFixed(2)}</td>
                    <td className="px-3 py-2">{tx.status}</td>
                    <td className="px-3 py-2">{tx.retry_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserDashboardPage;
