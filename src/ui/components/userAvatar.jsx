import {Avatar} from '@gravity-ui/uikit';
import {cdnUrl, initials} from '@/shared/utils/format.js';

function UserAvatar({avatar, name, size = 'm'}) {
    const src = cdnUrl(avatar);

    if (src) {
        return <Avatar imgUrl={src} size={size} alt={name ?? ''}/>;
    }

    return <Avatar text={initials(name)} size={size}/>;
}

export default UserAvatar;
