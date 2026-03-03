export type AppRole = "admin" | "teacher";

const LS_AUTH = "iteach.auth";
const LS_ROLE = "iteach.role";
const LS_THEME = "iteach.theme";

export const authStore = {
  getAuthed(): boolean {
    return localStorage.getItem(LS_AUTH) === "1";
  },
  setAuthed(v: boolean) {
    localStorage.setItem(LS_AUTH, v ? "1" : "0");
  },

  getRole(): AppRole {
    const v = localStorage.getItem(LS_ROLE);
    return v === "teacher" ? "teacher" : "admin";
  },
  setRole(role: AppRole) {
    localStorage.setItem(LS_ROLE, role);
  },

  getTheme(): "dark" | "light" {
    const v = localStorage.getItem(LS_THEME);
    return v === "light" ? "light" : "dark";
  },
  setTheme(t: "dark" | "light") {
    localStorage.setItem(LS_THEME, t);
    document.documentElement.classList.toggle("light", t === "light");
  },
};

export function initTheme() {
  authStore.setTheme(authStore.getTheme());
}