
import { useNavigate, useLocation } from "react-router-dom";
import { useUi } from "../state/ui";

export default function RoleBar() {
  const { role, setRole } = useUi();
  const nav = useNavigate();
  const loc = useLocation();

  const onSwitch = (next: "admin" | "teacher") => {
    setRole(next);

    // если пользователь уже на teacher/admin страницах — аккуратно перекинуть
    if (next === "admin") {
      if (loc.pathname.startsWith("/teacher")) nav("/admin/dashboard");
      else nav(loc.pathname);
    } else {
      if (loc.pathname.startsWith("/admin")) nav("/teacher/dashboard");
      else nav(loc.pathname);
    }
  };

  return (
    <div className="role-switcher">
      <div className={`role-tab ${role === "admin" ? "active" : ""}`} onClick={() => onSwitch("admin")}>
        <svg><use href="#i-shield" /></svg> Admin Panel
      </div>
      <div className={`role-tab ${role === "teacher" ? "active" : ""}`} onClick={() => onSwitch("teacher")}>
        <svg><use href="#i-users" /></svg> Teacher Panel
      </div>
    </div>
  );
}