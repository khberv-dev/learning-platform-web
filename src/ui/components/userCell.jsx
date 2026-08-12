import UserAvatar from '@/ui/components/userAvatar.jsx';
import {formatPhone, fullName} from '@/shared/utils/format.js';

// The shared "who is this" table cell: avatar, name, and the phone number as a
// secondary line (staff accounts are keyed by phone, not email).
function UserCell({user, secondary}) {
    const name = fullName(user) || '—';

    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 10, minWidth: 0}}>
            <UserAvatar avatar={user?.avatar} name={name} size="s"/>
            <div style={{minWidth: 0}}>
                <div style={{fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {name}
                </div>
                <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)'}}>
                    {secondary ?? formatPhone(user?.phoneNumber)}
                </div>
            </div>
        </div>
    );
}

export default UserCell;
