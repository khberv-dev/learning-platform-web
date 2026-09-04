// The API's UserRole enum. "Mentor" is this product's name for what the API
// still calls `teacher` on the wire (the chat and stats services already
// surface it as `mentor`), so the wire value stays `teacher` everywhere a
// request or a `roles` array is involved - only UI copy says "mentor".
export const ROLE = {
    ADMIN: 'admin',
    MENTOR: 'teacher',
    STUDENT: 'student',
};

export const PANEL_ROLES = [ROLE.ADMIN, ROLE.MENTOR, ROLE.STUDENT];

export const HOME_PATH_BY_ROLE = {
    [ROLE.ADMIN]: '/admin',
    [ROLE.MENTOR]: '/mentor',
    [ROLE.STUDENT]: '/student/settings',
};

// An account can hold several profiles; admin wins so a user who is both
// lands on the wider panel.
export function primaryRole(roles) {
    if (!Array.isArray(roles)) return null;
    return PANEL_ROLES.find((role) => roles.includes(role)) ?? null;
}

export function homePathFor(roles) {
    const role = primaryRole(roles);
    return role ? HOME_PATH_BY_ROLE[role] : '/login';
}
