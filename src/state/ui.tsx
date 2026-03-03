import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "admin" | "teacher";
type ModalId =
  | "add-teacher"
  | "edit-teacher"
  | "create-group"
  | "new-session"
  | "create-lesson"
  | "edit-lesson"
  | null;

type UiState = {
  role: Role;
  setRole: (r: Role) => void;

  theme: "dark" | "light";
  toggleTheme: () => void;

  modal: ModalId;
  openModal: (id: Exclude<ModalId, null>) => void;
  closeModal: () => void;
};

const UiCtx = createContext<UiState | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("admin");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });
  const [modal, setModal] = useState<ModalId>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "light") html.classList.add("light");
    else html.classList.remove("light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = useMemo<UiState>(
    () => ({
      role,
      setRole,
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      modal,
      openModal: (id) => setModal(id),
      closeModal: () => setModal(null),
    }),
    [role, theme, modal]
  );

  return <UiCtx.Provider value={value}>{children}</UiCtx.Provider>;
}

export function useUi() {
  const ctx = useContext(UiCtx);
  if (!ctx) throw new Error("useUi must be used inside UiProvider");
  return ctx;
}