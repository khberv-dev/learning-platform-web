import {Outlet} from "react-router";
import Sidebar from "@/ui/components/sidebar/index.jsx";
import Topbar from "@/ui/components/topbar/index.jsx";
import {useAuth} from "@/providers/auth.jsx";
import {getFullName, getInitials} from "@/utils/user.js";

const BASE_NAV = [
    {to: '/teacher', icon: 'layout-dashboard', label: 'Home', end: true},
    {to: '/teacher/students', icon: 'graduation-cap', label: 'Students'},
    {to: '/teacher/sessions', icon: 'video', label: 'Live Sessions'},
    {to: '/teacher/chat', icon: 'message-circle', label: 'Chat'},
    {spacer: true},
    {to: '/teacher/settings', icon: 'settings', label: 'Settings'},
]

export default function TeacherLayout() {
    const {user, logout} = useAuth() ?? {}

    const nav = [
        ...BASE_NAV,
        {icon: 'log-out', label: 'Logout', tone: 'danger', onClick: logout},
    ]

    const userInfo = {
        initials: user ? getInitials(user) : 'T',
        name: user ? getFullName(user) : 'Teacher',
        role: 'Teacher',
        palette: 'purple',
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
