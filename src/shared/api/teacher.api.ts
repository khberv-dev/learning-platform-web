import { api } from "./axios";


export type TeacherDto = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTeacherPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type UpdateTeacherPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

function extractArray<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.teachers)) return payload.teachers;
  return [];
}

export async function getAllTeachers() {
  const { data } = await api.get("/teacher/all");
  return extractArray<TeacherDto>(data);
}

export async function createTeacher(payload: CreateTeacherPayload) {
  const { data } = await api.post<TeacherDto>("/teacher/create", payload);
  return data;
}

export async function updateTeacher(userId: string, payload: UpdateTeacherPayload) {
  const { data } = await api.put<TeacherDto>(`/user/update/${userId}`, payload);
  return data;
}