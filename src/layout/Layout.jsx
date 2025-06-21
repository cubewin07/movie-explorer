import Sidebar from '../components/react_components/SideBar/Sidebar';
import { Outlet } from 'react-router-dom';

function Layout() {
    return (
        <div className="min-h-screen w-full flex justify-center items-start bg-background py-8 px-2 animate-fade-in">
            <div className="w-full flex rounded-2xl shadow-xl bg-card overflow-hidden border border-border h-[calc(100vh-4rem)]">
                {/* Left Sidebar */}
                <aside className="w-[25rem] h-full bg-card">
                    <Sidebar left={true} />
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

export default Layout;

// Add this animation to your tailwind.config.js if not present:
// theme.extend.animation: { 'fade-in': 'fadeIn 0.6s ease' },
// theme.extend.keyframes: { fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } } }
