import React from "react";
import Button from "../components/ui/Button";
import { useUi } from "../state/ui";

export default function Settings() {
  const { theme, toggleTheme } = useUi();

  return (
    <div className="page active">
      <div className="content" style={{ maxWidth: 680 }}>
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-header"><span className="card-title"><svg><use href="#i-users" /></svg>Profile Information</span></div>
          <div className="card-body">
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="fg"><label>First Name</label><input type="text" defaultValue="Alex" /></div>
              <div className="fg"><label>Last Name</label><input type="text" defaultValue="Daniels" /></div>
            </div>
            <div className="fg"><label>Email Address</label><input type="email" defaultValue="alex.daniels@iteach.edu" /></div>
            <div className="fg"><label>Role</label><input type="text" defaultValue="Administrator" readOnly style={{ color: "var(--muted)" }} /></div>
            <Button variant="primary"><svg><use href="#i-save" /></svg>Save Profile</Button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title"><svg><use href="#i-cog" /></svg>Appearance</span></div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Theme</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{theme === "dark" ? "Dark mode" : "Light mode"}</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>☀️</span>
                <div
                  onClick={toggleTheme}
                  style={{
                    width: 40,
                    height: 22,
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      background: "var(--accent)",
                      borderRadius: "50%",
                      position: "absolute",
                      top: 1,
                      right: theme === "dark" ? 1 : "calc(100% - 19px)",
                      transition: "right 0.2s",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>🌙</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}