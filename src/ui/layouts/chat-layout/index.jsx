import {Outlet} from 'react-router'
import {Sidebar} from '@/ui/components/sidebar/index.jsx'

const TEACHER_NAV = [
    {to: '/teacher', label: 'Home', icon: 'layout-dashboard', end: true},
    {to: '/teacher/students', label: 'Students', icon: 'graduation-cap'},
    {to: '/teacher/groups', label: 'Groups', icon: 'users-round'},
    {to: '/teacher/sessions', label: 'Live Sessions', icon: 'video'},
    {to: '/teacher/chat', label: 'Messages', icon: 'message-circle'},
]
const TEACHER_BOTTOM = [
    {to: '/teacher/settings', label: 'Settings', icon: 'settings'},
]

export function ChatLayout() {
    return (
        <div className="it-app">
            <Sidebar items={TEACHER_NAV} bottomItems={TEACHER_BOTTOM}/>
            <div className="it-main" style={{height: '100vh', overflow: 'hidden'}}>
                <Outlet/>
            </div>
        </div>
    )
}

export default ChatLayout
