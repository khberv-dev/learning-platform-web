import React from "react";
import ReactDOM from "react-dom";
import Button from "./ui/Button";
import { useUi } from "../state/ui";

function ModalShell({
  title,
  icon,
  children,
  maxWidth = 500,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  const { closeModal } = useUi();

  const onBg = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeModal();
  };

  return (
    <div className="modal-overlay open" onClick={onBg}>
      <div className="modal-box" style={{ maxWidth }}>
        <div className="modal-header">
          <div className="modal-title">
            <svg><use href={icon} /></svg>
            {title}
          </div>
          <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ModalHub() {
  const { modal, closeModal } = useUi();
  const root = document.getElementById("modal-root");
  if (!root || !modal) return null;

  const node =
    modal === "add-teacher" ? (
      <ModalShell title="Add New Teacher" icon="#i-plus">
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="fg"><label>First Name</label><input type="text" defaultValue="Anna" /></div>
          <div className="fg"><label>Last Name</label><input type="text" defaultValue="Roberts" /></div>
        </div>
        <div className="fg"><label>Email Address</label><input type="email" defaultValue="a.roberts@edu.com" /></div>
        <div className="fg"><label>Department / Subject</label><input type="text" defaultValue="Biology" /></div>
        <div className="fg">
          <label>Assign Courses</label>
          <select>
            <option>Select courses...</option>
            <option>Biology 101</option>
            <option>Environmental Science</option>
          </select>
        </div>
        <div className="fl g2" style={{ marginTop: 8 }}>
          <Button variant="primary" onClick={closeModal}>Create Teacher</Button>
          <Button variant="ghost" onClick={closeModal}>Cancel</Button>
        </div>
      </ModalShell>
    ) : modal === "edit-teacher" ? (
      <ModalShell title="Edit Teacher" icon="#i-pen">
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="fg"><label>First Name</label><input type="text" defaultValue="Sara" /></div>
          <div className="fg"><label>Last Name</label><input type="text" defaultValue="Mitchell" /></div>
        </div>
        <div className="fg"><label>Email Address</label><input type="email" defaultValue="s.mitchell@edu.com" /></div>
        <div className="fg"><label>Department / Subject</label><input type="text" defaultValue="Mathematics" /></div>
        <div className="fg">
          <label>Status</label>
          <select defaultValue="Active">
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending</option>
          </select>
        </div>
        <div className="fl g2" style={{ marginTop: 8 }}>
          <Button variant="primary" onClick={closeModal}>Save Changes</Button>
          <Button variant="ghost" onClick={closeModal}>Cancel</Button>
        </div>
      </ModalShell>
    ) : modal === "create-group" ? (
      <ModalShell title="Create New Group" icon="#i-people">
        <div className="fg"><label>Group Name</label><input type="text" placeholder="e.g. Group C — Intermediate" /></div>
        <div className="fg">
          <label>Linked Course</label>
          <select>
            <option>Algebra II</option>
            <option>Python Intro</option>
            <option>Chemistry Basics</option>
          </select>
        </div>
        <div style={{ background: "rgba(79,140,255,0.06)", border: "1px solid rgba(79,140,255,0.15)", borderRadius: 8, padding: "10px 13px", marginBottom: 14, fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="13" height="13" style={{ color: "var(--accent)", flexShrink: 0 }}><use href="#i-people" /></svg>
          Students join groups themselves from their course page.
        </div>
        <div className="fl g2">
          <Button variant="primary" onClick={closeModal}>Create Group</Button>
          <Button variant="ghost" onClick={closeModal}>Cancel</Button>
        </div>
      </ModalShell>
    ) : (
      <ModalShell title="Modal" icon="#i-cog">
        <div className="tm">Not implemented yet</div>
        <div style={{ marginTop: 12 }}>
          <Button variant="ghost" onClick={closeModal}>Close</Button>
        </div>
      </ModalShell>
    );

  return ReactDOM.createPortal(node, root);
}