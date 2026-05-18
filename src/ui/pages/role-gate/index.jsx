import {useEffect} from "react";
import {Navigate, useNavigate} from "react-router";
import {useAuth} from "@/providers/auth.jsx";

export default function RoleGate() {
    const {user, isLoading} = useAuth() ?? {}
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoading || !user) return
        const roles = user.roles ?? []
        if (roles.includes('admin')) navigate('/admin', {replace: true})
        else if (roles.includes('teacher')) navigate('/teacher', {replace: true})
        else if (roles.includes('student')) navigate('/login', {replace: true})
        else navigate('/login', {replace: true})
    }, [user, isLoading, navigate])

    if (!localStorage.getItem('access_token')) {
        return <Navigate to="/login" replace/>
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--it-text-secondary)',
        }}>
            Loading...
        </div>
    )
}
