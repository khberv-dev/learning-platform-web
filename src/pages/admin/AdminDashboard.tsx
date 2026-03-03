
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Tag from "../../components/ui/Tag";
import Progress from "../../components/ui/Progress";
import { adminStats, popularCourses, recentTeachers } from "../../data/mock";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const nav = useNavigate();

  return (
    <div className="page active">
      <div className="content">
        <div className="stats-row">
          {adminStats.map((s) => (
            <div key={s.label} className={`stat-card sc-${s.tone}`}>
              <div className="stat-icon"><svg><use href={s.icon} /></svg></div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value sv-${s.tone}`}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title"><svg><use href="#i-users" /></svg>Recent Teachers</span>
              <Button variant="primary" size="sm" onClick={() => nav("/admin/teachers")}>
                <svg><use href="#i-users" /></svg>View All
              </Button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr><th>Name</th><th>Courses</th><th>Students</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recentTeachers.map((t) => (
                    <tr key={t.name}>
                      <td>
                        <div className="uc">
                          <Avatar tone={t.tone as any} text={t.initials} />
                          {t.name}
                        </div>
                      </td>
                      <td>{t.courses}</td>
                      <td>{t.students}</td>
                      <td>
                        {t.status === "Active" ? <Tag kind="active">Active</Tag> : <Tag kind="pending">Pending</Tag>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title"><svg><use href="#i-chart" /></svg>Popular Courses</span>
              <Button variant="ghost" size="sm">See all</Button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr><th>Course</th><th>Enrolled</th><th>Completion</th></tr>
                </thead>
                <tbody>
                  {popularCourses.map((c) => (
                    <tr key={c.name}>
                      <td>{c.name}</td>
                      <td>{c.enrolled}</td>
                      <td><Progress value={c.completion} width={80} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}