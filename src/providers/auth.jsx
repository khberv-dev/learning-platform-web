import {createContext, useContext} from "react";
import {useNavigate} from "react-router";
import {useQueryClient} from "@tanstack/react-query";
import {useGetMe} from "@/services/user/query.js";

const AuthContext = createContext(null)

export function AuthProvider({children}) {
    const {data: user, isLoading} = useGetMe()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        queryClient.removeQueries({queryKey: ['user']})
        navigate('/login')
    }

    return (
        <AuthContext.Provider value={{user, isLoading, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
