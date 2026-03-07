import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Tag from "../../components/ui/Tag";
import { teacherTable } from "../../data/mock";
import { useUi } from "../../state/ui";

export default function AdminTeachers() {
  const { openModal } = useUi();

  return (
    <div className="page active">
      <div className="content">
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Email</th>
                  <th>Courses</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {teacherTable.map((t) => (
                  <tr key={t.email}>
                    <td>
                      <div className="uc">
                        <Avatar tone={t.tone as any} text={t.initials} />
                        <div>
                          <div>{t.name}</div>
                          <div className="tm">{t.dept}</div>
                        </div>
                      </div>
                    </td>

                    <td className="tm">{t.email}</td>
                    <td>{t.courses}</td>
                    <td>{t.students}</td>

                    <td>
                      {t.status === "Active" && <Tag kind="active">Active</Tag>}
                      {t.status === "Pending" && <Tag kind="pending">Pending</Tag>}
                      {t.status === "Inactive" && <Tag kind="inactive">Inactive</Tag>}
                    </td>

                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openModal("edit-teacher")}
                      >
                        <svg>
                          <use href="#i-pen" />
                        </svg>
                        Edit
                      </Button>
                    </td>
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