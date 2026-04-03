import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" }
];

const features = [
  { title: "Live Signals", text: "Real-time RSI, MACD, and trend bias tuned for gold volatility." },
  { title: "London Breakout Strategy", text: "Battle-tested kill zone logic with clear entries, stops, and targets." },
  { title: "Risk Management", text: "Position sizing, drawdown guardrails, and alerting baked in." },
];

const testimonials = [
  { name: "Amina K.", role: "Prop Trader", quote: "+6.2% month with disciplined risk. The alerts keep me honest." },
  { name: "Diego M.", role: "Swing Trader", quote: "London breakout logic is the cleanest I've used — minimal noise." },
  { name: "Sofia L.", role: "New to Gold", quote: "Onboarding was painless. I started in demo, then went live in days." },
];

const plans = [
  { name: "Free", price: "$0", period: "forever", perks: ["Live price", "Basic signals"], cta: "Start Free" },
  { name: "Pro", price: "$29", period: "/mo", perks: ["All 4 strategies", "Backtester", "Alerts"], highlighted: true, cta: "Go Pro" },
  { name: "Elite", price: "$79", period: "/mo", perks: ["Monte Carlo", "Strategy comparison", "CSV export"], cta: "Get Elite" },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-amber-300/20 ring-2 ring-amber-300/40 flex items-center justify-center">
            <span className="text-amber-300 font-bold text-sm">G</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-amber-200">GoldFlip Pro</span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-amber-300/50 bg-amber-300/10 px-2 py-1 text-[11px] font-semibold text-amber-100">
              Demo-ready
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-slate-300 hover:text-amber-200">
              {item.label}
            </a>
          ))}
          <Link
            to="/app"
            className="rounded-full border border-amber-300/60 bg-amber-300/10 px-4 py-2 text-amber-200 hover:bg-amber-300/15"
          >
            Launch App
          </Link>
        </nav>

        <button
          className="md:hidden rounded-lg border border-slate-700 bg-slate-900/80 p-2 text-slate-200 hover:border-amber-300"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {menuOpen ? (
        <div className="mx-6 mb-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/app"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg bg-amber-300 px-4 py-2 text-center font-semibold text-slate-900 hover:bg-amber-200"
            >
              Launch App
            </Link>
            <a
              href="#pricing"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-center text-amber-200 hover:border-amber-300"
            >
              View Pricing
            </a>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-6 space-y-16 pb-16">
        <section className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-amber-300">
              Demo ready <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-amber-100 leading-tight">Trade Gold Like the Top 1%</h1>
            <p className="text-lg text-slate-300 max-w-xl">Institutional-grade breakout logic, risk controls, and Monte Carlo stress tests — packaged for fast decision-making.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/app" className="rounded-lg bg-amber-300 px-5 py-3 text-slate-900 font-semibold hover:bg-amber-200">Launch App</Link>
              <a href="#pricing" className="rounded-lg border border-slate-700 px-5 py-3 text-slate-200 hover:border-amber-300 hover:text-amber-200">View Pricing</a>
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="rounded-lg border border-amber-300 px-4 py-3 text-amber-200 hover:bg-amber-300/10"
                >
                  Install App
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" /> Live-ready feed
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" /> Safe demo mode
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/5 p-6 shadow-2xl shadow-amber-300/20">
            <p className="text-sm text-amber-100 mb-2">What you get</p>
            <ul className="space-y-2 text-slate-100">
              <li>• Live XAU/USD signals with kill-zone timing</li>
              <li>• Backtester + Monte Carlo stress on any strategy mix</li>
              <li>• Alerts, CSV export, and risk guardrails</li>
            </ul>
          </div>
        </section>

        <section id="features" className="grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg">
              <p className="text-sm uppercase tracking-[0.15em] text-amber-200 mb-2">{f.title}</p>
              <p className="text-slate-300 text-sm">{f.text}</p>
            </div>
          ))}
        </section>

        <section id="testimonials" className="space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Testimonials</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg">
                <p className="text-sm text-slate-200">“{t.quote}”</p>
                <p className="mt-3 text-xs text-amber-200 font-semibold">{t.name} • {t.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="space-y-6">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Pricing</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-2xl border p-6 shadow-lg ${p.highlighted ? "border-amber-300 bg-amber-300/10 shadow-amber-300/30" : "border-slate-800 bg-slate-900/70"}`}>
                <p className="text-lg font-semibold text-amber-100">{p.name}</p>
                <p className="text-3xl font-bold text-slate-50 mt-2">{p.price}<span className="text-base text-slate-400">{p.period}</span></p>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  {p.perks.map((perk) => (
                    <li key={perk}>• {perk}</li>
                  ))}
                </ul>
                <Link to="/app" className={`mt-6 inline-block rounded-lg px-4 py-2 text-sm font-semibold ${p.highlighted ? "bg-amber-300 text-slate-900 hover:bg-amber-200" : "border border-slate-700 text-amber-200 hover:border-amber-300"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
