import React from "react";
import Avatar from "../../components/ui/Avatar";
import Tag from "../../components/ui/Tag";
import Progress from "../../components/ui/Progress";
import { studentTable } from "../../data/mock";

export default function AdminStudents() {
  return (
    <div className="page active">
      <div className="content">
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr><th>Student</th><th>Enrolled Courses</th><th>Progress</th><th>Last Active</th><th>Status</th></tr>
              </thead>
              <tbody>
                {studentTable.map((s) => (
                  <tr key={s.name}>
                    <td>
                      <div className="uc">
                        <Avatar tone={s.tone as any} text={s.initials} />
                        {s.name}
                      </div>
                    </td>
                    <td>{s.enrolled}</td>
                    <td><Progress value={s.progress} width={90} /></td>
                    <td className="tm">{s.last}</td>
                    <td>{s.status === "Active" ? <Tag kind="active">Active</Tag> : <Tag kind="inactive">Inactive</Tag>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}