import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useUi } from "../state/ui";
import { adminNav, teacherNav } from "../data/routes";

export default function Sidebar() {
  const { role } = useUi();

  const navItems = useMemo(() => (role === "admin" ? adminNav : teacherNav), [role]);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark"><svg><use href="#i-hat" /></svg></div>
        <span><span style={{ color: "var(--accent)", fontStyle: "italic" }}>i</span>Teach</span>
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
                <svg><use href={it.icon} /></svg>
                {it.label}
                {it.badge ? <span className={`badge ${it.badgeTone ?? ""}`}>{it.badge}</span> : null}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="avatar av-blue">AD</div>
        <div>
          <div className="sidebar-user-name">Alex Daniels</div>
          <div className="sidebar-user-role">{role === "admin" ? "Administrator" : "Teacher"}</div>
        </div>
      </div>
    </div>
  );
}