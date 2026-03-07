import { api } from "./axios";
import type { AuthUser } from "./auth.api";

export interface UpdateMePayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export async function getMe() {
  const { data } = await api.get("/user/me");
  return data;
}

export async function updateMe(payload: UpdateMePayload) {
  const response = await api.put<AuthUser>("/user/update", payload);
  return response.data;
}