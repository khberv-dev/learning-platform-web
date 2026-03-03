
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import { useUi } from "../../state/ui";
import { useNavigate } from "react-router-dom";

export default function TeacherGroups() {
  const { openModal } = useUi();
  const nav = useNavigate();

  return (
    <div className="page active">
      <div className="content">
        <div style={{ marginBottom: 12 }}>
          <Button variant="primary" onClick={() => openModal("create-group")}>
            <svg><use href="#i-people" /></svg>Create Group
          </Button>
        </div>

        <div className="grid-2">
          <div className="gc">
            <div className="gc-hdr">
              <div>
                <div className="gc-title">Group A — Advanced</div>
                <div className="tm" style={{ marginTop: 3 }}>22 students · Algebra II</div>
              </div>
              <div className="fl g2">
                <Button variant="ghost" size="sm"><svg><use href="#i-pen" /></svg>Edit</Button>
                <Button variant="primary" size="sm" onClick={() => nav("/teacher/live")}><svg><use href="#i-radio" /></svg>Session</Button>
              </div>
            </div>

            <div className="avstack">
              <Avatar tone="blue" text="AT" />
              <Avatar tone="green" text="MR" />
              <Avatar tone="purple" text="JD" />
              <Avatar tone="yellow" text="PW" />
              <div className="avatar av-overflow">+18</div>
            </div>

            <div className="divider" />

            <div className="smini-row">
              <div className="smini"><div className="smini-val" style={{ color: "var(--green)" }}>84%</div><div className="smini-lbl">Avg. Progress</div></div>
              <div className="smini"><div className="smini-val" style={{ color: "var(--accent)" }}>88</div><div className="smini-lbl">Avg. Score</div></div>
              <div className="smini"><div className="smini-val" style={{ color: "var(--accent2)" }}>5</div><div className="smini-lbl">Sessions</div></div>
            </div>
          </div>

          <div className="gc">
            <div className="gc-hdr">
              <div>
                <div className="gc-title">Group B — Foundations</div>
                <div className="tm" style={{ marginTop: 3 }}>18 students · Algebra II</div>
              </div>
              <div className="fl g2">
                <Button variant="ghost" size="sm"><svg><use href="#i-pen" /></svg>Edit</Button>
                <Button variant="primary" size="sm"><svg><use href="#i-radio" /></svg>Session</Button>
              </div>
            </div>

            <div className="avstack">
              <Avatar tone="purple" text="CL" />
              <Avatar tone="red" text="SK" />
              <Avatar tone="yellow" text="NB" />
              <div className="avatar av-overflow">+15</div>
            </div>

            <div className="divider" />

            <div className="smini-row">
              <div className="smini"><div className="smini-val" style={{ color: "var(--yellow)" }}>62%</div><div className="smini-lbl">Avg. Progress</div></div>
              <div className="smini"><div className="smini-val" style={{ color: "var(--yellow)" }}>74</div><div className="smini-lbl">Avg. Score</div></div>
              <div className="smini"><div className="smini-val" style={{ color: "var(--accent2)" }}>3</div><div className="smini-lbl">Sessions</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}