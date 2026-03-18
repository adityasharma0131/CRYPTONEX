import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AmbientBg from "../../Components/AmbientBg";
import "../../styles/global.css";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const e = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Please enter a valid email address.";
    if (!password) e.password = "Please enter your password.";
    return e;
  }

  function handleSubmit(e) {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    }, 1400);
  }

  function handleOAuth(provider) {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    }, 1200);
  }

  return (
    <>
      <AmbientBg variant="home" />
      <div className="auth-layout">
        {/* Left Visual */}
        <div className="auth-visual">
          <Link to="/landing" className="auth-vis-logo">
            <div className="auth-logo-mark">
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
            <span className="auth-logo-name">CryptoNex</span>
          </Link>
          <div className="auth-vis-content">
            <h2 className="auth-vis-title">
              Welcome
              <br />
              <span className="c-gold">Back,</span>
              <br />
              Trader.
            </h2>
            <p className="auth-vis-sub">
              Your markets are moving. Sign in to check your alerts, scan the
              heatmap, and stay ahead of every move.
            </p>
            <div className="auth-feat-list">
              {[
                { icon: <BellIcon />, label: "Your price alerts are waiting" },
                { icon: <GridIcon />, label: "Live heatmap updated every 30s" },
                {
                  icon: <TrendIcon />,
                  label: "Top gainers & losers refreshed live",
                },
                {
                  icon: <ChartIcon />,
                  label: "TradingView charts on every coin",
                },
              ].map((f, i) => (
                <div key={i} className="auth-feat-pill">
                  <div className="afp-ico">{f.icon}</div>
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="auth-form-panel">
          <div className="auth-box">
            {!success ? (
              <>
                <div className="auth-eyebrow">Welcome Back</div>
                <h1 className="auth-title">Sign In</h1>
                <p className="auth-sub">
                  Don't have an account?{" "}
                  <Link to="/register">Create one free →</Link>
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="field-wrap">
                      <span className="field-ico">
                        <EmailIcon />
                      </span>
                      <input
                        type="email"
                        className="field-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && (
                      <div className="field-err show">{errors.email}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="field-wrap">
                      <span className="field-ico">
                        <LockIcon />
                      </span>
                      <input
                        type={showPw ? "text" : "password"}
                        className="field-input"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="field-eye"
                        onClick={() => setShowPw(!showPw)}
                        style={{ color: showPw ? "var(--gold)" : undefined }}
                      >
                        <EyeIcon />
                      </button>
                    </div>
                    {errors.password && (
                      <div className="field-err show">{errors.password}</div>
                    )}
                  </div>
                  <div className="form-meta">
                    <label className="form-check">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />{" "}
                      Remember me
                    </label>
                    <a href="#" className="form-forgot">
                      Forgot password?
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          style={{
                            animation: "spin .8s linear infinite",
                            display: "inline-block",
                          }}
                        >
                          ↻
                        </span>{" "}
                        Signing in…
                      </>
                    ) : (
                      <>
                        <SignInIcon /> Sign In to Dashboard
                      </>
                    )}
                  </button>
                </form>
                <div className="or-div">or continue with</div>
                <div className="oauth-row">
                  <button
                    className="btn-oauth"
                    onClick={() => handleOAuth("Google")}
                    disabled={loading}
                  >
                    <GoogleIcon /> Google
                  </button>
                  <button
                    className="btn-oauth"
                    onClick={() => handleOAuth("GitHub")}
                    disabled={loading}
                  >
                    <GitHubIcon /> GitHub
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--green-dim)",
                    border: "1px solid var(--green-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--green)",
                    margin: "0 auto 20px",
                    fontSize: 28,
                  }}
                >
                  ✓
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 32,
                    letterSpacing: 1,
                    color: "var(--text-primary)",
                    marginBottom: 10,
                  }}
                >
                  Welcome Back!
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-muted)",
                    marginBottom: 28,
                  }}
                >
                  Redirecting you to the dashboard…
                </p>
                <div
                  style={{
                    width: 200,
                    height: 3,
                    background: "var(--border)",
                    borderRadius: 2,
                    margin: "0 auto",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background:
                        "linear-gradient(90deg, var(--accent), var(--accent-dim))",
                      borderRadius: 2,
                      animation: "progressFill 1.8s linear forwards",
                    }}
                  ></div>
                </div>
              </div>
            )}
            <p className="form-terms">
              By signing in you agree to our <a href="#">Terms of Service</a>{" "}
              and <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Icon components ──
const BellIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
);
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
);
const TrendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
);
const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <polyline
      points="22 12 18 12 15 21 9 3 6 12 2 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const EmailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <polyline
      points="22,6 12,13 2,6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="11"
      width="18"
      height="11"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M7 11V7a5 5 0 0 1 10 0v4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const SignInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <polyline
      points="10 17 15 12 10 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="15"
      y1="12"
      x2="3"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);
const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
