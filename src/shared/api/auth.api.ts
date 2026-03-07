import { api } from "./axios";

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  birthday: string | null;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface SignInResponse {
  user: AuthUser;
  access: string;
  refresh: string;
  roles: string[];
}

export async function signIn(payload: {
  email: string;
  password: string;
}) {
  const { data } = await api.post("/auth/sign-in", payload);
  return data;
}