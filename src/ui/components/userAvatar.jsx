import {Avatar} from '@gravity-ui/uikit';
import {initials} from '@/shared/utils/format.js';

function UserAvatar({avatar, name, size = 'm'}) {
    const src = avatar || null;

    if (src) {
        return <Avatar imgUrl={src} size={size} alt={name ?? ''}/>;
    }

    return <Avatar text={initials(name)} size={size}/>;
}

export default UserAvatar;
