import { useMemo, useState } from "react";
import { useAuth } from "../../state/auth";

export default function LoginPage() {
  const login = useAuth((s) => s.login);

  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);

  const can = useMemo(() => phone.trim().length >= 6 && pass.trim().length >= 3, [phone, pass]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* glow */}
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(44,192,127,0.12) 0%, transparent 65%)",
            top: -80,
            right: -80,
            pointerEvents: "none",
          }}
        />

        <div style={{ fontFamily: "var(--font-logo)", fontSize: 22, fontWeight: 700, marginBottom: 24, display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "linear-gradient(145deg, var(--grad-start), var(--grad-end))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <svg width="16" height="16">
              <use href="#i-shield" />
            </svg>
          </div>
          iTeach LMS
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Inter, sans-serif", marginBottom: 5 }}>Welcome back</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 28, lineHeight: 1.5 }}>
          Sign in to your account to continue
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Phone Number
          </label>

          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 13px",
                background: "var(--surface2)",
                border: "1.5px solid var(--border)",
                borderRight: "none",
                borderRadius: "9px 0 0 9px",
                fontSize: 13,
                color: "var(--muted)",
                whiteSpace: "nowrap",
              }}
            >
              <svg width="13" height="13">
                <use href="#i-phone" />
              </svg>
              +1
            </div>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 000-0000"
              style={{
                width: "100%",
                background: "var(--surface2)",
                border: "1.5px solid var(--border)",
                borderRadius: "0 9px 9px 0",
                padding: "10px 13px",
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 12, position: "relative" }}>
          <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Password
          </label>

          <input
            type={show ? "text" : "password"}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
            style={{
              width: "100%",
              background: "var(--surface2)",
              border: "1.5px solid var(--border)",
              borderRadius: 9,
              padding: "10px 40px 10px 13px",
              color: "var(--text)",
              fontSize: 13,
              outline: "none",
            }}
          />

          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            title="Show/hide password"
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
          >
            <svg width="16" height="16">
              <use href={show ? "#i-eye-off" : "#i-eye"} />
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8, marginBottom: 16 }}>
          <a style={{ fontSize: 12, color: "var(--accent)", cursor: "pointer" }}>Forgot password?</a>
        </div>

        <button
          disabled={!can}
          onClick={() => login(phone, pass)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 9,
            background: "linear-gradient(135deg, #1aab6d, #1473d4)",
            color: "#fff",
            border: "none",
            cursor: can ? "pointer" : "not-allowed",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            letterSpacing: 0.2,
            opacity: can ? 1 : 0.55,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width="15" height="15">
            <use href="#i-shield" />
          </svg>
          Sign In
        </button>

        <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 22 }}>
          Don't have an account? <a style={{ color: "var(--accent)", cursor: "pointer" }}>Contact your administrator</a>
        </div>
      </div>
    </div>
  );
}