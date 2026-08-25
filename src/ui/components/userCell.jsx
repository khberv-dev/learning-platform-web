import UserAvatar from '@/ui/components/userAvatar.jsx';
import {formatPhone, fullName} from '@/shared/utils/format.js';

// The shared "who is this" table cell: avatar, name, and the available account
// identity. New accounts may use either phone or email.
function UserCell({user, secondary}) {
    const name = fullName(user) || '—';
    const contact = user?.phoneNumber ? formatPhone(user.phoneNumber) : user?.email || '—';

    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 10, minWidth: 0}}>
            <UserAvatar avatar={user?.avatar} name={name} size="s"/>
            <div style={{minWidth: 0}}>
                <div style={{fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {name}
                </div>
                <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)'}}>
                    {secondary ?? contact}
                </div>
            </div>
        </div>
    );
}

export default UserCell;
