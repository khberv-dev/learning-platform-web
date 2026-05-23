import {NavLink, useNavigate} from 'react-router'
import {Icon} from '@/ui/components/icon/index.jsx'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {useAuth} from '@/providers/auth.jsx'
import {fullName} from '@/utils/lib.js'

export function Sidebar({items = [], bottomItems = []}) {
    const {user, logout, role} = useAuth() ?? {}
    const navigate = useNavigate()

    const name = fullName(user) || (role === 'admin' ? 'Admin User' : 'User')
    const roleLabel = role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Teacher' : role === 'student' ? 'Student' : ''

    return (
        <aside className="it-sidebar">
            <div className="it-sidebar__brand">
                <div className="it-sidebar__brand-mark">i</div>
                <span className="it-sidebar__brand-name">iTeach</span>
            </div>
            <div className="it-sidebar__divider"/>
            <nav className="it-sidebar__nav">
                {items.map((item) => (
                    <SidebarItem key={item.to} item={item}/>
                ))}
                <div className="it-sidebar__nav-spacer"/>
                {bottomItems.map((item) => (
                    <SidebarItem key={item.to} item={item}/>
                ))}
            </nav>
            <div className="it-sidebar__divider"/>
            <button
                className="it-sidebar__user"
                onClick={() => logout?.()}
                title="Sign out"
                style={{cursor: 'pointer', background: 'transparent', border: 0, color: 'inherit', textAlign: 'left'}}
            >
                <Avatar name={name} size={36}/>
                <div className="it-sidebar__user-info">
                    <span className="it-sidebar__user-name">{name}</span>
                    <span className="it-sidebar__user-role">{roleLabel}</span>
                </div>
                <Icon name="log-out" size={16} color="var(--it-sidebar-muted)"/>
            </button>
        </aside>
    )
}

function SidebarItem({item}) {
    return (
        <NavLink
            to={item.to}
            end={item.end}
            className={({isActive}) => `it-nav-item ${isActive ? 'it-nav-item--active' : ''}`}
        >
            <Icon name={item.icon} size={18}/>
            <span>{item.label}</span>
        </NavLink>
    )
}

export default Sidebar
