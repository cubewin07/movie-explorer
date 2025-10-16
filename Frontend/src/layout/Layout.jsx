import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar as ShadSidebar, SidebarBody } from '@/components/ui/Sidebar';
import { useState } from 'react';

import Sidebar from '@/components/react_components/SideBar/Sidebar';
import LeftSidebarContent from './LeftSideBarContent';

import { Toaster } from 'sonner';

import NotificationBell from '@/components/ui/notificationBell';
import FilmModalProvider from '@/context/FilmModalProvider';
import { AuthenProvider, useAuthen } from '@/context/AuthenProvider';
import Login from '@/components/pages/Authentication/Login';
import Register from '@/components/pages/Authentication/Register';
import { Dialog, DialogContent } from '@/components/ui/dialog';

function Layout() {
    const [open, setOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <AuthenProvider>
            <FilmModalProvider>
                <div className="min-h-screen w-full flex justify-center items-start bg-background py-4 sm:py-6 md:py-8 px-2 animate-fade-in">
                    <div className="w-full flex rounded-2xl shadow-xl bg-card overflow-hidden border border-border h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)]">
                        <aside className="h-full">
                            <ShadSidebar open={open} setOpen={setOpen}>
                                <SidebarBody>
                                    <LeftSidebarContent
                                        // handleThemeToggle={handleThemeToggle}
                                        setLoginOpen={setLoginOpen}
                                        setRegisterOpen={setRegisterOpen}
                                    />
                                </SidebarBody>
                            </ShadSidebar>
                        </aside>
                        <main className="flex-grow h-full overflow-y-auto bg-background text-foreground">
                            <div className="flex items-center justify-between py-3 px-4 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg rounded-b-2xl border-b border-slate-800">
                                <h1 className="text-xl font-semibold text-white px-2 sm:px-4 cursor-pointer" onClick={() => navigate("/")}>Movie Hub</h1>
                                <NotificationBell />
                            </div>
                            <div className="mt-4">
                                <Outlet />
                            </div>
                        </main>
                        <aside className="hidden md:block w-64 sm:w-72 h-full bg-card">
                            <Sidebar right={true} />
                        </aside>
                    </div>
                </div>
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                    <DialogContent className="p-0 w-full max-w-xs sm:max-w-sm bg-background border-border shadow-md rounded-xl">
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
                    <DialogContent className="p-0 w-full max-w-xs sm:max-w-sm bg-background border-border shadow-md rounded-xl">
                        <Register onSuccess={() => setRegisterOpen(false)} />
                    </DialogContent>
                </Dialog>
                <Toaster richColors position="top-right" closeButton />
            </FilmModalProvider>
        </AuthenProvider>
    );
}



export default Layout;
