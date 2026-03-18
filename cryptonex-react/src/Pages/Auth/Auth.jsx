import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AmbientBg from "../../Components/AmbientBg";
import "../../styles/global.css";
import "./Auth.css";

export default function Auth() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [plan, setPlan] = useState("free");
  const [errors, setErrors] = useState({});
  const [pwStrength, setPwStrength] = useState({
    score: 0,
    label: "Enter a password",
    color: "transparent",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  function checkStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { w: "0%", color: "transparent", label: "Enter a password" },
      { w: "25%", color: "var(--red)", label: "Weak" },
      { w: "50%", color: "#f97316", label: "Fair" },
      { w: "75%", color: "#eab308", label: "Good" },
      { w: "100%", color: "var(--green)", label: "Strong ✓" },
    ];
    setPwStrength({ score, ...levels[score] });
  }

  function validate() {
    const e = {};
    if (!form.firstName) e.firstName = "First name is required.";
    if (!form.lastName) e.lastName = "Last name is required.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email.";
    if (form.password.length < 8) e.password = "Minimum 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    if (!agree) e.terms = "You must agree to continue.";
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
    }, 1600);
  }

  function handleOAuth(provider) {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  }

  const successMsg =
    plan === "free"
      ? `Welcome, ${form.firstName}! Your free CryptoNex account is ready. Explore live markets instantly.`
      : plan === "pro"
        ? `Welcome, ${form.firstName}! Your 14-day Pro trial has started. Enjoy unlimited alerts and TradingView charts.`
        : `Welcome, ${form.firstName}! Your Institutional account is active. Our team will be in touch shortly.`;

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
              Start
              <br />
              <span className="c-gold">Trading</span>
              <br />
              Smarter.
            </h2>
            <p className="auth-vis-sub">
              Join thousands of traders who use CryptoNex to stay ahead of the
              market. Free forever. No credit card needed.
            </p>
            <div className="auth-feat-list">
              {[
                "Free forever plan — no card required",
                "3 price alerts included immediately",
                "Live heatmap · top 100 coins",
                "14-day Pro trial when you upgrade",
              ].map((label, i) => (
                <div key={i} className="auth-feat-pill">
                  <div className="afp-ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <polyline
                        points="20 6 9 17 4 12"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {label}
                </div>
              ))}
            </div>
            <div className="social-proof">
              <div className="sp-avatars">
                {["A", "S", "M"].map((l, i) => (
                  <div
                    key={i}
                    className="sp-av"
                    style={{
                      background: [
                        "linear-gradient(135deg,#fbb017,#d97706)",
                        "linear-gradient(135deg,#22c55e,#16a34a)",
                        "linear-gradient(135deg,#f87171,#dc2626)",
                      ][i],
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <span>
                Joined by <strong>12,000+</strong> traders
              </span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div
          className="auth-form-panel"
          style={{ overflowY: "auto", paddingTop: 40, paddingBottom: 40 }}
        >
          <div className="auth-box">
            {!success ? (
              <>
                <div className="auth-eyebrow">Get Started Free</div>
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-sub">
                  Already have an account? <Link to="/login">Sign in →</Link>
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="two-col">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <div className="field-wrap">
                        <span className="field-ico">
                          <UserIcon />
                        </span>
                        <input
                          type="text"
                          className="field-input"
                          placeholder="Arjun"
                          value={form.firstName}
                          onChange={update("firstName")}
                          autoComplete="given-name"
                        />
                      </div>
                      {errors.firstName && (
                        <div className="field-err show">{errors.firstName}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <div className="field-wrap">
                        <span className="field-ico">
                          <UserIcon />
                        </span>
                        <input
                          type="text"
                          className="field-input"
                          placeholder="Mehta"
                          value={form.lastName}
                          onChange={update("lastName")}
                          autoComplete="family-name"
                        />
                      </div>
                      {errors.lastName && (
                        <div className="field-err show">{errors.lastName}</div>
                      )}
                    </div>
                  </div>
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
                        value={form.email}
                        onChange={update("email")}
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
                        placeholder="Min. 8 characters"
                        value={form.password}
                        onChange={(e) => {
                          update("password")(e);
                          checkStrength(e.target.value);
                        }}
                        autoComplete="new-password"
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
                    <div className="pw-strength">
                      <div className="pw-bar">
                        <div
                          className="pw-fill"
                          style={{
                            width: pwStrength.w,
                            background: pwStrength.color,
                          }}
                        ></div>
                      </div>
                      <div className="pw-text">{pwStrength.label}</div>
                    </div>
                    {errors.password && (
                      <div className="field-err show">{errors.password}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="field-wrap">
                      <span className="field-ico">
                        <LockIcon />
                      </span>
                      <input
                        type={showConfirm ? "text" : "password"}
                        className="field-input"
                        placeholder="Repeat password"
                        value={form.confirm}
                        onChange={update("confirm")}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="field-eye"
                        onClick={() => setShowConfirm(!showConfirm)}
                        style={{
                          color: showConfirm ? "var(--gold)" : undefined,
                        }}
                      >
                        <EyeIcon />
                      </button>
                    </div>
                    {errors.confirm && (
                      <div className="field-err show">{errors.confirm}</div>
                    )}
                  </div>
                  {/* Plan selector */}
                  <div className="form-group">
                    <label className="form-label">Choose Your Plan</label>
                    <div className="plan-selector">
                      {[
                        { id: "free", name: "Free", price: "$0 / mo" },
                        { id: "pro", name: "Pro", price: "$12 / mo" },
                        {
                          id: "inst",
                          name: "Institutional",
                          price: "$49 / mo",
                        },
                      ].map((p) => (
                        <div
                          key={p.id}
                          className={`plan-opt${plan === p.id ? " active" : ""}`}
                          onClick={() => setPlan(p.id)}
                        >
                          <div className="po-name">{p.name}</div>
                          <div className="po-price">{p.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <label className="form-check" style={{ marginBottom: 22 }}>
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                    />
                    <span style={{ fontSize: 13, color: "var(--t2)" }}>
                      I agree to the <a href="#">Terms of Service</a> and{" "}
                      <a href="#">Privacy Policy</a>
                    </span>
                  </label>
                  {errors.terms && (
                    <div
                      className="field-err show"
                      style={{ marginTop: -16, marginBottom: 14 }}
                    >
                      {errors.terms}
                    </div>
                  )}
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
                        Creating account…
                      </>
                    ) : (
                      "Create My Free Account"
                    )}
                  </button>
                </form>
                <div className="or-div">or sign up with</div>
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
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "var(--green-dim)",
                    border: "1px solid var(--green-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--green)",
                    margin: "0 auto 22px",
                    fontSize: 32,
                  }}
                >
                  ✓
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 36,
                    letterSpacing: 1,
                    color: "var(--text-primary)",
                    marginBottom: 10,
                  }}
                >
                  Account Created!
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-muted)",
                    lineHeight: 1.65,
                    marginBottom: 28,
                  }}
                >
                  {successMsg}
                </p>
                <Link
                  to="/dashboard"
                  className="btn-submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    textDecoration: "none",
                  }}
                >
                  Open My Dashboard
                </Link>
              </div>
            )}
            <p className="form-terms">
              By signing up you agree to our <a href="#">Terms of Service</a>{" "}
              and <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Icons ──
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const EmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
