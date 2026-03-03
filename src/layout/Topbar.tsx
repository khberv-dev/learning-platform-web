import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { routeMeta } from "../data/routes";

export default function Topbar() {
  const loc = useLocation();
  const nav = useNavigate();

  const meta = useMemo(() => routeMeta[loc.pathname], [loc.pathname]);

  return (
    <div className="topbar">
      <div id="topbar-title">
        <h2 id="ptitle">{meta?.title ?? "Dashboard"}</h2>
      </div>

      <div style={{ flex: 1 }} />

      {/* простой breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => nav("/")}>Home</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-cur">{meta?.crumb ?? "Dashboard"}</span>
      </div>

      <div id="topbar-actions" style={{ marginLeft: 12 }} />
    </div>
  );
}