import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { routeMeta } from "../data/routes";
import { useUi } from "../state/ui";
import Button from "../components/ui/Button";

export default function Topbar() {
  const loc = useLocation();
  const nav = useNavigate();
  const { openModal } = useUi();

  const meta = useMemo(() => routeMeta[loc.pathname], [loc.pathname]);

  const action = useMemo(() => {
    if (loc.pathname === "/admin/teachers") {
      return (
        <Button variant="primary" size="sm" onClick={() => openModal("add-teacher")}>
          <svg>
            <use href="#i-plus" />
          </svg>
          Add Teacher
        </Button>
      );
    }

    if (loc.pathname === "/admin/courses") {
      return (
        <Button variant="primary" size="sm">
          <svg>
            <use href="#i-plus" />
          </svg>
          New Course
        </Button>
      );
    }

    if (loc.pathname === "/teacher/groups") {
      return (
        <Button variant="primary" size="sm" onClick={() => openModal("create-group")}>
          <svg>
            <use href="#i-plus" />
          </svg>
          New Group
        </Button>
      );
    }

    if (loc.pathname === "/teacher/live") {
      return (
        <Button variant="primary" size="sm" onClick={() => openModal("new-session")}>
          <svg>
            <use href="#i-plus" />
          </svg>
          Schedule Session
        </Button>
      );
    }

    return null;
  }, [loc.pathname, openModal]);

  return (
    <div className="topbar">
      <div id="topbar-title">
        <h2 id="ptitle">{meta?.title ?? "Dashboard"}</h2>
      </div>

      <div style={{ flex: 1 }} />

      {/* <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => nav("/")}>
          Home
        </span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-cur">{meta?.crumb ?? "Dashboard"}</span>
      </div> */}

      <div id="topbar-actions" style={{ marginLeft: 12 }}>
        {/* {action} */}
      </div>
    </div>
  );
}