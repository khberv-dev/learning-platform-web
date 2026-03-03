
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Tag from "../../components/ui/Tag";
import Progress from "../../components/ui/Progress";
import { useNavigate } from "react-router-dom";

export default function TeacherStudents() {
  const nav = useNavigate();

  return (
    <div className="page active">
      <div className="content">
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>Student</th><th>Group</th><th>Progress</th><th>Quiz Avg</th><th>Last Active</th><th></th></tr></thead>
              <tbody>
                <tr>
                  <td><div className="uc"><Avatar tone="blue" text="AT" /><div><div>Alex Turner</div><div className="tm">alex.turner@edu.com</div></div></div></td>
                  <td><Tag kind="blue">Group A</Tag></td>
                  <td><Progress value={90} width={80} /></td>
                  <td><span className="tg">92</span></td>
                  <td className="tm">Today</td>
                  <td><Button variant="ghost" size="sm" onClick={() => nav("/teacher/chat")}><svg><use href="#i-msg" /></svg>Chat</Button></td>
                </tr>

                <tr>
                  <td><div className="uc"><Avatar tone="green" text="MR" /><div><div>Mia Rodriguez</div><div className="tm">mia.rodriguez@edu.com</div></div></div></td>
                  <td><Tag kind="blue">Group A</Tag></td>
                  <td><Progress value={78} width={80} /></td>
                  <td><span className="tg">85</span></td>
                  <td className="tm">Yesterday</td>
                  <td><Button variant="ghost" size="sm" onClick={() => nav("/teacher/chat")}><svg><use href="#i-msg" /></svg>Chat</Button></td>
                </tr>

                <tr>
                  <td><div className="uc"><Avatar tone="purple" text="CL" /><div><div>Chris Lee</div><div className="tm">chris.lee@edu.com</div></div></div></td>
                  <td><Tag kind="purple">Group B</Tag></td>
                  <td><Progress value={55} width={80} /></td>
                  <td><span className="ty">71</span></td>
                  <td className="tm">3 days ago</td>
                  <td><Button variant="ghost" size="sm" onClick={() => nav("/teacher/chat")}><svg><use href="#i-msg" /></svg>Chat</Button></td>
                </tr>

                <tr>
                  <td><div className="uc"><Avatar tone="red" text="SK" /><div><div>Sam Kumar</div><div className="tm">sam.kumar@edu.com</div></div></div></td>
                  <td><Tag kind="purple">Group B</Tag></td>
                  <td><Progress value={30} width={80} color="red" /></td>
                  <td><span className="tr">48</span></td>
                  <td className="tm">1 week ago</td>
                  <td><Button variant="ghost" size="sm" onClick={() => nav("/teacher/chat")}><svg><use href="#i-msg" /></svg>Chat</Button></td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}