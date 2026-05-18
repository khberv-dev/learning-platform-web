import {api} from "@/services/api.js";

export async function getStudentMe() {
    const res = await api.get('students/me')
    return res.data
}
