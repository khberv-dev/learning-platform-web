import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { adminNav, teacherNav } from "../data/routes";
import { useAuth } from "../state/auth";

export default function Sidebar() {
  const role = useAuth((s) => s.role);
  const user = useAuth((s) => s.user);

  const navItems = useMemo(() => {
    return role === "teacher" ? teacherNav : adminNav;
  }, [role]);

  const initials = useMemo(() => {
    const first = user?.firstName?.[0] ?? "U";
    const last = user?.lastName?.[0] ?? "";
    return `${first}${last}`.toUpperCase();
  }, [user]);

  const fullName = useMemo(() => {
    return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  }, [user]);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <img
            src="/logotip.png"
            alt="iTeach"
            style={{ width: 28, height: 28, objectFit: "contain" }}
          />
        </div>
        <span>
          <span style={{ color: "var(--accent)", fontStyle: "italic" }}>i</span>Teach
        </span>
      </div>

      <div className="sidebar-body">
        {navItems.map((section) => (
          <div key={section.label}>
            <div className="nav-section">{section.label}</div>

            {section.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <use href={it.icon} />
                </svg>

                {it.label}

                {it.badge ? (
                  <span className={`badge ${it.badgeTone ?? ""}`}>{it.badge}</span>
                ) : null}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className={`avatar ${role === "teacher" ? "av-purple" : "av-blue"}`}>
          {initials}
        </div>

        <div>
          <div className="sidebar-user-name">{fullName}</div>
          <div className="sidebar-user-role">
            {role === "teacher" ? "Teacher" : "Administrator"}
          </div>
        </div>
      </div>
    </div>
  );
}