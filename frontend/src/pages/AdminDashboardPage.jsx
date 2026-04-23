import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../api';

const STATUS_OPTIONS = ['ALL', 'SUCCESS', 'FAILED', 'RETRIED'];

const getStatusChip = (status) => {
  const normalized = String(status || '').toUpperCase();

  if (normalized === 'SUCCESS') {
    return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
  }

  if (normalized === 'FAILED') {
    return 'bg-red-100 text-red-700 ring-1 ring-red-200';
  }

  return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
};

const StatIcon = ({ type }) => {
  const base = 'h-5 w-5';

  if (type === 'total') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base}>
        <path d="M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 15v-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15V9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 15V6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'success') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base}>
        <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'failed') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base}>
        <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m9 9 6 6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m15 9-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base}>
      <path d="M20 6v5h-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 18v-5h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.6 8.1A7 7 0 0 1 19 11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.4 15.9A7 7 0 0 1 5 13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalTransactions: 0,
    failedTransactions: 0,
    retriedTransactions: 0,
    transactions: [],
  });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [simulatedTransactions, setSimulatedTransactions] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [simulating, setSimulating] = useState(false);

  const loadData = async () => {
    try {
      const response = await api.get('/api/admin/dashboard');
      setData(response.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const recentFromData = data.transactions.slice(0, 6).map((tx) => ({
      id: `activity-${tx.id}`,
      time: tx.createdAt,
      message:
        String(tx.status).toUpperCase() === 'FAILED'
          ? `Transaction failed between ${tx.sender?.email || 'Unknown'} and ${tx.receiver?.email || 'Unknown'}`
          : `User ${tx.sender?.email || 'Unknown'} sent $${Number(tx.amount || 0).toFixed(2)} to ${tx.receiver?.email || 'Unknown'}`,
      level: String(tx.status).toUpperCase(),
    }));

    setActivityFeed((prev) => {
      const simulatedOnly = prev.filter((item) => item.id.startsWith('sim-'));
      return [...simulatedOnly, ...recentFromData]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 12);
    });
  }, [data.transactions]);

  const successfulTransactions = useMemo(() => {
    const fromList = data.transactions.filter((tx) => String(tx.status).toUpperCase() === 'SUCCESS').length;
    if (fromList > 0) return fromList;

    return Math.max(
      (data.totalTransactions || 0) - (data.failedTransactions || 0) - (data.retriedTransactions || 0),
      0,
    );
  }, [data]);

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return data.transactions.filter((tx) => {
      const status = String(tx.status || '').toUpperCase();
      const sender = String(tx.sender?.email || '').toLowerCase();
      const receiver = String(tx.receiver?.email || '').toLowerCase();

      const statusOk = statusFilter === 'ALL' || status === statusFilter;
      const searchOk = !query || sender.includes(query) || receiver.includes(query);

      return statusOk && searchOk;
    });
  }, [data.transactions, searchTerm, statusFilter]);

  const failedRetriedTransactions = useMemo(
    () =>
      data.transactions.filter((tx) => {
        const status = String(tx.status || '').toUpperCase();
        return status === 'FAILED' || status === 'RETRIED';
      }),
    [data.transactions],
  );

  const transactionsForCharts = useMemo(
    () => [...data.transactions, ...simulatedTransactions],
    [data.transactions, simulatedTransactions],
  );

  const overviewChartData = useMemo(() => {
    const grouped = new Map();

    transactionsForCharts.forEach((tx) => {
      const key = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Unknown';
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([date, count]) => ({ date, count }))
      .slice(-7);
  }, [transactionsForCharts]);

  const statusChartData = useMemo(() => {
    const base = { SUCCESS: 0, FAILED: 0, RETRIED: 0 };

    transactionsForCharts.forEach((tx) => {
      const status = String(tx.status || '').toUpperCase();
      if (base[status] !== undefined) {
        base[status] += 1;
      }
    });

    return [
      { name: 'SUCCESS', value: base.SUCCESS, color: '#16a34a' },
      { name: 'FAILED', value: base.FAILED, color: '#dc2626' },
      { name: 'RETRIED', value: base.RETRIED, color: '#d97706' },
    ];
  }, [transactionsForCharts]);

  const handleSimulateTransactions = () => {
    setSimulating(true);

    const now = Date.now();
    const mockRows = [
      {
        id: `sim-${now}-1`,
        sender: { email: 'demo.userA@pulsepay.local' },
        receiver: { email: 'demo.userB@pulsepay.local' },
        amount: 500,
        status: 'SUCCESS',
        retry_count: 0,
        createdAt: new Date(now).toISOString(),
      },
      {
        id: `sim-${now}-2`,
        sender: { email: 'demo.userB@pulsepay.local' },
        receiver: { email: 'demo.userA@pulsepay.local' },
        amount: 1200,
        status: 'FAILED',
        retry_count: 1,
        createdAt: new Date(now + 1000).toISOString(),
      },
      {
        id: `sim-${now}-3`,
        sender: { email: 'demo.userC@pulsepay.local' },
        receiver: { email: 'demo.userD@pulsepay.local' },
        amount: 300,
        status: 'RETRIED',
        retry_count: 2,
        createdAt: new Date(now + 2000).toISOString(),
      },
    ];

    setSimulatedTransactions((prev) => [...mockRows, ...prev].slice(0, 12));
    setActivityFeed((prev) => {
      const simulatedEvents = [
        {
          id: `sim-activity-${now}-1`,
          time: new Date(now).toISOString(),
          message: 'User A sent ₹500 to User B (simulation).',
          level: 'SUCCESS',
        },
        {
          id: `sim-activity-${now}-2`,
          time: new Date(now + 1000).toISOString(),
          message: 'Transaction failed due to insufficient balance (simulation).',
          level: 'FAILED',
        },
        {
          id: `sim-activity-${now}-3`,
          time: new Date(now + 2000).toISOString(),
          message: 'Retry attempt successful (simulation).',
          level: 'RETRIED',
        },
      ];

      return [...simulatedEvents, ...prev]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 12);
    });

    window.setTimeout(() => setSimulating(false), 500);
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] px-4 py-8 md:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#334EAC]/40 bg-[#081F5C] p-6 shadow-[0_14px_35px_-20px_rgba(8,31,92,0.7)]">
          <div>
            <h1 className="text-3xl font-semibold text-white">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-[#D0E3FF]">Transaction Monitoring &amp; System Overview</p>
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

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#D0E3FF] bg-gradient-to-br from-[#F7F2EB] to-[#D0E3FF] p-5 shadow-[0_14px_30px_-20px_rgba(8,31,92,0.45)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#334EAC]">Total Transactions</p>
              <div className="rounded-lg bg-white/70 p-2 text-[#334EAC]">
                <StatIcon type="total" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#081F5C]">{data.totalTransactions}</p>
          </div>

          <div className="rounded-2xl border border-[#D0E3FF] bg-gradient-to-br from-[#F7F2EB] to-[#7096D1]/25 p-5 shadow-[0_14px_30px_-20px_rgba(8,31,92,0.45)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#334EAC]">Successful</p>
              <div className="rounded-lg bg-white/70 p-2 text-[#334EAC]">
                <StatIcon type="success" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#081F5C]">{successfulTransactions}</p>
          </div>

          <div className="rounded-2xl border border-[#D0E3FF] bg-gradient-to-br from-[#F7F2EB] to-[#D0E3FF]/70 p-5 shadow-[0_14px_30px_-20px_rgba(8,31,92,0.45)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#334EAC]">Failed</p>
              <div className="rounded-lg bg-white/70 p-2 text-[#334EAC]">
                <StatIcon type="failed" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#081F5C]">{data.failedTransactions}</p>
          </div>

          <div className="rounded-2xl border border-[#D0E3FF] bg-gradient-to-br from-[#F7F2EB] to-[#7096D1]/35 p-5 shadow-[0_14px_30px_-20px_rgba(8,31,92,0.45)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#334EAC]">Retried</p>
              <div className="rounded-lg bg-white/70 p-2 text-[#334EAC]">
                <StatIcon type="retried" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#081F5C]">{data.retriedTransactions}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-[#D0E3FF] bg-[#F7F2EB] p-5 shadow-[0_14px_35px_-22px_rgba(8,31,92,0.45)] transition hover:-translate-y-0.5 hover:bg-[#D0E3FF]/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#334EAC]">Simulation Controls</h2>
              <p className="text-sm text-[#081F5C]/80">Runs local demo transactions for UI proof without writing to backend data.</p>
            </div>
            <button
              type="button"
              onClick={handleSimulateTransactions}
              disabled={simulating}
              className="rounded-xl bg-[#334EAC] px-4 py-2 text-white shadow hover:bg-[#081F5C] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {simulating ? 'Simulating...' : 'Simulate Transactions'}
            </button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#D0E3FF] bg-[#F7F2EB] p-5 shadow-[0_14px_35px_-22px_rgba(8,31,92,0.45)] transition hover:-translate-y-0.5 hover:bg-[#D0E3FF]/50">
            <h2 className="text-lg font-semibold text-[#334EAC]">Transactions Overview</h2>
            <p className="mt-1 text-sm text-[#081F5C]/80">Number of transactions over time.</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#334EAC" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-[#D0E3FF] bg-[#F7F2EB] p-5 shadow-[0_14px_35px_-22px_rgba(8,31,92,0.45)] transition hover:-translate-y-0.5 hover:bg-[#D0E3FF]/50">
            <h2 className="text-lg font-semibold text-[#334EAC]">Status Distribution</h2>
            <p className="mt-1 text-sm text-[#081F5C]/80">Success, failed, and retried transaction share.</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="space-y-4 rounded-2xl border border-[#D0E3FF] bg-[#F7F2EB] p-5 shadow-[0_14px_35px_-22px_rgba(8,31,92,0.45)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[#334EAC]">All Transactions</h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-[#7096D1] bg-white px-3 py-2 text-sm text-[#081F5C] outline-none focus:border-[#334EAC]"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === 'ALL' ? 'All Statuses' : option}
                  </option>
                ))}
              </select>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search sender/receiver email"
                className="min-w-56 rounded-xl border border-[#7096D1] bg-white px-3 py-2 text-sm text-[#081F5C] outline-none focus:border-[#334EAC]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#D0E3FF]">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#334EAC] text-left text-xs uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Sender Email</th>
                  <th className="px-4 py-3">Receiver Email</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Retry Count</th>
                  <th className="px-4 py-3">Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#081F5C]/70">
                      No transactions match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <tr
                      key={tx.id}
                      className={`${index % 2 === 0 ? 'bg-[#F7F2EB]' : 'bg-[#FFF9F0]'} border-t border-[#D0E3FF] transition hover:bg-[#D0E3FF]/70`}
                    >
                      <td className="px-4 py-3 text-[#081F5C]">{tx.sender?.email || '-'}</td>
                      <td className="px-4 py-3 text-[#081F5C]">{tx.receiver?.email || '-'}</td>
                      <td className="px-4 py-3 font-medium text-[#081F5C]">${Number(tx.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusChip(tx.status)}`}>
                          {String(tx.status || '').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#081F5C]">{tx.retry_count ?? 0}</td>
                      <td className="px-4 py-3 text-[#081F5C]/75">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[#D0E3FF] bg-[#F7F2EB] p-5 shadow-[0_14px_35px_-22px_rgba(8,31,92,0.45)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#334EAC]">Failed &amp; Retried Transactions</h2>
            <span className="text-sm text-[#081F5C]/80">Focused exception view</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#D0E3FF]">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#334EAC] text-left text-xs uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Receiver</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Retry Count</th>
                </tr>
              </thead>
              <tbody>
                {failedRetriedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-[#081F5C]/70">
                      No failed or retried transactions found.
                    </td>
                  </tr>
                ) : (
                  failedRetriedTransactions.slice(0, 12).map((tx, index) => (
                    <tr
                      key={`focused-${tx.id}`}
                      className={`${index % 2 === 0 ? 'bg-[#F7F2EB]' : 'bg-[#FFF9F0]'} border-t border-[#D0E3FF] transition hover:bg-[#D0E3FF]/70`}
                    >
                      <td className="px-4 py-3 text-[#081F5C]">{tx.sender?.email || '-'}</td>
                      <td className="px-4 py-3 text-[#081F5C]">{tx.receiver?.email || '-'}</td>
                      <td className="px-4 py-3 font-medium text-[#081F5C]">${Number(tx.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusChip(tx.status)}`}>
                          {String(tx.status || '').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#081F5C]">{tx.retry_count ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[#D0E3FF] bg-[#F7F2EB] p-5 shadow-[0_14px_35px_-22px_rgba(8,31,92,0.45)]">
          <h2 className="text-xl font-semibold text-[#334EAC]">Recent Activity</h2>
          <div className="space-y-2">
            {activityFeed.length === 0 ? (
              <p className="rounded-xl bg-[#D0E3FF]/40 px-4 py-3 text-sm text-[#081F5C]/70">No recent activity available.</p>
            ) : (
              activityFeed.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D0E3FF] bg-[#FFF9F0] px-4 py-3"
                >
                  <p className="text-sm text-[#081F5C]">{item.message}</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusChip(item.level)}`}>
                      {String(item.level || 'INFO').toUpperCase()}
                    </span>
                    <time className="text-xs text-[#081F5C]/70">{new Date(item.time).toLocaleString()}</time>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
