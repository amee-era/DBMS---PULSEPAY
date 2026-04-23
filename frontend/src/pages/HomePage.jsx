import { Link } from 'react-router-dom';

const featureCards = [
  {
    title: 'ACID Transactions',
    description: 'Ensures atomic, consistent, isolated, and durable transfers.',
    icon: 'shield',
  },
  {
    title: 'Concurrency Control',
    description: 'Handles simultaneous transactions using row-level locking.',
    icon: 'refresh',
  },
  {
    title: 'Deadlock Handling',
    description: 'Detects and resolves transaction conflicts using retry logic.',
    icon: 'alert',
  },
  {
    title: 'Transaction Logging',
    description: 'Designed for transparent banking workflows.',
  },
  {
    title: 'XML Data Representation',
    description: 'Designed for transparent banking workflows.',
  },
];

const FeatureIcon = ({ type }) => {
  const iconClass = 'h-5 w-5 text-[#334EAC]';

  if (type === 'shield') {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'refresh') {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M20 6v5h-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 18v-5h5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.6 8.1A7 7 0 0 1 19 11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.4 15.9A7 7 0 0 1 5 13" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 9v4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.3 3.4 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

function HomePage() {
  return (
    <>
      <style>{`@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600&display=swap");`}</style>
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_10%,rgba(255,245,191,0.72),transparent_24%),radial-gradient(circle_at_87%_18%,rgba(255,241,173,0.55),transparent_28%),linear-gradient(145deg,#F2E199_0%,#FFF9F0_56%,#FFF7E6_100%)] px-6 py-10 text-[#1B3A68] md:py-14" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="pointer-events-none absolute -left-16 top-20 h-56 w-56 rounded-full bg-[rgba(255,221,110,0.28)] blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-44 h-64 w-64 rounded-full bg-[rgba(255,233,140,0.24)] blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-12 h-2 w-2 rounded-full bg-white/60 shadow-[0_0_12px_rgba(255,236,156,0.9)]" />
        <div className="pointer-events-none absolute left-[62%] top-24 h-1.5 w-1.5 rounded-full bg-[#fff7d0]/70 shadow-[0_0_10px_rgba(255,236,156,0.85)]" />
        <div className="pointer-events-none absolute left-[78%] top-[36%] h-1.5 w-1.5 rounded-full bg-white/60 shadow-[0_0_9px_rgba(255,236,156,0.8)]" />
        <div className="pointer-events-none absolute left-[18%] top-[48%] h-1 w-1 rounded-full bg-[#fff7d0]/80 shadow-[0_0_8px_rgba(255,236,156,0.75)]" />
        <div className="pointer-events-none absolute right-[14%] top-[72%] h-2 w-2 rounded-full bg-white/55 shadow-[0_0_10px_rgba(255,236,156,0.85)]" />
        <div className="pointer-events-none absolute left-[36%] top-[78%] h-1 w-1 rounded-full bg-[#fff7d0]/75 shadow-[0_0_8px_rgba(255,236,156,0.75)]" />

      <section className="mx-auto w-full max-w-5xl text-center">
        <h1 className="relative font-['Playfair_Display'] text-5xl font-bold tracking-[0.02em] text-[#1B3A68] drop-shadow-[0_0_14px_rgba(255,223,117,0.55)] md:text-6xl">
          <span className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-16 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,224,118,0.32)] blur-2xl" />
          PulsePay
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[#4b6d95] md:text-xl">
          ACID-first digital wallet with admin analytics.
        </p>
      </section>

      <section className="mx-auto mt-12 w-full max-w-6xl">
        <div className="grid gap-5 md:grid-cols-3">
          {featureCards.slice(0, 3).map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-[rgba(255,218,130,0.65)] bg-[#F7F2EB] p-5 shadow-[0_14px_28px_-18px_rgba(27,58,104,0.35)] transition duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_36px_-20px_rgba(27,58,104,0.5),0_0_18px_rgba(255,223,117,0.38)]"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#6FB8E6]/45 bg-[#6FB8E6]/18">
                <FeatureIcon type={feature.icon} />
              </div>
              <h3 className="font-['Playfair_Display'] text-lg font-semibold text-[#1B3A68]">{feature.title}</h3>
              <p className="mt-2 text-sm text-[#355577]">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-5 grid max-w-2xl gap-3 md:grid-cols-2">
          {featureCards.slice(3).map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-[rgba(255,218,130,0.65)] bg-[#F7F2EB] p-5 text-center shadow-[0_14px_28px_-18px_rgba(27,58,104,0.35)] transition duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_36px_-20px_rgba(27,58,104,0.5),0_0_18px_rgba(111,184,230,0.33)]"
            >
              <h3 className="font-['Playfair_Display'] text-lg font-semibold text-[#1B3A68]">{feature.title}</h3>
              <p className="mt-2 text-sm text-[#355577]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 w-full max-w-4xl rounded-2xl border border-[rgba(255,218,130,0.7)] bg-[#F7F2EB] p-6 shadow-[0_14px_30px_-20px_rgba(27,58,104,0.35)]">
          <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1B3A68]">Get Started</h2>
          <p className="mt-2 text-[#355577]">Create your account or sign in to access your wallet.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-xl bg-[#1B3A68] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_12px_rgba(255,223,117,0.42)] transition hover:bg-[#244a82] hover:shadow-[0_0_18px_rgba(255,223,117,0.55)]"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-[#6FB8E6] bg-[#6FB8E6] px-5 py-2.5 text-sm font-semibold text-[#1B3A68] transition hover:bg-[#8cc9ef]"
            >
              Login
            </Link>
          </div>
      </section>

      <section className="mx-auto mt-8 w-full max-w-4xl rounded-2xl border border-[#1B3A68]/40 bg-[#1B3A68] p-6 shadow-[0_12px_26px_-18px_rgba(8,31,92,0.55)]">
          <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-white">How It Works</h2>
          <ol className="mt-4 space-y-2 text-[#d8ecff]">
            <li>1. Register and choose your role (user or admin).</li>
            <li>2. Login to receive a secure JWT session token.</li>
            <li>3. Users transfer funds, admins monitor all transaction activity.</li>
          </ol>
      </section>
    </main>
    </>
  );
}

export default HomePage;
