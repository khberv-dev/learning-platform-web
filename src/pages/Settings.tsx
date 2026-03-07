import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import { useUi } from "../state/ui";
import { useAuth } from "../state/auth";
import { getMe, updateMe } from "../shared/api/user.api";

export default function Settings() {
  const { theme, toggleTheme } = useUi();

  const authUser = useAuth((s) => s.user);
  const role = useAuth((s) => s.role);
  const updateUserLocal = useAuth((s) => s.updateUserLocal);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleLabel = useMemo(() => {
    if (role === "teacher") return "Teacher";
    if (role === "admin") return "Administrator";
    return "User";
  }, [role]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const me = await getMe();

        if (!mounted) return;

        setFirstName(me.firstName ?? "");
        setLastName(me.lastName ?? "");
        setPhoneNumber(me.phoneNumber ?? "");
        setEmail(me.email ?? "");

        updateUserLocal(me);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [updateUserLocal]);

  useEffect(() => {
    if (!authUser) return;

    setFirstName(authUser.firstName ?? "");
    setLastName(authUser.lastName ?? "");
    setPhoneNumber(authUser.phoneNumber ?? "");
    setEmail(authUser.email ?? "");
  }, [authUser]);

  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
  
    if (!digits) return "";
  
    if (digits.startsWith("998")) {
      return digits.slice(0, 12);
    }
  
    return `998${digits}`.slice(0, 12);
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");
  
      const normalizedPhone = normalizePhone(phoneNumber);
  
      const updated = await updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: normalizedPhone,
        email: email.trim(),
      });
  
      updateUserLocal(updated);
      setPhoneNumber(updated.phoneNumber ?? "");
      setMessage("Profile updated successfully");
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      setError(
        Array.isArray(apiMessage)
          ? apiMessage[0]
          : apiMessage || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="content" style={{ maxWidth: 680 }}>
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-header">
            <span className="card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M23 21v-2a4 4 0 0 0-3-3.87"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 3.13a4 4 0 0 1 0 7.75"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Profile Information
            </span>
          </div>

          <div className="card-body">
            {loading ? (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Loading profile...</div>
            ) : (
              <>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div className="fg">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  <div className="fg">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="fg">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+998901234567"
                  />
                </div>

                <div className="fg">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="fg">
                  <label>Role</label>
                  <input
                    type="text"
                    value={roleLabel}
                    readOnly
                    style={{ color: "var(--muted)" }}
                  />
                </div>

                {message ? (
                  <div
                    style={{
                      marginBottom: 12,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "rgba(45,192,127,0.12)",
                      border: "1px solid rgba(45,192,127,0.22)",
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
                      border: "1px solid rgba(240,96,96,0.22)",
                      color: "var(--red)",
                      fontSize: 12,
                    }}
                  >
                    {error}
                  </div>
                ) : null}

                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="17 21 17 13 7 13 7 21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="7 3 7 8 15 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Appearance
            </span>
          </div>

          <div className="card-body">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 0",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
                  Theme
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {theme === "dark" ? "Dark mode" : "Light mode"}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>☀️</span>
                <div
                  onClick={toggleTheme}
                  style={{
                    width: 40,
                    height: 22,
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      background: "var(--accent)",
                      borderRadius: "50%",
                      position: "absolute",
                      top: 1,
                      right: theme === "dark" ? 1 : "calc(100% - 19px)",
                      transition: "right 0.2s",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>🌙</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}