import {
    BellRing,
    BookOpen,
    CalendarClock,
    ClipboardCheck,
    CreditCard,
    GraduationCap,
    Handshake,
    Home,
    LayoutDashboard,
    Megaphone,
    PenLine,
    Settings,
    ShieldCheck,
    UserCog,
    UsersRound,
    Users,
    Wallet,
} from 'lucide-react';
import {ROLE} from '@/shared/auth/roles.js';

// The sidebar tree, and the source of truth for the URL layout: a group's
// `id` is also its path segment, so /admin/users/mentors sits under the
// "users" group. Adding a page means adding a route in app.jsx and a leaf
// here, with a titleKey present in every locale file.
//
// A node with `children` renders as a collapsible group; one with `path`
// renders as a link. Groups are never themselves navigable. A node marked
// `superadminOnly` is shown only to an admin whose `me.isSuperadmin` is set -
// see navForUser below.
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
                {
                    id: 'admins',
                    titleKey: 'nav.admins',
                    icon: ShieldCheck,
                    path: '/admin/users/admins',
                    superadminOnly: true,
                },
            ],
        },
        {id: 'groups', titleKey: 'nav.groups', icon: UsersRound, path: '/admin/groups'},
        {id: 'assignments', titleKey: 'nav.assignments', icon: Handshake, path: '/admin/assignments'},
        {
            id: 'course',
            titleKey: 'nav.course',
            icon: BookOpen,
            children: [
                {id: 'courses', titleKey: 'nav.courses', icon: BookOpen, path: '/admin/course/courses'},
                {id: 'authors', titleKey: 'nav.authors', icon: PenLine, path: '/admin/course/authors'},
                {
                    id: 'enrollments',
                    titleKey: 'nav.enrollments',
                    icon: CalendarClock,
                    path: '/admin/course/enrollments',
                },
                {
                    id: 'pendingEnrollments',
                    titleKey: 'nav.pendingEnrollments',
                    icon: ClipboardCheck,
                    path: '/admin/course/pending-enrollments',
                },
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
        {
            id: 'marketing',
            titleKey: 'nav.marketing',
            icon: Megaphone,
            children: [
                {
                    id: 'pushNotifications',
                    titleKey: 'nav.pushNotifications',
                    icon: BellRing,
                    path: '/admin/marketing/push-notifications',
                },
            ],
        },
        {id: 'settings', titleKey: 'nav.settings', icon: Settings, path: '/admin/settings'},
    ],
    [ROLE.MENTOR]: [
        {id: 'home', titleKey: 'nav.home', icon: LayoutDashboard, path: '/mentor'},
        {id: 'groups', titleKey: 'nav.groups', icon: UsersRound, path: '/mentor/groups'},
        {id: 'assignments', titleKey: 'nav.assignments', icon: Handshake, path: '/mentor/assignments'},
        {id: 'settings', titleKey: 'nav.settings', icon: Settings, path: '/mentor/settings'},
    ],
};

// The role's tree with `superadminOnly` nodes dropped unless `me` is a
// superadmin. A group left with no children is dropped as well. Hiding the
// entry is only cosmetic - the API 403s those routes for a plain admin.
export function navForUser(role, me) {
    const allowed = (node) => !node.superadminOnly || Boolean(me?.isSuperadmin);

    return (NAV_BY_ROLE[role] ?? [])
        .filter(allowed)
        .map((node) => (node.children ? {...node, children: node.children.filter(allowed)} : node))
        .filter((node) => !node.children || node.children.length > 0);
}

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
