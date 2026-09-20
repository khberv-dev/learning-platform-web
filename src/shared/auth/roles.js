// The API's UserRole enum. This panel serves admins and mentors only; a
// `student` account is rejected at sign-in. "Mentor" is spelled `mentor` on
// the wire too now; each account holds exactly one role, permanently (Student, Mentor and Admin
// are three independent tables), so a person who needs two roles has two
// accounts.
export const ROLE = {
    ADMIN: 'admin',
    MENTOR: 'mentor',
    STUDENT: 'student',
};

export const PANEL_ROLES = [ROLE.ADMIN, ROLE.MENTOR];

export const HOME_PATH_BY_ROLE = {
    [ROLE.ADMIN]: '/admin',
    [ROLE.MENTOR]: '/mentor',
};

export function isPanelRole(role) {
    return PANEL_ROLES.includes(role);
}

export function homePathFor(role) {
    return isPanelRole(role) ? HOME_PATH_BY_ROLE[role] : '/login';
}

// Every authenticated route carries the caller's role as its first path
// segment (`admin/me`, `mentor/chat/rooms`, ...). Read straight from storage
// so the service layer needs no React context.
export function currentRole() {
    try {
        const stored = localStorage.getItem('role');
        return isPanelRole(stored) ? stored : null;
    } catch {
        return null;
    }
}
