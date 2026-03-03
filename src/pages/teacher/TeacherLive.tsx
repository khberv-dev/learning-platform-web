
import Button from "../../components/ui/Button";

export default function TeacherLive() {
  return (
    <div className="page active">
      <div className="content">
        <div className="grid-2">
          <div className="lsc">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="live-badge"><span className="ldot" />LIVE IN 20 MIN</span>
              <span className="tm">Today, 2:00 PM</span>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Algebra II — Lesson 5 Review</div>
              <div className="tm">Group A · 22 students expected</div>
            </div>

            <div className="meet-box">
              <div className="meet-lbl">Google Meet Link</div>
              <div className="meet-row">
                <svg><use href="#i-link" /></svg>
                <span className="mono">meet.google.com/abc-defg-hij</span>
                <Button variant="ghost" size="sm" style={{ marginLeft: "auto" }}><svg><use href="#i-copy" /></svg>Copy</Button>
              </div>
            </div>

            <div className="fl g2">
              <Button variant="primary" style={{ flex: 1 }}><svg><use href="#i-video" /></svg>Start Session</Button>
              <Button variant="ghost" size="sm"><svg><use href="#i-pen" /></svg></Button>
              <Button variant="ghost" size="sm"><svg><use href="#i-trash" /></svg></Button>
            </div>
          </div>

          <div className="lsc" style={{ opacity: 0.8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="sched-badge"><svg><use href="#i-cal" /></svg>SCHEDULED</span>
              <span className="tm">Today, 4:30 PM</span>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Quadratic Functions Deep Dive</div>
              <div className="tm">Group B · 18 students</div>
            </div>

            <div className="meet-box">
              <div className="meet-lbl">Google Meet Link</div>
              <div className="meet-row">
                <svg><use href="#i-link" /></svg>
                <span className="mono">meet.google.com/xyz-uvwx-yz1</span>
                <Button variant="ghost" size="sm" style={{ marginLeft: "auto" }}><svg><use href="#i-copy" /></svg>Copy</Button>
              </div>
            </div>

            <div className="fl g2">
              <Button variant="ghost" size="sm"><svg><use href="#i-pen" /></svg>Edit</Button>
              <Button variant="ghost" size="sm"><svg><use href="#i-trash" /></svg></Button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <svg width="15" height="15" style={{ color: "var(--muted)" }}><use href="#i-list" /></svg>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Session Archive</span>
            <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 2 }}>Past and cancelled sessions</span>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr><th>Session</th><th>Course</th><th>Start</th><th>End</th><th>Students</th><th>Status</th></tr>
                </thead>
                <tbody>
                  <tr><td style={{ fontWeight: 500 }}>Algebra II — Midterm Q&A</td><td className="tm">Algebra II</td><td className="tm">Feb 20, 2026 · 2:00 PM</td><td className="tm">Feb 20, 2026 · 3:14 PM</td><td>19</td><td><span className="tag" style={{ background: "rgba(34,211,160,0.10)", color: "var(--green)" }}>Finished</span></td></tr>
                  <tr><td style={{ fontWeight: 500 }}>Polynomial Expressions Recap</td><td className="tm">Algebra II</td><td className="tm">Feb 17, 2026 · 3:00 PM</td><td className="tm">Feb 17, 2026 · 4:02 PM</td><td>22</td><td><span className="tag" style={{ background: "rgba(34,211,160,0.10)", color: "var(--green)" }}>Finished</span></td></tr>
                  <tr><td style={{ fontWeight: 500 }}>Group B Office Hours</td><td className="tm">Algebra II</td><td className="tm">Feb 15, 2026 · 5:00 PM</td><td className="tm">—</td><td>0</td><td><span className="tag" style={{ background: "rgba(248,113,113,0.10)", color: "var(--red)" }}>Cancelled</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}