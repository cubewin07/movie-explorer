import { Outlet } from 'react-router-dom';
import { Sidebar as ShadSidebar, SidebarBody } from '@/components/ui/Sidebar';
import { useState } from 'react';
import { Home, Users, Compass, Clock, User, UserPlus, List, Settings, LogOut, HelpCircle } from 'lucide-react';
import Sidebar from '@/components/react_components/SideBar/Sidebar';
import { SidebarLink, useSidebar } from '@/components/ui/Sidebar.jsx';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function Layout() {
    // Active state for menu
    const [active, setActive] = useState('/');
    const [open, setOpen] = useState(false);

    // Theme toggle handler
    const handleThemeToggle = (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-start bg-background py-8 px-2 animate-fade-in">
            <div className="w-full flex rounded-2xl shadow-xl bg-card overflow-hidden border border-border h-[calc(100vh-4rem)]">
                {/* Left Sidebar (hybrid) */}
                <aside className="h-full">
                    <ShadSidebar open={open} setOpen={setOpen}>
                        <SidebarBody>
                            <SidebarContent
                                active={active}
                                setActive={setActive}
                                handleThemeToggle={handleThemeToggle}
                            />
                        </SidebarBody>
                    </ShadSidebar>
                </aside>

                {/* Main Content */}
                <main className="flex-grow h-full overflow-y-auto bg-background px-8 py-6 text-foreground">
                    <Outlet />
                </main>

                {/* Right Sidebar */}
                <aside className="w-[25rem] h-full bg-card">
                    <Sidebar right={true} />
                </aside>
            </div>
        </div>
    );
}

function SidebarContent({ active, setActive, handleThemeToggle }) {
    const { open, animate } = useSidebar();
    return (
        <div
            className={cn(
                'flex flex-col h-full w-full bg-card rounded-2xl shadow-md p-4 gap-2 text-foreground border border-border',
                // open ? 'items-start' : 'items-center',
            )}
        >
            {/* Theme Toggle */}
            <input
                type="checkbox"
                onChange={handleThemeToggle}
                defaultChecked
                className="w-10 h-6 theme-controller toggle toggle-success border-accent rounded-2xl ml-[-12px] "
                style={{ backgroundColor: 'bisque' }}
            />
            {/* Logo Area */}
            <div className="flex flex-col items-center justify-center min-h-[64px] mb-2 w-full">
                <motion.span
                    initial={false}
                    animate={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold text-primary tracking-tight origin-left"
                    style={{ display: open ? 'inline-block' : 'none' }}
                >
                    MovieHub
                </motion.span>
                {!open && (
                    <motion.span
                        initial={false}
                        animate={{ opacity: !open ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-2xl font-bold text-primary tracking-tight"
                    >
                        M
                    </motion.span>
                )}
            </div>
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
                        className={active === '/' ? 'menu-item-active' : ''}
                        active={active === '/'}
                        onClick={() => setActive('/')}
                    />
                    <SidebarLink
                        link={{ icon: <Users className="h-5 w-5" />, label: 'Community', href: '/community' }}
                        className={active === '/community' ? 'menu-item-active' : ''}
                        active={active === '/community'}
                        onClick={() => setActive('/community')}
                    />
                    <SidebarLink
                        link={{ icon: <Compass className="h-5 w-5" />, label: 'Discovery', href: '/discovery' }}
                        className={active === '/discovery' ? 'menu-item-active' : ''}
                        active={active === '/discovery'}
                        onClick={() => setActive('/discovery')}
                    />
                    <SidebarLink
                        link={{ icon: <Clock className="h-5 w-5" />, label: 'Coming Soon', href: '/coming-soon' }}
                        className={active === '/coming-soon' ? 'menu-item-active' : ''}
                        active={active === '/coming-soon'}
                        onClick={() => setActive('/coming-soon')}
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
                    <SidebarLink
                        link={{ icon: <User className="h-5 w-5" />, label: 'Profile', href: '/profile' }}
                        className={active === '/profile' ? 'menu-item-active' : ''}
                        active={active === '/profile'}
                        onClick={() => setActive('/profile')}
                    />
                    <SidebarLink
                        link={{ icon: <UserPlus className="h-5 w-5" />, label: 'Friend', href: '/friend' }}
                        className={active === '/friend' ? 'menu-item-active' : ''}
                        active={active === '/friend'}
                        onClick={() => setActive('/friend')}
                    />
                    <SidebarLink
                        link={{ icon: <List className="h-5 w-5" />, label: 'Media', href: '/media' }}
                        className={active === '/media' ? 'menu-item-active' : ''}
                        active={active === '/media'}
                        onClick={() => setActive('/media')}
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
                        className={active === '/settings' ? 'menu-item-active' : ''}
                        active={active === '/settings'}
                        onClick={() => setActive('/settings')}
                    />
                    <SidebarLink
                        link={{ icon: <LogOut className="h-5 w-5" />, label: 'Logout', href: '/logout' }}
                        className={active === '/logout' ? 'menu-item-active' : ''}
                        active={active === '/logout'}
                        onClick={() => setActive('/logout')}
                    />
                    <SidebarLink
                        link={{ icon: <HelpCircle className="h-5 w-5" />, label: 'Help & Support', href: '/help' }}
                        className={active === '/help' ? 'menu-item-active' : ''}
                        active={active === '/help'}
                        onClick={() => setActive('/help')}
                    />
                </ul>
            </div>
        </div>
    );
}

export default Layout;

// Add this animation to your tailwind.config.js if not present:
// theme.extend.animation: { 'fade-in': 'fadeIn 0.6s ease' },
// theme.extend.keyframes: { fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } } }
