import {Outlet} from "react-router";
import Sidebar from "@/ui/components/sidebar/index.jsx";
import Topbar from "@/ui/components/topbar/index.jsx";
import {useAuth} from "@/providers/auth.jsx";
import {getFullName, getInitials} from "@/utils/user.js";

const BASE_NAV = [
    {to: '/admin', icon: 'layout-dashboard', label: 'Home', end: true},
    {to: '/admin/teachers', icon: 'users', label: 'Teachers'},
    {to: '/admin/students', icon: 'graduation-cap', label: 'Students'},
    {to: '/admin/courses', icon: 'book-open', label: 'Courses'},
    {to: '/admin/assignments', icon: 'shield-check', label: 'Assignments'},
    {spacer: true},
    {to: '/admin/settings', icon: 'settings', label: 'Settings'},
]

export default function AppLayout() {
    const {user, logout} = useAuth() ?? {}

    const nav = [
        ...BASE_NAV,
        {icon: 'log-out', label: 'Logout', tone: 'danger', onClick: logout},
    ]

    const userInfo = {
        initials: user ? getInitials(user) : 'A',
        name: user ? getFullName(user) : 'Admin User',
        role: 'Administrator',
        palette: 'green',
    }

    return (
        <div style={{display: 'flex', height: '100vh', background: 'var(--it-bg)'}}>
            <Sidebar items={nav} user={userInfo}/>
            <main
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                }}
            >
                <Topbar/>
                <div style={{flex: 1, padding: 28, overflow: 'auto'}}>
                    <Outlet/>
                </div>
            </main>
        </div>
    )
}
