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

export async function signIn(data: SignInPayload) {
  const response = await api.post<SignInResponse>("/auth/sign-in", data);
  return response.data;
}