import {Outlet, Navigate} from 'react-router'
import {Sidebar} from '@/ui/components/sidebar/index.jsx'
import {Topbar} from '@/ui/components/topbar/index.jsx'
import {useAuth} from '@/providers/auth.jsx'

const ADMIN_NAV = [
    {to: '/admin', label: 'Home', icon: 'layout-dashboard', end: true},
    {to: '/admin/teachers', label: 'Teachers', icon: 'users'},
    {to: '/admin/students', label: 'Students', icon: 'graduation-cap'},
    {to: '/admin/courses', label: 'Courses', icon: 'book-open'},
]
const ADMIN_BOTTOM = [
    {to: '/admin/settings', label: 'Settings', icon: 'settings'},
]

const TEACHER_NAV = [
    {to: '/teacher', label: 'Home', icon: 'layout-dashboard', end: true},
    {to: '/teacher/students', label: 'Students', icon: 'graduation-cap'},
{to: '/teacher/sessions', label: 'Live Sessions', icon: 'video'},
    {to: '/teacher/chat', label: 'Messages', icon: 'message-circle'},
]
const TEACHER_BOTTOM = [
    {to: '/teacher/settings', label: 'Settings', icon: 'settings'},
]

export function AppLayout({role}) {
    const auth = useAuth()

    if (auth?.isLoading) {
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--it-text-secondary)'}}>
                Loading…
            </div>
        )
    }

    if (auth?.user && role && !auth?.roles?.includes(role)) {
        if (auth.isAdmin) return <Navigate to="/admin" replace/>
        if (auth.isTeacher) return <Navigate to="/teacher" replace/>
        return <Navigate to="/login" replace/>
    }

    const isAdmin = role === 'admin'
    const items = isAdmin ? ADMIN_NAV : TEACHER_NAV
    const bottom = isAdmin ? ADMIN_BOTTOM : TEACHER_BOTTOM

    return (
        <div className="it-app">
            <Sidebar items={items} bottomItems={bottom}/>
            <div className="it-main">
                <Topbar/>
                <main className="it-content">
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}

export default AppLayout
