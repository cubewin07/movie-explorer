import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar as ShadSidebar, SidebarBody } from '@/components/ui/Sidebar';
import { useState } from 'react';
import { Home, Users, Compass, Clock, User, List, Settings, LogOut, HelpCircle } from 'lucide-react';
import Sidebar from '@/components/react_components/SideBar/Sidebar';
import { SidebarLink, useSidebar } from '@/components/ui/Sidebar.jsx';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

import { useThemeToggle } from '@/hooks/useThemeToggle';
import FilmModalProvider from '@/context/FilmModalProvider';
import { AuthenProvider, useAuthen } from '@/context/AuthenProvider';
import Login from '@/components/pages/Authentication/Login';
import Register from '@/components/pages/Authentication/Register';
import { Dialog, DialogContent } from '@/components/ui/dialog';

function Layout() {
    const [open, setOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);

    return (
        <AuthenProvider>
            <FilmModalProvider>
                <div className="min-h-screen w-full flex justify-center items-start bg-background py-8 px-2 animate-fade-in">
                    <div className="w-full flex rounded-2xl shadow-xl bg-card overflow-hidden border border-border h-[calc(100vh-4rem)]">
                        <aside className="h-full">
                            <ShadSidebar open={open} setOpen={setOpen}>
                                <SidebarBody>
                                    <SidebarContent
                                        // handleThemeToggle={handleThemeToggle}
                                        setLoginOpen={setLoginOpen}
                                        setRegisterOpen={setRegisterOpen}
                                    />
                                </SidebarBody>
                            </ShadSidebar>
                        </aside>
                        <main className="flex-grow h-full overflow-y-auto bg-background px-8 py-6 text-foreground">
                            <Outlet />
                        </main>
                        <aside className="w-[25rem] h-full bg-card">
                            <Sidebar right={true} />
                        </aside>
                    </div>
                </div>
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                    <DialogContent className="p-0 w-full max-w-sm bg-background border-border shadow-md rounded-xl">
                        <Login
                            onSuccess={() => setLoginOpen(false)}
                            onShowRegister={() => {
                                setLoginOpen(false);
                                setRegisterOpen(true);
                            }}
                        />
                    </DialogContent>
                </Dialog>
                <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                    <DialogContent className="p-0 w-full max-w-sm bg-background border-border shadow-md rounded-xl">
                        <Register onSuccess={() => setRegisterOpen(false)} />
                    </DialogContent>
                </Dialog>
                <Toaster richColors position="top-right" closeButton />
            </FilmModalProvider>
        </AuthenProvider>
    );
}

function SidebarContent({ handleThemeToggle, setLoginOpen, setRegisterOpen }) {
    const { open, animate } = useSidebar();
    const [isDark, setIsDark] = useThemeToggle();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthen();
    const pathname = location.pathname;

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
            <div className="flex flex-col items-center justify-center min-h-[64px] mb-2 w-full">
                <motion.span
                    initial={false}
                    animate={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold text-primary tracking-tight origin-left"
                    style={{ display: open ? 'inline-block' : 'none', cursor: 'pointer' }}
                    onClick={() => navigate('/')}
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
                    ) : (
                        <SidebarLink
                            link={{ icon: <User className="h-5 w-5" />, label: 'Login', href: '#' }}
                            onClick={() => setLoginOpen(true)}
                            active={false}
                        />
                    )}
                    <SidebarLink
                        link={{ icon: <Users className="h-5 w-5" />, label: 'Friend', href: user ? '/friend' : '#' }}
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

export default Layout;
