import { create } from "zustand";
import { signIn, type AuthUser } from "../shared/api/auth.api";
import { getMe } from "../shared/api/user.api";

export type AppRole = "admin" | "teacher" | null;

type AuthState = {
  isAuthed: boolean;
  loading: boolean;
  user: AuthUser | null;
  role: AppRole;
  roles: string[];

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  restore: () => void;
  fetchMe: () => Promise<void>;
  updateUserLocal: (user: AuthUser) => void;
};

function mapRolesToAppRole(roles: string[]): AppRole {
  if (roles.includes("ADMIN")) return "admin";
  if (roles.includes("TEACHER")) return "teacher";
  return null;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthed: false,
  loading: false,
  user: null,
  role: null,
  roles: [],

  login: async (email, password) => {
    set({ loading: true });

    try {
      const data = await signIn({ email, password });

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      localStorage.setItem("auth_roles", JSON.stringify(data.roles));

      set({
        isAuthed: true,
        user: data.user,
        roles: data.roles,
        role: mapRolesToAppRole(data.roles),
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_roles");

    set({
      isAuthed: false,
      user: null,
      role: null,
      roles: [],
      loading: false,
    });
  },

  restore: () => {
    const access = localStorage.getItem("access_token");
    const userRaw = localStorage.getItem("auth_user");
    const rolesRaw = localStorage.getItem("auth_roles");

    if (!access) {
      set({
        isAuthed: false,
        user: null,
        role: null,
        roles: [],
      });
      return;
    }

    const user = userRaw ? JSON.parse(userRaw) : null;
    const roles = rolesRaw ? JSON.parse(rolesRaw) : [];

    set({
      isAuthed: true,
      user,
      roles,
      role: mapRolesToAppRole(roles),
    });
  },

  fetchMe: async () => {
    const me = await getMe();

    const currentRolesRaw = localStorage.getItem("auth_roles");
    const roles = currentRolesRaw ? JSON.parse(currentRolesRaw) : [];

    localStorage.setItem("auth_user", JSON.stringify(me));

    set({
      user: me,
      roles,
      role: mapRolesToAppRole(roles),
      isAuthed: true,
    });
  },

  updateUserLocal: (user) => {
    localStorage.setItem("auth_user", JSON.stringify(user));
    set({ user });
  },
}));