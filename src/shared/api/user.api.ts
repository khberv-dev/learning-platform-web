import { api } from "./axios";
import type { AuthUser } from "./auth.api";

export interface UpdateMePayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export async function getMe() {
  const response = await api.get<AuthUser>("/user/me");
  return response.data;
}

export async function updateMe(payload: UpdateMePayload) {
  const response = await api.put<AuthUser>("/user/update", payload);
  return response.data;
}