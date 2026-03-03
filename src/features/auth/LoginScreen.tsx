import { useMemo, useState } from "react";
import { authStore } from "./auth.store";

type Props = { onDone: () => void };

export function LoginScreen({ onDone }: Props) {
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const can = useMemo(() => phone.trim().length >= 3 && pw.trim().length >= 3, [phone, pw]);

  function doLogin() {
    if (!can) return;
    // пока мок. Потом подключим API.
    authStore.setAuthed(true);
    onDone();
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-glow" />

        <div className="login-title">Welcome back</div>
        <div className="login-sub">Sign in to your account to continue</div>

        <div className="fg">
          <label>Phone Number</label>
          <div className="input-group">
            <div className="input-group-prefix">
              <svg><use href="#i-phone" /></svg>
              +1
            </div>
            <input
              type="tel"
              placeholder="(555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="fg" style={{ position: "relative" }}>
          <label>Password</label>
          <input
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            style={{ paddingRight: 40 }}
          />
          <button
            onClick={() => setShowPw((s) => !s)}
            style={{
              position: "absolute",
              right: 10,
              bottom: 9,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: 2,
            }}
            title="Show/hide password"
            type="button"
          >
            <svg width="16" height="16">
              <use href={showPw ? "#i-eye-off" : "#i-eye"} />
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8, marginBottom: 16 }}>
          <a style={{ fontSize: 12, color: "var(--accent)", cursor: "pointer" }}>
            Forgot password?
          </a>
        </div>

        <button className="login-btn" onClick={doLogin} disabled={!can} style={!can ? { opacity: 0.6, cursor: "not-allowed" } : undefined}>
          <svg width="15" height="15"><use href="#i-shield" /></svg>
          Sign In
        </button>

        <div className="login-footer" style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 22 }}>
          Don't have an account? <a style={{ color: "var(--accent)", cursor: "pointer" }}>Contact your administrator</a>
        </div>
      </div>
    </div>
  );
}