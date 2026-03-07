import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Tag from "../../components/ui/Tag";
import {
  createTeacher,
  getAllTeachers,
  updateTeacher,
  type TeacherDto,
} from "../../shared/api/teacher.api";

type TeacherForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

const emptyForm: TeacherForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
};

function normalizePhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("998")) return digits.slice(0, 12);
  return `998${digits}`.slice(0, 12);
}

function formatPhoneForView(value?: string | null) {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 12 || !digits.startsWith("998")) return value;

  const local = digits.slice(3);
  const a = local.slice(0, 2);
  const b = local.slice(2, 5);
  const c = local.slice(5, 7);
  const d = local.slice(7, 9);

  return `+998 (${a}) ${b}-${c}-${d}`;
}

function getInitials(t: TeacherDto) {
  const a = t.firstName?.[0] ?? "T";
  const b = t.lastName?.[0] ?? "";
  return `${a}${b}`.toUpperCase();
}

function getFullName(t: TeacherDto) {
  return [t.firstName, t.lastName].filter(Boolean).join(" ") || "Unnamed Teacher";
}

function getTone(index: number): "blue" | "purple" | "green" | "red" | "yellow" {
  const tones = ["purple", "green", "blue", "red", "yellow"] as const;
  return tones[index % tones.length];
}

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [editingTeacher, setEditingTeacher] = useState<TeacherDto | null>(null);

  const [saving, setSaving] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canCreate = useMemo(() => {
    return (
      form.firstName.trim().length > 0 &&
      form.lastName.trim().length > 0 &&
      /\S+@\S+\.\S+/.test(form.email.trim()) &&
      normalizePhoneNumber(form.phoneNumber).length === 12 &&
      form.password.trim().length >= 8
    );
  }, [form]);

  const canUpdate = useMemo(() => {
    return (
      form.firstName.trim().length > 0 &&
      form.lastName.trim().length > 0 &&
      /\S+@\S+\.\S+/.test(form.email.trim()) &&
      normalizePhoneNumber(form.phoneNumber).length === 12
    );
  }, [form]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllTeachers();
      setTeachers(data);
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      setError(Array.isArray(apiMessage) ? apiMessage[0] : apiMessage || "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const openAdd = () => {
    setMessage("");
    setError("");
    setForm(emptyForm);
    setShowAddPassword(false);
    setIsAddOpen(true);
  };

  const openEdit = (teacher: TeacherDto) => {
    setMessage("");
    setError("");
    setEditingTeacher(teacher);
    setForm({
      firstName: teacher.firstName ?? "",
      lastName: teacher.lastName ?? "",
      email: teacher.email ?? "",
      phoneNumber: teacher.phoneNumber ?? "",
      password: "",
    });
    setIsEditOpen(true);
  };

  const closeModals = () => {
    if (saving) return;
    setIsAddOpen(false);
    setIsEditOpen(false);
    setEditingTeacher(null);
    setForm(emptyForm);
  };

  const handleCreate = async () => {
    if (!canCreate) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await createTeacher({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: normalizePhoneNumber(form.phoneNumber),
        password: form.password.trim(),
      });

      setMessage("Teacher created successfully");
      setIsAddOpen(false);
      setForm(emptyForm);
      await loadTeachers();
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      setError(Array.isArray(apiMessage) ? apiMessage[0] : apiMessage || "Failed to create teacher");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingTeacher?.id || !canUpdate) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated = await updateTeacher(editingTeacher.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: normalizePhoneNumber(form.phoneNumber),
      });

      setTeachers((prev) =>
        prev.map((item) => (item.id === editingTeacher.id ? { ...item, ...updated } : item))
      );

      setMessage("Teacher updated successfully");
      setIsEditOpen(false);
      setEditingTeacher(null);
      setForm(emptyForm);
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      setError(Array.isArray(apiMessage) ? apiMessage[0] : apiMessage || "Failed to update teacher");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="content">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <Button variant="primary" onClick={openAdd}>
            <svg>
              <use href="#i-plus" />
            </svg>
            Add Teacher
          </Button>
        </div>

        {message ? (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(45,192,127,0.12)",
              border: "1px solid rgba(45,192,127,0.24)",
              color: "var(--green)",
              fontSize: 12,
            }}
          >
            {message}
          </div>
        ) : null}

        {error ? (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(240,96,96,0.12)",
              border: "1px solid rgba(240,96,96,0.24)",
              color: "var(--red)",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        ) : null}

        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 18, color: "var(--muted)" }}>
                      Loading teachers...
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 18, color: "var(--muted)" }}>
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  teachers.map((t, index) => (
                    <tr key={t.id}>
                      <td>
                        <div className="uc">
                          <Avatar tone={getTone(index)} text={getInitials(t)} />
                          <div>
                            <div>{getFullName(t)}</div>
                            <div className="tm">Teacher</div>
                          </div>
                        </div>
                      </td>

                      <td className="tm">{t.email || "—"}</td>
                      <td>{formatPhoneForView(t.phoneNumber)}</td>

                      <td>
                        {t.isActive !== false ? (
                          <Tag kind="active">Active</Tag>
                        ) : (
                          <Tag kind="inactive">Inactive</Tag>
                        )}
                      </td>

                      <td>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                          <svg>
                            <use href="#i-pen" />
                          </svg>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(isAddOpen || isEditOpen) && (
          <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && closeModals()}>
            <div className="modal-box">
              <div className="modal-header">
                <div className="modal-title">
                  <svg>
                    <use href={isAddOpen ? "#i-plus" : "#i-pen"} />
                  </svg>
                  {isAddOpen ? "Add New Teacher" : "Edit Teacher"}
                </div>

                <button className="modal-close" onClick={closeModals}>
                  ×
                </button>
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div className="fg">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>

                <div className="fg">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="fg">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="fg">
                <label>Phone Number</label>
                <div className="input-group">
                  <div className="input-group-prefix">+998</div>
                  <input
                    type="tel"
                    placeholder="90 000 00 00"
                    value={
                      form.phoneNumber.startsWith("998")
                        ? form.phoneNumber.slice(3)
                        : form.phoneNumber
                    }
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                      setForm((p) => ({ ...p, phoneNumber: `998${digits}` }));
                    }}
                  />
                </div>
              </div>

              {isAddOpen && (
                <div className="fg">
                  <label>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showAddPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Set password"
                      style={{ paddingRight: 38 }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowAddPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted)",
                        padding: 0,
                        display: "flex",
                      }}
                    >
                      {showAddPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              )}

              <div className="fl g2" style={{ marginTop: 8 }}>
                <Button
                  variant="primary"
                  onClick={isAddOpen ? handleCreate : handleUpdate}
                  disabled={saving || (isAddOpen ? !canCreate : !canUpdate)}
                >
                  {saving ? "Saving..." : isAddOpen ? "Create Teacher" : "Save Changes"}
                </Button>

                <Button variant="ghost" onClick={closeModals} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        :root {
          --bg: #090c0f;
          --surface: #0f1318;
          --surface2: #161c22;
          --border: #1e2730;
          --accent: #1aab6d;
          --accent2: #1473d4;
          --grad-start: #3ce649;
          --grad-end: #1473d4;
          --text: #e6edf4;
          --muted: #5d7080;
          --font-logo: 'Clash Display', 'Inter', sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .login-screen {
          position: fixed;
          inset: 0;
          z-index: 999;
          background:
            radial-gradient(circle at top right, rgba(26,171,109,0.06), transparent 22%),
            var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .login-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 40px 36px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
          position: relative;
          overflow: hidden;
        }

        .login-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(44, 192, 127, 0.12) 0%,
            rgba(20, 115, 212, 0.06) 35%,
            transparent 65%
          );
          top: -80px;
          right: -80px;
          pointer-events: none;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-logo);
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 32px;
          position: relative;
          z-index: 1;
          color: var(--text);
          letter-spacing: -0.4px;
        }

        .lm {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(145deg, var(--grad-start), var(--grad-end));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(20, 115, 212, 0.18);
          flex-shrink: 0;
        }

        .login-title {
          font-size: 20px;
          font-weight: 700;
          font-family: Inter, sans-serif;
          margin-bottom: 5px;
          color: var(--text);
          position: relative;
          z-index: 1;
        }

        .login-sub {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 28px;
          line-height: 1.5;
          position: relative;
          z-index: 1;
        }

        .login-switcher {
          display: flex;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 9px;
          padding: 3px;
          margin-bottom: 22px;
          gap: 2px;
          position: relative;
          z-index: 1;
        }

        .login-switcher-btn {
          flex: 1;
          padding: 7px 10px;
          border-radius: 7px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          transition: all 0.14s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .login-switcher-btn svg {
          width: 13px;
          height: 13px;
          flex-shrink: 0;
        }

        .login-switcher-btn.active {
          background: var(--surface);
          color: var(--text);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        }

        .fg {
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        label {
          font-size: 11px;
          color: var(--muted);
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="tel"] {
          width: 100%;
          background: var(--surface2);
          border: 1.5px solid var(--border);
          border-radius: 9px;
          padding: 10px 13px;
          color: var(--text);
          font-size: 13px;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          outline: none;
        }

        input::placeholder {
          color: var(--muted);
          opacity: 0.6;
        }

        input:hover {
          border-color: #2d3a50;
          background: #131922;
        }

        input:focus {
          border-color: var(--accent);
          background: #131922;
          box-shadow: 0 0 0 3px rgba(26, 171, 109, 0.14);
        }

        .input-group {
          display: flex;
        }

        .input-group-prefix {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 13px;
          background: var(--surface2);
          border: 1.5px solid var(--border);
          border-right: none;
          border-radius: 9px 0 0 9px;
          font-size: 13px;
          color: var(--muted);
          white-space: nowrap;
          flex-shrink: 0;
          transition: border-color 0.15s;
        }

        .input-group-prefix svg {
          width: 13px;
          height: 13px;
        }

        .input-group input {
          border-radius: 0 9px 9px 0 !important;
        }

        .input-group:focus-within .input-group-prefix {
          border-color: var(--accent);
        }

        .password-field {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 10px;
          bottom: 9px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          border-radius: 9px;
          background: linear-gradient(135deg, #1aab6d, #1473d4);
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          font-family: Inter, sans-serif;
          letter-spacing: 0.2px;
          transition: opacity 0.15s, transform 0.1s;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.58 10.58A2 2 0 0 0 13.42 13.42"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.88 5.09A10.94 10.94 0 0 1 12 4.91c5 0 9.27 3.11 11 7.5a11.83 11.83 0 0 1-4.09 5.09"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.61 6.61A11.84 11.84 0 0 0 1 12.41c1.14 2.91 3.37 5.19 6.15 6.37A10.78 10.78 0 0 0 12 19.91c.88 0 1.73-.1 2.55-.29"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}