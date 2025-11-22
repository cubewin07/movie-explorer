import { useMemo } from 'react';
import { SidebarLink, useSidebar } from '@/components/ui/Sidebar.jsx';
import { Home, Users, Compass, Clock, User, List, Settings, LogOut, HelpCircle, Bookmark } from 'lucide-react';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { useChat } from '@/context/ChatProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthen } from '@/context/AuthenProvider';
import { cn } from '@/lib/utils';

function LeftSidebarContent({ handleThemeToggle, setLoginOpen, setRegisterOpen }) {
    const { open, animate } = useSidebar();
    const [isDark, setIsDark] = useThemeToggle();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthen();
    const { chatNotifications } = useChat();
    const pathname = location.pathname;

    console.log(chatNotifications);
    const badgeCount = useMemo(() => {
        return chatNotifications.length > 99 ? '99+' : chatNotifications.length;
    }, [chatNotifications]);

    return (
        <div
            className={cn(
                'flex flex-col h-full w-full bg-card rounded-2xl shadow-md p-4 gap-2 text-foreground border border-border',
            )}
        >
            <input
                type="checkbox"
                onChange={(e) => setIsDark(e.target.checked)}
                checked={isDark}
                className="w-10 h-6 theme-controller toggle toggle-success border-accent rounded-2xl ml-[-12px] "
                style={{ backgroundColor: 'bisque' }}
            />
            <div className="flex flex-col justify-between flex-1 gap-2 w-full">
                <ul className="menu menu-border w-full pr-0">
                    <li
                        className={cn(
                            'menu-title text-xs text-muted-foreground uppercase tracking-wider transition-all duration-200',
                            open
                                ? 'opacity-100 pointer-events-auto h-[1.5rem]'
                                : 'opacity-0 pointer-events-none h-0 overflow-hidden',
                        )}
                    >
                        Menu
                    </li>
                    <SidebarLink
                        link={{ icon: <Home className="h-5 w-5" />, label: 'Home', href: '/' }}
                        active={pathname === '/'}
                    />
                    <SidebarLink
                        link={{ icon: <Users className="h-5 w-5" />, label: 'Community', href: '/community' }}
                        active={pathname.startsWith('/community')}
                    />
                    <SidebarLink
                        link={{ icon: <Compass className="h-5 w-5" />, label: 'Discovery', href: '/movies' }}
                        active={pathname.startsWith('/movies') || pathname.startsWith('/movie')}
                    />
                    <SidebarLink
                        link={{ icon: <Clock className="h-5 w-5" />, label: 'Coming Soon', href: '/coming-soon' }}
                        active={pathname.startsWith('/coming-soon')}
                    />
                </ul>
                <ul className="menu w-full pr-0 menu-border">
                    <li
                        className={cn(
                            'menu-title text-xs text-muted-foreground uppercase tracking-wider transition-all duration-200',
                            open
                                ? 'opacity-100 pointer-events-auto h-[1.5rem]'
                                : 'opacity-0 pointer-events-none h-0 overflow-hidden',
                        )}
                    >
                        Social
                    </li>
                    {user ? (
                        <>
                            <SidebarLink
                                link={{
                                    icon: (
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.email)}`}
                                            alt="avatar"
                                            className="w-6 h-6 rounded-full border"
                                        />
                                    ),
                                    label: user.username || user.email,
                                    href: '/profile',
                                }}
                                active={pathname.startsWith('/profile')}
                            />
                            <SidebarLink
                                link={{
                                    icon: <Bookmark className="h-5 w-5" />,
                                    label: 'Watchlist',
                                    href: user ? '/watchlist' : '#',
                                }}
                                active={pathname.startsWith('/watchlist')}
                                onClick={() => !user && setLoginOpen(true)}
                            />
                        </>
                    ) : (
                        <SidebarLink
                            link={{ icon: <User className="h-5 w-5" />, label: 'Login', href: '#' }}
                            onClick={() => setLoginOpen(true)}
                            active={false}
                        />
                    )}
                    <SidebarLink
                        link={{ 
                            icon: <div className="relative">
                                    <Users className="h-5 w-5" />

                                    {/* Notification badge */}
                                    {(badgeCount > 0 || badgeCount === '99+') && (
                                        <span
                                            className="
                                            absolute -top-1 -right-1 
                                            bg-red-500 text-white text-[10px] font-semibold
                                            rounded-full h-4 min-w-4
                                            flex items-center justify-center
                                            px-1
                                            "
                                        >
                                            {chatNotifications.length}
                                        </span>
                                    )}
                                </div>,
                            label: 'Friend',
                            href: user ? '/friend' : '#'
                        }}
                        active={pathname.startsWith('/friend')}
                        onClick={() => !user && setLoginOpen(true)}
                    />
                    <SidebarLink
                        link={{ icon: <List className="h-5 w-5" />, label: 'Media', href: user ? '/media' : '#' }}
                        active={pathname.startsWith('/media')}
                        onClick={() => !user && setLoginOpen(true)}
                    />
                </ul>
                <ul className="menu w-full pr-0 menu-border">
                    <li
                        className={cn(
                            'menu-title text-xs text-muted-foreground uppercase tracking-wider transition-all duration-200',
                            open
                                ? 'opacity-100 pointer-events-auto h-[1.5rem]'
                                : 'opacity-0 pointer-events-none h-0 overflow-hidden',
                        )}
                    >
                        General
                    </li>
                    <SidebarLink
                        link={{ icon: <Settings className="h-5 w-5" />, label: 'Settings', href: '/settings' }}
                        active={pathname.startsWith('/settings')}
                    />
                    <SidebarLink
                        link={{ icon: <HelpCircle className="h-5 w-5" />, label: 'Help & Support', href: '/help' }}
                        active={pathname.startsWith('/help')}
                    />
                    {user && (
                        <SidebarLink
                            link={{ icon: <LogOut className="h-5 w-5" />, label: 'Logout', href: '#' }}
                            onClick={() => {
                                logout();
                            }}
                            active={false}
                        />
                    )}
                </ul>
            </div>
        </div>
    );
}

export default LeftSidebarContent;