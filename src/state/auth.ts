import { create } from "zustand";

type Role = "admin" | "teacher";

type AuthState = {
  isAuthed: boolean;
  role: Role;
  phone: string;
  login: (phone: string, pass: string) => void;
  logout: () => void;
  setRole: (role: Role) => void;
};

export const useAuth = create<AuthState>((set) => ({
  isAuthed: false,
  role: "admin",
  phone: "",
  login: (phone) => set({ isAuthed: true, phone }),
  logout: () => set({ isAuthed: false, phone: "" }),
  setRole: (role) => set({ role }),
}));