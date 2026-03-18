import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AmbientBg from "../../Components/AmbientBg";
import "../../styles/global.css";
import "./Landing.css";

export default function Landing() {
  const [billing, setBilling] = useState("monthly");
  const [navScrolled, setNavScrolled] = useState(false);
  const countersRef = useRef(null);
  const countersAnimated = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            if (
              e.target.querySelector(".counter") &&
              !countersAnimated.current
            ) {
              countersAnimated.current = true;
              animateCounters();
            }
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    document
      .querySelectorAll(".reveal, .stagger")
      .forEach((el) => obs.observe(el));
    // Sector/dominance bars
    const sectorObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll(".sector-bar-fill").forEach((bar) => {
              bar.style.width = bar.getAttribute("data-w") || "0%";
            });
            e.target.querySelectorAll(".dom-bar").forEach((bar) => {
              bar.style.width = bar.getAttribute("data-w") || "0%";
            });
            sectorObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    document
      .querySelectorAll(".sector-bars, .dominance-bars")
      .forEach((el) => sectorObs.observe(el));
    return () => {
      obs.disconnect();
      sectorObs.disconnect();
    };
  }, []);

  function animateCounters() {
    document.querySelectorAll(".counter").forEach((el) => {
      const target = parseInt(el.getAttribute("data-target"));
      const dur = 1800;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * target).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  const prices = {
    monthly: {
      pro: 12,
      inst: 49,
      proPeriod: "per month · billed monthly",
      instPeriod: "per month · billed monthly",
    },
    annual: {
      pro: 10,
      inst: 39,
      proPeriod: "per month · billed annually",
      instPeriod: "per month · billed annually",
    },
  };
  const p = prices[billing];

  return (
    <>
      <AmbientBg variant="home" />
      {/* Ticker-style topbar */}
      <div className="land-ticker-wrap">
        <div className="land-ticker-label">MARKETS</div>
        <div className="land-ticker-inner">
          {STATIC_COINS.concat(STATIC_COINS).map((c, i) => (
            <span key={i} className="land-ticker-item">
              <span className="land-t-sym">{c.sym}</span>
              <span className="land-t-price">{c.p}</span>
              <span className={c.up ? "land-t-up" : "land-t-dn"}>{c.chg}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav
        className="site-nav"
        style={{
          background: navScrolled ? "rgba(12,10,6,.97)" : "rgba(12,10,6,.88)",
        }}
      >
        <Link to="/landing" className="nav-logo">
          <div className="nav-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="nav-name">CryptoNex</div>
            <div className="nav-sub">Market Intelligence</div>
          </div>
          <div className="live-pill">
            <span className="live-dot"></span>LIVE
          </div>
        </Link>
        <div className="nav-links">
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#ai-analysis" className="nav-link">
            AI Analysis
          </a>
          <a href="#pricing" className="nav-link">
            Pricing
          </a>
          <a href="#reviews" className="nav-link">
            Reviews
          </a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn-ghost-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn-gold-sm">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot"></span>
          Real-time data · 30s refresh · 100+ coins · AI-powered analysis
        </div>
        <h1 className="hero-h1">
          Crypto
          <br />
          <span className="c-gold">Markets</span>
          <br />
          <span className="c-outline">Mastered</span>
        </h1>
        <p className="hero-sub">
          Professional-grade market intelligence for every trader. Live
          heatmaps, instant price alerts, AI-powered analysis, TradingView
          charts, and real-time news — unified in one powerful dashboard.
        </p>
        <div className="hero-btns">
          <Link to="/register" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Start Free — No Card Needed
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polygon
                points="5 3 19 12 5 21 5 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            View Live Dashboard
          </Link>
        </div>
        <div className="hero-stats">
          <div className="h-stat">
            <div className="h-stat-n">
              <span className="c-gold counter" data-target="100">
                0
              </span>
              +
            </div>
            <div className="h-stat-l">Coins Tracked</div>
          </div>
          <div className="h-stat-sep"></div>
          <div className="h-stat">
            <div className="h-stat-n">
              <span className="c-gold counter" data-target="30">
                0
              </span>
              s
            </div>
            <div className="h-stat-l">Auto Refresh</div>
          </div>
          <div className="h-stat-sep"></div>
          <div className="h-stat">
            <div className="h-stat-n">
              <span className="c-gold">24</span>/7
            </div>
            <div className="h-stat-l">Live Data</div>
          </div>
          <div className="h-stat-sep"></div>
          <div className="h-stat">
            <div className="h-stat-n">
              <span className="c-gold">$0</span>
            </div>
            <div className="h-stat-l">Free Forever Plan</div>
          </div>
          <div className="h-stat-sep"></div>
          <div className="h-stat">
            <div className="h-stat-n">
              <span className="c-gold">AI</span>
            </div>
            <div className="h-stat-l">Market Analysis</div>
          </div>
        </div>
      </section>

      {/* AI Analysis Showcase */}
      <section className="section ai-section-land" id="ai-analysis">
        <div className="sec-inner">
          <div className="reveal">
            <div className="sec-tag ai-tag">
              ⬡ Powered by GPT-4o · GitHub Models
            </div>
            <h2 className="sec-h">
              AI Market <span className="c-gold">Analysis</span>
            </h2>
            <p className="sec-desc">
              Every coin detail page features a full AI-powered market analysis.
              One click generates institutional-grade insights using live price
              data and technical indicators.
            </p>
          </div>
          <div className="ai-features-grid stagger" style={{ marginTop: 52 }}>
            {AI_FEATURES.map((f, i) => (
              <div
                key={i}
                className={`ai-feat-card ai-feat-card--${f.variant}`}
              >
                <div className="aifc-icon">{f.icon}</div>
                <div className="aifc-title">{f.title}</div>
                <p className="aifc-desc">{f.desc}</p>
                <div className="aifc-demo">{f.demo}</div>
              </div>
            ))}
          </div>
          <div
            className="ai-cta-row reveal"
            style={{ marginTop: 52, textAlign: "center" }}
          >
            <div className="ai-cta-badge">
              Try it free on any coin detail page
            </div>
            <Link
              to="/dashboard"
              className="btn-primary"
              style={{ marginTop: 16, display: "inline-flex" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Open Dashboard &amp; Run AI Analysis
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="sec-inner">
          <div className="reveal">
            <div className="sec-tag">Platform Features</div>
            <h2 className="sec-h">
              Everything You Need to
              <br />
              <span className="c-gold">Trade Smarter</span>
            </h2>
            <p className="sec-desc">
              Professional tools built for traders at every level. No bloat —
              pure signal, pure speed.
            </p>
          </div>
          <div className="feat-grid stagger">
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-card">
                <div className={`feat-ico feat-ico--${f.color}`}>{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <p className="feat-desc">{f.desc}</p>
                <span className={`feat-badge feat-badge--${f.color}`}>
                  {f.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how" style={{ paddingTop: 60 }}>
        <div className="sec-inner">
          <div className="reveal" style={{ textAlign: "center" }}>
            <div className="sec-tag" style={{ textAlign: "center" }}>
              How It Works
            </div>
            <h2 className="sec-h" style={{ textAlign: "center" }}>
              Live in <span className="c-gold">60 Seconds</span>
            </h2>
          </div>
          <div className="steps-grid stagger">
            {[
              {
                n: 1,
                title: "Create Account",
                desc: "Sign up free in under a minute. No credit card required. Pick a plan later when you're ready.",
              },
              {
                n: 2,
                title: "Open Dashboard",
                desc: "Your live market overview loads instantly — heatmap, gainers, losers, charts, and news, all in one view.",
              },
              {
                n: 3,
                title: "Run AI Analysis",
                desc: "Click any coin, hit Analyse. GPT-4o generates a full market analysis with price predictions in seconds.",
              },
              {
                n: 4,
                title: "Trade Confidently",
                desc: "When your price hits, a rich notification appears instantly. No missed moves. No stale data. Ever.",
              },
            ].map((s) => (
              <div key={s.n} className="step">
                <div className="step-n">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        className="section stats-section"
        id="stats"
        style={{ paddingTop: 60, paddingBottom: 60 }}
      >
        <div className="sec-inner">
          <div
            className="reveal"
            style={{ textAlign: "center", marginBottom: 52 }}
          >
            <div className="sec-tag" style={{ textAlign: "center" }}>
              By The Numbers
            </div>
            <h2 className="sec-h" style={{ textAlign: "center" }}>
              Platform <span className="c-gold">Statistics</span>
            </h2>
          </div>
          <div className="stats-grid stagger">
            {[
              {
                icon: "🚀",
                num: 12400,
                suffix: "+",
                label: "Active Users",
                sub: "Joined in the last 30 days",
              },
              {
                icon: "⚡",
                num: 2800000,
                suffix: "",
                label: "Price Alerts Fired",
                sub: "Across all users lifetime",
              },
              {
                icon: "📊",
                num: 100,
                suffix: "+",
                label: "Coins Tracked",
                sub: "Updated every 30 seconds",
              },
              {
                icon: "🤖",
                num: 94000,
                suffix: "+",
                label: "AI Analyses Run",
                sub: "GPT-4o market reports",
              },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-icon-land">{s.icon}</div>
                <div className="stat-num">
                  <span className="counter" data-target={s.num}>
                    0
                  </span>
                  {s.suffix}
                </div>
                <div className="stat-label-land">{s.label}</div>
                <div className="stat-sub-land">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section" id="pricing">
        <div className="sec-inner">
          <div className="reveal">
            <div className="sec-tag">Simple Pricing</div>
            <h2 className="sec-h">
              Start Free.
              <br />
              <span className="c-gold">Scale When Ready.</span>
            </h2>
            <p className="sec-desc">
              No hidden fees. No surprise charges. Upgrade or downgrade any time
              you like.
            </p>
          </div>
          <div className="billing-toggle reveal" style={{ marginTop: 36 }}>
            <button
              className={`bt-btn${billing === "monthly" ? " active" : ""}`}
              onClick={() => setBilling("monthly")}
            >
              Monthly
            </button>
            <button
              className={`bt-btn${billing === "annual" ? " active" : ""}`}
              onClick={() => setBilling("annual")}
            >
              Annual <span className="bt-save">Save 20%</span>
            </button>
          </div>
          <div className="price-grid stagger">
            <PriceCard
              plan="Free"
              price={0}
              period="Forever free · no card needed"
              features={FREE_FEATURES}
              btnLabel="Get Started Free"
              btnClass="btn-plan-ghost"
              href="/register"
            />
            <PriceCard
              plan="Pro"
              price={p.pro}
              period={p.proPeriod}
              features={PRO_FEATURES}
              btnLabel="Start 14-Day Free Trial"
              btnClass="btn-plan-gold"
              href="/register"
              featured
              badge="Most Popular"
            />
            <PriceCard
              plan="Institutional"
              price={p.inst}
              period={p.instPeriod}
              features={INST_FEATURES}
              btnLabel="Contact Sales"
              btnClass="btn-plan-ghost"
              href="/register"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" id="reviews" style={{ paddingTop: 60 }}>
        <div className="sec-inner">
          <div className="reveal">
            <div className="sec-tag">Trusted by Traders</div>
            <h2 className="sec-h">
              What Our Users <span className="c-gold">Say</span>
            </h2>
          </div>
          <div className="testi-grid stagger">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testi-card">
                <div className="testi-stars">★★★★★</div>
                <p className="testi-text">"{t.text}"</p>
                <div className="testi-author">
                  <div className="testi-av">{t.initial}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-wrap">
        <div className="cta-inner reveal">
          <div className="cta-ai-badge">🤖 AI-Powered Market Intelligence</div>
          <h2 className="cta-h">
            Ready to Trade
            <br />
            <span className="c-gold">With Confidence?</span>
          </h2>
          <p className="cta-sub">
            Join thousands of traders already using CryptoNex. Start free — no
            credit card required, no commitment.
          </p>
          <div className="cta-btns">
            <Link to="/register" className="btn-primary">
              Create Free Account
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              Explore Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-row">
              <div
                className="nav-mark"
                style={{ width: 34, height: 34, borderRadius: 9 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="footer-brand-name">CryptoNex</span>
            </div>
            <p className="footer-tagline">
              Professional crypto market intelligence. Real-time data, AI
              analysis, live alerts, and beautiful charts — all in one place.
            </p>
          </div>
          <div>
            <div className="footer-col-head">Platform</div>
            <div className="footer-links-col">
              <a href="#features" className="footer-link">
                Features
              </a>
              <a href="#ai-analysis" className="footer-link">
                AI Analysis
              </a>
              <a href="#pricing" className="footer-link">
                Pricing
              </a>
              <Link to="/dashboard" className="footer-link">
                Dashboard
              </Link>
            </div>
          </div>
          <div>
            <div className="footer-col-head">Account</div>
            <div className="footer-links-col">
              <Link to="/login" className="footer-link">
                Sign In
              </Link>
              <Link to="/register" className="footer-link">
                Register
              </Link>
            </div>
          </div>
          <div>
            <div className="footer-col-head">Legal</div>
            <div className="footer-links-col">
              <a href="#" className="footer-link">
                Privacy Policy
              </a>
              <a href="#" className="footer-link">
                Terms of Service
              </a>
              <a href="#" className="footer-link">
                Not Financial Advice
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © 2025 CryptoNex · Market data via CoinGecko &amp; TradingView · AI
            via GitHub Models
          </span>
          <div className="footer-links-row">
            <a href="#">Twitter / X</a>
            <a href="#">Discord</a>
            <a href="#">Telegram</a>
          </div>
        </div>
      </footer>
    </>
  );
}

function PriceCard({
  plan,
  price,
  period,
  features,
  btnLabel,
  btnClass,
  href,
  featured,
  badge,
}) {
  return (
    <div className={`price-card${featured ? " featured" : ""}`}>
      {badge && <div className="price-badge">{badge}</div>}
      <div className="plan-name">{plan}</div>
      <div className="plan-price">
        <span className="plan-cur">$</span>
        <span className={`plan-num${featured ? " gold" : ""}`}>{price}</span>
      </div>
      <div className="plan-period">{period}</div>
      <div className="plan-div"></div>
      <div className="plan-features">
        {features.map((f, i) => (
          <div key={i} className="pf">
            <div className={`pf-y${f.ai ? " ai-check" : ""}`}>
              {f.included ? "✓" : ""}
            </div>
            <span style={!f.included ? { color: "var(--t3)" } : {}}>
              {f.label}
            </span>
          </div>
        ))}
      </div>
      <Link to={href} className={`btn-plan ${btnClass}`}>
        {btnLabel}
      </Link>
    </div>
  );
}

// ─── Static data ───────────────────────────────────────────────────────────
const STATIC_COINS = [
  { sym: "BTC", p: "$97,420", up: true, chg: "+2.14%" },
  { sym: "ETH", p: "$3,621", up: true, chg: "+1.87%" },
  { sym: "SOL", p: "$182.40", up: true, chg: "+4.22%" },
  { sym: "BNB", p: "$608.90", up: false, chg: "-0.43%" },
  { sym: "ADA", p: "$0.88", up: true, chg: "+3.11%" },
  { sym: "DOGE", p: "$0.197", up: true, chg: "+5.60%" },
];

const AI_FEATURES = [
  {
    variant: "signal",
    icon: "📈",
    title: "Buy / Hold / Sell Signal",
    desc: "AI evaluates current momentum, trend direction, volume, and technicals to generate a clear directional signal with confidence percentage.",
    demo: (
      <div>
        <div className="demo-signal buy">BUY</div>
        <div className="demo-conf">
          <span>Confidence</span>
          <div className="demo-bar">
            <div className="demo-fill" style={{ width: "78%" }}></div>
          </div>
          <span className="demo-pct">78%</span>
        </div>
      </div>
    ),
  },
  {
    variant: "sentiment",
    icon: "🧠",
    title: "Market Sentiment + Trend",
    desc: "Determines whether the market is in a bullish, bearish, or sideways phase and assigns a momentum score from 0–100 with a gauge visualization.",
    demo: (
      <div>
        <div className="demo-trend-pills">
          <span className="trend-demo bullish">▲ BULLISH</span>
          <span className="trend-demo neutral">→ SIDEWAYS</span>
          <span className="trend-demo bearish">▼ BEARISH</span>
        </div>
        <svg
          viewBox="0 0 100 56"
          xmlns="http://www.w3.org/2000/svg"
          width="110"
          style={{ display: "block", margin: "8px auto 0" }}
        >
          <path
            d="M 14 50 A 36 36 0 0 1 86 50"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 14 50 A 36 36 0 0 1 86 50"
            fill="none"
            stroke="url(#gd)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="85 28"
            pathLength="113"
          />
          <defs>
            <linearGradient id="gd" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="50%" stopColor="#fbb017" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <g transform="translate(50,50) rotate(30)">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-28"
              stroke="#fbb017"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
          <circle cx="50" cy="50" r="4" fill="#fbb017" />
        </svg>
      </div>
    ),
  },
  {
    variant: "risk",
    icon: "⚠️",
    title: "Risk & Volatility Score",
    desc: "Assigns LOW / MEDIUM / HIGH risk level with a score from 1–5 and a volatility index from 0–100 to help you size positions appropriately.",
    demo: (
      <div>
        <div className="demo-risk-meter">
          {[
            { h: "33%", bg: "var(--green-b)", a: true },
            { h: "50%", bg: "rgba(251,176,23,0.4)", a: true },
            { h: "66%", bg: "rgba(248,113,113,0.35)", a: true },
            { h: "83%", bg: "rgba(248,113,113,0.2)", a: false },
            { h: "100%", bg: "rgba(248,113,113,0.1)", a: false },
          ].map((seg, i) => (
            <div
              key={i}
              className="drm-seg"
              style={{
                height: seg.h,
                background: seg.bg,
                opacity: seg.a ? 1 : 0.2,
              }}
            ></div>
          ))}
        </div>
        <div className="drm-label">
          <span style={{ color: "var(--gold)" }}>MEDIUM</span> Risk · Score 3/5
        </div>
      </div>
    ),
  },
  {
    variant: "predictions",
    icon: "🎯",
    title: "Price Predictions (24h / 7d / 30d)",
    desc: "AI generates realistic price target ranges with low/target/high bands and % change forecasts for three time horizons, grounded in the live price.",
    demo: (
      <div className="demo-pred-rows">
        <div className="dpr">
          <span className="dpr-h short">24H</span>
          <span className="dpr-t">$68,420</span>
          <span className="dpr-c up">▲ +1.8%</span>
        </div>
        <div className="dpr">
          <span className="dpr-h mid">7D</span>
          <span className="dpr-t">$71,900</span>
          <span className="dpr-c up">▲ +7.0%</span>
        </div>
        <div className="dpr">
          <span className="dpr-h long">30D</span>
          <span className="dpr-t">$78,500</span>
          <span className="dpr-c up">▲ +16.7%</span>
        </div>
      </div>
    ),
  },
  {
    variant: "indicators",
    icon: "📊",
    title: "Technical Indicator Breakdown",
    desc: "Six key indicators analyzed: RSI, MACD, Moving Average, Volume profile, Bollinger Bands, and a contextual signal — each with strength bars.",
    demo: (
      <div className="demo-indicator-bars">
        {[
          { n: "RSI", type: "bullish", w: "22%" },
          { n: "MACD", type: "bullish", w: "18%" },
          { n: "BB", type: "bearish", w: "14%" },
        ].map((ind, i) => (
          <div key={i} className="dib">
            <span>{ind.n}</span>
            <div className="dib-track">
              <div className="dib-center"></div>
              <div
                className={`dib-fill ${ind.type}`}
                style={{ width: ind.w }}
              ></div>
            </div>
            <span
              className={`dib-sig ${ind.type === "bullish" ? "bull" : "bear"}`}
            >
              {ind.type === "bullish" ? "BULLISH" : "BEARISH"}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    variant: "sr",
    icon: "🔵",
    title: "Support & Resistance + Summary",
    desc: "Key price levels where the asset is likely to find support or face resistance, plus a 2–3 sentence AI-written market summary with typewriter animation.",
    demo: (
      <div className="demo-sr">
        <div className="dsr resistance">
          <span>Resistance</span>
          <span>$71,200</span>
          <span className="dsr-dist">+5.9%</span>
        </div>
        <div className="dsr current">
          <span>Current</span>
          <span>$67,234</span>
          <span className="dsr-dist">NOW</span>
        </div>
        <div className="dsr support">
          <span>Support</span>
          <span>$63,800</span>
          <span className="dsr-dist">-5.1%</span>
        </div>
      </div>
    ),
  },
];

const FEATURES = [
  {
    color: "green",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    title: "Live Market Heatmap",
    desc: "Market-cap weighted visualization. Spot sector rotations and momentum shifts the instant they happen.",
    badge: "Real-Time",
  },
  {
    color: "gold",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M13.73 21a2 2 0 0 1-3.46 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Smart Price Alerts",
    desc: "Set target prices above or below current levels. Rich toast notifications fire the instant your target is hit.",
    badge: "Instant Alerts",
  },
  {
    color: "blue",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polyline
          points="22 12 18 12 15 21 9 3 6 12 2 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "TradingView Charts",
    desc: "Full advanced charting on every coin detail page. Technical analysis widgets, symbol profiles, and live news timelines.",
    badge: "Pro Charts",
  },
  {
    color: "purple",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <polyline
          points="12 6 12 12 16 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "GPT-4o AI Analysis",
    desc: "One-click AI analysis on any coin. Buy/Sell/Hold signal, price predictions for 24h/7d/30d, and 6 technical indicators.",
    badge: "AI Powered",
  },
  {
    color: "orange",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polyline
          points="22 7 13.5 15.5 8.5 10.5 2 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polyline
          points="16 7 22 7 22 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Top Gainers & Losers",
    desc: "Surface the five biggest movers in either direction, refreshed every 30 seconds.",
    badge: "Market Movers",
  },
  {
    color: "green",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="m21 21-4.35-4.35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Instant Coin Search",
    desc: "Search across 100+ coins by name or symbol in real time. Results filter instantly as you type.",
    badge: "Search & Filter",
  },
];

const TESTIMONIALS = [
  {
    initial: "A",
    name: "Arjun Mehta",
    role: "Day Trader · Mumbai, IN",
    text: "The AI analysis is unreal. I clicked Analyse on BTC, and within seconds I had a full Buy signal, price targets, indicator breakdown, and a summary. It's like having a quant analyst on call 24/7.",
  },
  {
    initial: "S",
    name: "Sarah Chen",
    role: "Crypto Analyst · Singapore",
    text: "Finally a dashboard that doesn't look like it was built in 2012. The heatmap is beautiful, the search is instant, the AI predictions are surprisingly accurate, and the TradingView integration is seamless.",
  },
  {
    initial: "M",
    name: "Marcus Reid",
    role: "Portfolio Manager · London, UK",
    text: "I use the gainers/losers view every morning to scan for momentum plays, then run AI analysis on anything that looks interesting. The live data fetch on the coin page is the real MVP — no more stale inputs.",
  },
];

const FREE_FEATURES = [
  { label: "Top 100 coins live", included: true },
  { label: "Live market heatmap", included: true },
  { label: "3 price alerts", included: true },
  { label: "30s auto-refresh", included: true },
  { label: "Gainers & losers view", included: true },
  { label: "AI Market Analysis", included: false },
  { label: "TradingView charts", included: false },
];
const PRO_FEATURES = [
  { label: "Everything in Free", included: true },
  { label: "Unlimited price alerts", included: true },
  { label: "Full TradingView charts", included: true },
  { label: "GPT-4o AI Analysis", included: true, ai: true },
  { label: "Live coin news feed", included: true },
  { label: "Top 500 coins", included: true },
  { label: "10s refresh interval", included: true },
];
const INST_FEATURES = [
  { label: "Everything in Pro", included: true },
  { label: "Top 5000 coins", included: true },
  { label: "API access (unlimited)", included: true },
  { label: "Bulk AI Analysis", included: true, ai: true },
  { label: "Portfolio tracker", included: true },
  { label: "Custom alert webhooks", included: true },
  { label: "Priority support", included: true },
];
