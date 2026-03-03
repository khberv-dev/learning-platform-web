import { useState } from "react";
import Button from "../../components/ui/Button";
import Tag from "../../components/ui/Tag";
import { useUi } from "../../state/ui";

export default function AdminBuilder() {
  const { openModal } = useUi();
  const [active, setActive] = useState(true);

  return (
    <div className="page active">
      <div className="content">
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-header">
            <span className="card-title"><svg><use href="#i-book" /></svg>Course Info</span>
          </div>

          <div className="card-body">
            <div className="fg">
              <label>Course Name</label>
              <input type="text" defaultValue="Algebra II — Advanced Concepts" style={{ fontSize: 15, fontWeight: 600 }} />
            </div>

            <div className="fg">
              <label>Course Description</label>
              <textarea
                defaultValue="Covers polynomials, functions, and complex numbers for advanced learners. Students will build problem-solving skills and prepare for higher-level mathematics."
                style={{ minHeight: 78 }}
              />
            </div>

            <div className="fg" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ margin: 0 }}>Active</label>
              <div
                onClick={() => setActive((v) => !v)}
                style={{
                  width: 36,
                  height: 20,
                  background: active ? "var(--accent)" : "var(--border)",
                  borderRadius: 20,
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    background: "#fff",
                    borderRadius: "50%",
                    position: "absolute",
                    top: 2,
                    right: active ? 2 : "calc(100% - 18px)",
                    transition: "right 0.2s",
                  }}
                />
              </div>
            </div>

            <Button variant="primary">
              <svg><use href="#i-save" /></svg>Save Course
            </Button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title"><svg><use href="#i-list" /></svg>Lessons</span>
            <Button variant="primary" size="sm" onClick={() => openModal("create-lesson")}>
              <svg><use href="#i-plus" /></svg>Add Lesson
            </Button>
          </div>

          <div className="card-body" style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Lesson blocks — оставил как в макете (можно потом вынести в компонент и state) */}

            <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--surface2)" }}>
                <div className="lnum ln-done"><svg><use href="#i-check" /></svg></div>
                <input
                  type="text"
                  defaultValue="Introduction to Algebra II"
                  style={{ flex: 1, background: "transparent", border: "none", fontSize: 13, fontWeight: 600, color: "var(--text)", padding: 0, outline: "none" }}
                />
                <Tag kind="blue">3 quizzes</Tag>
                <Tag kind="active">Published</Tag>
                <Button variant="ghost" size="sm" onClick={() => openModal("edit-lesson")}><svg><use href="#i-pen" /></svg></Button>
                <Button variant="ghost" size="sm"><svg><use href="#i-trash" /></svg></Button>
              </div>
              <div style={{ padding: "10px 14px 12px", display: "flex", flexDirection: "column", gap: 6, background: "var(--card)" }}>
                <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Quiz Questions</div>
                {[
                  "What is the standard form of a quadratic equation?",
                  "Which method cannot be used to solve a quadratic?",
                  "Simplify: (x²+5x+6)/(x+2)",
                ].map((q, idx) => (
                  <div key={q} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(34,211,160,0.15)", color: "var(--green)", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      defaultValue={q}
                      style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", color: "var(--text)", fontSize: 12, fontFamily: "inherit" }}
                    />
                    <Button variant="ghost" size="sm"><svg><use href="#i-trash" /></svg></Button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}