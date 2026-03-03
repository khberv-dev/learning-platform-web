
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Progress from "../../components/ui/Progress";
import { teacherStats } from "../../data/mock";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const nav = useNavigate();

  return (
    <div className="page active">
      <div className="content">
        <div className="stats-row">
          {teacherStats.map((s) => (
            <div key={s.label} className={`stat-card sc-${s.tone}`}>
              <div className="stat-icon"><svg><use href={s.icon} /></svg></div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value sv-${s.tone}`}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 7, color: "var(--text)" }}>
              <svg width="14" height="14" style={{ color: "var(--muted)" }}><use href="#i-radio" /></svg>
              Today's Live Sessions
            </div>

            <div className="lsc">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="live-badge"><span className="ldot" />LIVE IN 20 MIN</span>
                <span className="tm">Today, 2:00 PM</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Algebra II — Lesson 5 Review</div>
                <div className="tm">Group A · 22 students expected</div>
              </div>
              <Button variant="primary" onClick={() => nav("/teacher/live")}><svg><use href="#i-video" /></svg>Start Session</Button>
            </div>

            <div className="lsc" style={{ opacity: 0.75 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="sched-badge"><svg><use href="#i-cal" /></svg>SCHEDULED</span>
                <span className="tm">Today, 4:30 PM</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Quadratic Functions Deep Dive</div>
                <div className="tm">Group B · 18 students</div>
              </div>
              <Button variant="ghost" size="sm"><svg><use href="#i-pen" /></svg>Edit</Button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title"><svg><use href="#i-hat" /></svg>Top Students</span>
              <Button variant="ghost" size="sm" onClick={() => nav("/teacher/students")}>View All</Button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table>
                <thead><tr><th>Student</th><th>Progress</th><th>Last Active</th></tr></thead>
                <tbody>
                  <tr><td><div className="uc"><Avatar tone="blue" text="AT" />Alex Turner</div></td><td><Progress value={90} width={70} /></td><td className="tm">Today</td></tr>
                  <tr><td><div className="uc"><Avatar tone="green" text="MR" />Mia Rodriguez</div></td><td><Progress value={78} width={70} /></td><td className="tm">Yesterday</td></tr>
                  <tr><td><div className="uc"><Avatar tone="purple" text="CL" />Chris Lee</div></td><td><Progress value={55} width={70} /></td><td className="tm">3 days</td></tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}