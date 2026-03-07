import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../state/auth";
import { useNavigate } from "react-router-dom";

type LoginMode = "phone" | "email";

export default function LoginPage() {
  const login = useAuth((s) => s.login);
  const loading = useAuth((s) => s.loading);

  const [mode, setMode] = useState<LoginMode>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");  
  const [show, setShow] = useState(false);

  const phoneDigits = phone.replace(/\D/g, "").slice(0, 9);

  const formattedPhone = useMemo(() => {
    const d = phoneDigits;
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 5);
    const p3 = d.slice(5, 7);
    const p4 = d.slice(7, 9);

    let out = "";
    if (p1) out += `(${p1}`;
    if (p1.length === 2) out += `)`;
    if (p2) out += ` ${p2}`;
    if (p3) out += `-${p3}`;
    if (p4) out += `-${p4}`;
    return out;
  }, [phoneDigits]);

  const can = useMemo(() => {
    if (mode === "phone") {
      return phoneDigits.length === 9 && pass.trim().length >= 3;
    }
    return /\S+@\S+\.\S+/.test(email.trim()) && pass.trim().length >= 3;
  }, [mode, phoneDigits, email, pass]);

  const handleSubmit = () => {
    if (!can) return;

    const credential =
      mode === "phone" ? `+998${phoneDigits}` : email.trim();

    login(credential, pass);
  };

  const handleLogin = async () => {
    try {
      await login(email, pass);
    } catch (e) {
      alert("Login failed");
    }
  };
  

  const navigate = useNavigate();
const isAuthed = useAuth((s) => s.isAuthed);
const role = useAuth((s) => s.role);

useEffect(() => {
  if (isAuthed) {
    if (role === "teacher") {
      navigate("/teacher/dashboard");
    } else {
      navigate("/admin/dashboard");
    }
  }
}, [isAuthed, role]);

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-glow" />

        <div className="login-logo">
          <div className="lm">
           <img src="/logotip.png" height={44} width={44} className="width:44px;height:44px;object-fit:contain" alt="" />
          </div>
          <span>
            <span style={{ color: "var(--accent)" }}>i</span>Teach
          </span>
        </div>

        <div className="login-title">Welcome back</div>
        <div className="login-sub">Sign in to your account to continue</div>

        <div className="login-switcher">
          <button
            type="button"
            className={`login-switcher-btn ${mode === "phone" ? "active" : ""}`}
            onClick={() => setMode("phone")}
          >
            <PhoneIcon />
            Phone
          </button>

          <button
            type="button"
            className={`login-switcher-btn ${mode === "email" ? "active" : ""}`}
            onClick={() => setMode("email")}
          >
            <MailIcon />
            Email
          </button>
        </div>

        {mode === "phone" ? (
          <div className="fg">
            <label>Phone Number</label>
            <div className="input-group">
              <div className="input-group-prefix">
                <PhoneIcon />
                +998
              </div>
              <input
                type="tel"
                placeholder="(90) 000-0000"
                value={formattedPhone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                  setPhone(digits);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="fg">
            <label>Email Address</label>
            <div className="input-group">
              <div className="input-group-prefix">
                <MailIcon />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="fg password-field">
          <label>Password</label>
          <input
            type={show ? "text" : "password"}
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            style={{ paddingRight: 40 }}
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShow((v) => !v)}
            title="Show / hide password"
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <button
          className="login-btn"
          disabled={!can || loading}
          onClick={handleLogin}
        >
          <ShieldIcon />
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>

      <style>{`
        :root {
          --bg: #090c0f;
          --surface: #0f1318;
          --surface2: #161c22;
          --border: #1e2730;
          --accent: #1aab6d;
          --accent2: #1473d4;
          --grad-start: #3ce649;
          --grad-end: #1473d4;
          --text: #e6edf4;
          --muted: #5d7080;
          --font-logo: 'Clash Display', 'Inter', sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .login-screen {
          position: fixed;
          inset: 0;
          z-index: 999;
          background:
            radial-gradient(circle at top right, rgba(26,171,109,0.06), transparent 22%),
            var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .login-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 40px 36px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
          position: relative;
          overflow: hidden;
        }

        .login-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(44, 192, 127, 0.12) 0%,
            rgba(20, 115, 212, 0.06) 35%,
            transparent 65%
          );
          top: -80px;
          right: -80px;
          pointer-events: none;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-logo);
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 32px;
          position: relative;
          z-index: 1;
          color: var(--text);
          letter-spacing: -0.4px;
        }

        .lm {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(145deg, var(--grad-start), var(--grad-end));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(20, 115, 212, 0.18);
          flex-shrink: 0;
        }

        .login-title {
          font-size: 20px;
          font-weight: 700;
          font-family: Inter, sans-serif;
          margin-bottom: 5px;
          color: var(--text);
          position: relative;
          z-index: 1;
        }

        .login-sub {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 28px;
          line-height: 1.5;
          position: relative;
          z-index: 1;
        }

        .login-switcher {
          display: flex;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 9px;
          padding: 3px;
          margin-bottom: 22px;
          gap: 2px;
          position: relative;
          z-index: 1;
        }

        .login-switcher-btn {
          flex: 1;
          padding: 7px 10px;
          border-radius: 7px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          transition: all 0.14s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .login-switcher-btn svg {
          width: 13px;
          height: 13px;
          flex-shrink: 0;
        }

        .login-switcher-btn.active {
          background: var(--surface);
          color: var(--text);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        }

        .fg {
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        label {
          font-size: 11px;
          color: var(--muted);
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="tel"] {
          width: 100%;
          background: var(--surface2);
          border: 1.5px solid var(--border);
          border-radius: 9px;
          padding: 10px 13px;
          color: var(--text);
          font-size: 13px;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          outline: none;
        }

        input::placeholder {
          color: var(--muted);
          opacity: 0.6;
        }

        input:hover {
          border-color: #2d3a50;
          background: #131922;
        }

        input:focus {
          border-color: var(--accent);
          background: #131922;
          box-shadow: 0 0 0 3px rgba(26, 171, 109, 0.14);
        }

        .input-group {
          display: flex;
        }

        .input-group-prefix {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 13px;
          background: var(--surface2);
          border: 1.5px solid var(--border);
          border-right: none;
          border-radius: 9px 0 0 9px;
          font-size: 13px;
          color: var(--muted);
          white-space: nowrap;
          flex-shrink: 0;
          transition: border-color 0.15s;
        }

        .input-group-prefix svg {
          width: 13px;
          height: 13px;
        }

        .input-group input {
          border-radius: 0 9px 9px 0 !important;
        }

        .input-group:focus-within .input-group-prefix {
          border-color: var(--accent);
        }

        .password-field {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 10px;
          bottom: 9px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          border-radius: 9px;
          background: linear-gradient(135deg, #1aab6d, #1473d4);
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          font-family: Inter, sans-serif;
          letter-spacing: 0.2px;
          transition: opacity 0.15s, transform 0.1s;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.12.91.35 1.79.68 2.63a2 2 0 0 1-.45 2.11L9.1 10.9a16 16 0 0 0 4 4l1.44-1.19a2 2 0 0 1 2.11-.45c.84.33 1.72.56 2.63.68A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m22 8-8.97 5.7a2 2 0 0 1-2.06 0L2 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.58 10.58A2 2 0 0 0 13.42 13.42"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.88 5.09A10.94 10.94 0 0 1 12 4.91c5 0 9.27 3.11 11 7.5a11.83 11.83 0 0 1-4.09 5.09"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.61 6.61A11.84 11.84 0 0 0 1 12.41c1.14 2.91 3.37 5.19 6.15 6.37A10.78 10.78 0 0 0 12 19.91c.88 0 1.73-.1 2.55-.29"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}