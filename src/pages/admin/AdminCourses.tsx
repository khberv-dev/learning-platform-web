
import Tag from "../../components/ui/Tag";
import { useNavigate } from "react-router-dom";

export default function AdminCourses() {
  const nav = useNavigate();

  return (
    <div className="page active">
      <div className="content">
        <div className="grid-3">

          <div className="course-card" onClick={() => nav("/admin/builder")}>
            <div className="course-thumb ct-1"><svg><use href="#i-book" /></svg></div>
            <div className="ci">
              <div className="ci-title">Algebra II — Advanced Concepts</div>
              <div className="ci-desc">Covers polynomials, functions, and complex numbers for advanced learners.</div>
              <div className="ci-meta"><span>12 lessons</span><span>3 quizzes</span></div>
              <Tag kind="blue">Published</Tag>
            </div>
          </div>

          <div className="course-card">
            <div className="course-thumb ct-2"><svg><use href="#i-puzzle" /></svg></div>
            <div className="ci">
              <div className="ci-title">Chemistry Basics</div>
              <div className="ci-desc">Fundamental concepts in atoms, molecules, reactions, and the periodic table.</div>
              <div className="ci-meta"><span>8 lessons</span><span>2 quizzes</span></div>
              <Tag kind="blue">Published</Tag>
            </div>
          </div>

          <div className="course-card">
            <div className="course-thumb ct-3"><svg><use href="#i-list" /></svg></div>
            <div className="ci">
              <div className="ci-title">Python Introduction</div>
              <div className="ci-desc">Beginner-friendly intro to programming using Python — variables, loops, and functions.</div>
              <div className="ci-meta"><span>15 lessons</span><span>5 quizzes</span></div>
              <Tag kind="draft">Draft</Tag>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}