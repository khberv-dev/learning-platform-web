import {api} from "@/services/api.js";

export async function getMyStudent() {
    const res = await api.get('students/me')
    return res.data
}

export async function getStudents({page = 1, limit = 10} = {}) {
    const res = await api.get('students', {params: {page, limit}})
    return res.data
}
