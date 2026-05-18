import {
    ArrowUpRight,
    Bell,
    BookOpen,
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Eye,
    EyeOff,
    Globe,
    GraduationCap,
    LayoutDashboard,
    LogIn,
    LogOut,
    Mail,
    Menu,
    MessageCircle,
    MoreVertical,
    Paperclip,
    Pause,
    Pencil,
    Phone,
    Play,
    Plus,
    Search,
    Send,
    Settings,
    ShieldCheck,
    Star,
    Trash2,
    TrendingUp,
    Upload,
    Users,
    Video,
    X,
} from "lucide-react";

const ICONS = {
    'layout-dashboard': LayoutDashboard,
    'users': Users,
    'users-2': Users,
    'graduation-cap': GraduationCap,
    'book-open': BookOpen,
    'settings': Settings,
    'video': Video,
    'message-circle': MessageCircle,
    'bell': Bell,
    'search': Search,
    'plus': Plus,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    'pencil': Pencil,
    'trash': Trash2,
    'phone': Phone,
    'mail': Mail,
    'calendar': Calendar,
    'check': Check,
    'x': X,
    'eye': Eye,
    'eye-off': EyeOff,
    'shield-check': ShieldCheck,
    'upload': Upload,
    'arrow-up-right': ArrowUpRight,
    'star': Star,
    'play': Play,
    'pause': Pause,
    'send': Send,
    'paperclip': Paperclip,
    'menu': Menu,
    'more-vertical': MoreVertical,
    'log-in': LogIn,
    'log-out': LogOut,
    'trending-up': TrendingUp,
    'dollar': DollarSign,
    'globe': Globe,
}

export default function Icon({name, size = 18, color = 'currentColor', strokeWidth = 2, style}) {
    const Cmp = ICONS[name]
    if (!Cmp) return null

    return (
        <Cmp
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            style={style}
            aria-hidden
        />
    )
}
