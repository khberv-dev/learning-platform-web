import {createContext, useContext, useMemo} from "react";
import {useNavigate} from "react-router";
import {useQueryClient} from "@tanstack/react-query";
import {useGetMe} from "@/services/user/query.js";

const AuthContext = createContext(null)

export function AuthProvider({children}) {
    const {data: user, isLoading} = useGetMe()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const value = useMemo(() => {
        const roles = user?.roles ?? []
        const role = roles.includes('admin') ? 'admin' : roles.includes('teacher') ? 'teacher' : roles.includes('student') ? 'student' : null

        return {
            user,
            isLoading,
            roles,
            role,
            isAdmin: roles.includes('admin'),
            isTeacher: roles.includes('teacher'),
            isStudent: roles.includes('student'),
            logout() {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                queryClient.removeQueries({queryKey: ['user']})
                navigate('/login')
            },
        }
    }, [user, isLoading, navigate, queryClient])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
