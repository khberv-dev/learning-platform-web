import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '@gravity-ui/uikit';
import {ChevronDown, ChevronRight, LogOut, PanelLeftClose, PanelLeftOpen} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import UserAvatar from '@/ui/components/userAvatar.jsx';

const EXPANDED_WIDTH = 248;
const COMPACT_WIDTH = 64;

function NavLink({item, active, depth = 0, compact, onClick}) {
    const {t} = useI18n();
    const Icon = item.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            title={compact ? t(item.titleKey) : undefined}
            className="sidebar__item"
            data-active={active ? 'true' : undefined}
            style={{
                paddingLeft: compact ? 0 : 12 + depth * 20,
                justifyContent: compact ? 'center' : 'flex-start',
            }}
        >
            {Icon && <Icon size={17} style={{flexShrink: 0}}/>}
            {!compact && <span className="sidebar__label">{t(item.titleKey)}</span>}
        </button>
    );
}

function NavGroup({group, activeItemPath, compact, openIds, onToggle, onNavigate, onExpandSidebar}) {
    const {t} = useI18n();
    const Icon = group.icon;
    const open = openIds.includes(group.id);
    const hasActiveChild = group.children.some((child) => child.path === activeItemPath);

    // In the icon-only rail there's nowhere to put children, so clicking a
    // group opens the sidebar back up and expands it rather than doing nothing.
    const handleClick = () => {
        if (compact) {
            onExpandSidebar();
            if (!open) onToggle(group.id);
            return;
        }
        onToggle(group.id);
    };

    return (
        <div>
            <button
                type="button"
                onClick={handleClick}
                title={compact ? t(group.titleKey) : undefined}
                className="sidebar__item"
                // A collapsed group whose child is active stays highlighted, so
                // the current section is still findable when it's folded shut.
                data-active={!open && hasActiveChild ? 'true' : undefined}
                style={{
                    paddingLeft: compact ? 0 : 12,
                    justifyContent: compact ? 'center' : 'flex-start',
                }}
            >
                {Icon && <Icon size={17} style={{flexShrink: 0}}/>}
                {!compact && (
                    <>
                        <span className="sidebar__label">{t(group.titleKey)}</span>
                        {open ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}
                    </>
                )}
            </button>

            {!compact && open && (
                <div style={{display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2}}>
                    {group.children.map((child) => (
                        <NavLink
                            key={child.id}
                            item={child}
                            depth={1}
                            active={child.path === activeItemPath}
                            compact={compact}
                            onClick={() => onNavigate(child.path)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function Sidebar({items, activeItemPath, roleLabel, user, userName, onLogout, onOpenSettings}) {
    const {t} = useI18n();
    const navigate = useNavigate();
    const [compact, setCompact] = useState(false);
    // Groups start open when they contain the active route, so a deep link
    // lands with its section already unfolded.
    const [openIds, setOpenIds] = useState(() =>
        items
            .filter((item) => item.children?.some((child) => child.path === activeItemPath))
            .map((item) => item.id)
    );

    const toggleGroup = (id) => {
        setOpenIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    };

    return (
        <aside
            className="sidebar"
            style={{width: compact ? COMPACT_WIDTH : EXPANDED_WIDTH}}
        >
            <div
                style={{
                    display: 'flex',
                    // The rail is too narrow for the mark and the toggle side
                    // by side, so they stack instead of the mark disappearing.
                    flexDirection: compact ? 'column' : 'row',
                    alignItems: 'center',
                    gap: compact ? 6 : 10,
                    padding: compact ? '16px 0' : '16px 12px',
                    justifyContent: compact ? 'center' : 'space-between',
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: 8, minWidth: 0}}>
                    {/* Served from public/, so it's a root-absolute path
                        rather than an import. */}
                    <img
                        src="/brand.png"
                        alt=""
                        width={26}
                        height={26}
                        style={{display: 'block', flexShrink: 0}}
                    />
                    {!compact && <span style={{fontWeight: 600, fontSize: 15}}>iTeach</span>}
                </div>
                <Button
                    view="flat"
                    size="s"
                    onClick={() => setCompact((current) => !current)}
                    aria-label={compact ? 'Expand' : 'Collapse'}
                >
                    <Button.Icon>
                        {compact ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}
                    </Button.Icon>
                </Button>
            </div>

            <nav
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: compact ? '4px 8px' : '4px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                {items.map((item) =>
                    item.children ? (
                        <NavGroup
                            key={item.id}
                            group={item}
                            activeItemPath={activeItemPath}
                            compact={compact}
                            openIds={openIds}
                            onToggle={toggleGroup}
                            onNavigate={navigate}
                            onExpandSidebar={() => setCompact(false)}
                        />
                    ) : (
                        <NavLink
                            key={item.id}
                            item={item}
                            active={item.path === activeItemPath}
                            compact={compact}
                            onClick={() => navigate(item.path)}
                        />
                    )
                )}
            </nav>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: compact ? '10px 0' : '10px 12px',
                    borderTop: '1px solid var(--g-color-line-generic)',
                    justifyContent: compact ? 'center' : 'space-between',
                }}
            >
                <button
                    type="button"
                    onClick={onOpenSettings}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        minWidth: 0,
                        flex: compact ? '0 0 auto' : '1 1 auto',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        font: 'inherit',
                        textAlign: 'left',
                        padding: 0,
                    }}
                >
                    <UserAvatar avatar={user?.avatar} name={userName} size="s"/>
                    {!compact && (
                        <span style={{minWidth: 0}}>
                            <span className="sidebar__label" style={{fontSize: 13, fontWeight: 600}}>
                                {userName}
                            </span>
                            <span
                                style={{
                                    display: 'block',
                                    fontSize: 12,
                                    color: 'var(--g-color-text-secondary)',
                                }}
                            >
                                {roleLabel}
                            </span>
                        </span>
                    )}
                </button>
                {!compact && (
                    <Button view="flat" size="s" onClick={onLogout} aria-label={t('auth.logout')}>
                        <Button.Icon>
                            <LogOut size={16}/>
                        </Button.Icon>
                    </Button>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
