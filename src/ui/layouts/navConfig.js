import {
    BookOpen,
    CalendarClock,
    CreditCard,
    GraduationCap,
    Home,
    LayoutDashboard,
    MessageSquare,
    Settings,
    UserCheck,
    UserCog,
    Users,
    Video,
    Wallet,
} from 'lucide-react';
import {ROLE} from '@/shared/auth/roles.js';

// The sidebar tree, and the source of truth for the URL layout: a group's
// `id` is also its path segment, so /admin/users/mentors sits under the
// "users" group. Adding a page means adding a route in app.jsx and a leaf
// here, with a titleKey present in every locale file.
//
// A node with `children` renders as a collapsible group; one with `path`
// renders as a link. Groups are never themselves navigable.
export const NAV_BY_ROLE = {
    [ROLE.ADMIN]: [
        {id: 'home', titleKey: 'nav.home', icon: Home, path: '/admin'},
        {
            id: 'users',
            titleKey: 'nav.users',
            icon: Users,
            children: [
                {id: 'students', titleKey: 'nav.students', icon: GraduationCap, path: '/admin/users/students'},
                {id: 'mentors', titleKey: 'nav.mentors', icon: UserCog, path: '/admin/users/mentors'},
            ],
        },
        {
            id: 'course',
            titleKey: 'nav.course',
            icon: BookOpen,
            children: [
                {id: 'courses', titleKey: 'nav.courses', icon: BookOpen, path: '/admin/course/courses'},
            ],
        },
        {
            id: 'payment',
            titleKey: 'nav.payment',
            icon: CreditCard,
            children: [
                {id: 'payments', titleKey: 'nav.payments', icon: CreditCard, path: '/admin/payment/payments'},
                {
                    id: 'paymentTypes',
                    titleKey: 'nav.paymentTypes',
                    icon: Wallet,
                    path: '/admin/payment/payment-types',
                },
            ],
        },
        {id: 'settings', titleKey: 'nav.settings', icon: Settings, path: '/admin/settings'},
    ],
    [ROLE.MENTOR]: [
        {id: 'home', titleKey: 'nav.home', icon: LayoutDashboard, path: '/mentor'},
        {id: 'assignments', titleKey: 'nav.assignments', icon: UserCheck, path: '/mentor/assignments'},
        {id: 'liveLessons', titleKey: 'nav.liveLessons', icon: Video, path: '/mentor/live-lessons'},
        {id: 'schedule', titleKey: 'nav.schedule', icon: CalendarClock, path: '/mentor/schedule'},
        {id: 'chat', titleKey: 'nav.chat', icon: MessageSquare, path: '/mentor/chat'},
        {id: 'settings', titleKey: 'nav.settings', icon: Settings, path: '/mentor/settings'},
    ],
};

export function flattenNav(items) {
    return items.flatMap((item) => (item.children ? item.children : [item]));
}

// The deepest matching path wins, so /admin/course/courses/:id keeps
// "Courses" lit while /admin alone doesn't stay lit on every child route.
export function activePath(items, pathname) {
    return flattenNav(items)
        .map((item) => item.path)
        .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
        .sort((a, b) => b.length - a.length)[0];
}

export function homePath(items) {
    return items[0]?.path ?? '/';
}

export function settingsPath(items) {
    return flattenNav(items).find((item) => item.id === 'settings')?.path ?? homePath(items);
}
