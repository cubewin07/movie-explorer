import Sidebar from '../components/react_components/SideBar/Sidebar';
import { Outlet } from 'react-router-dom';

function Layout() {
    return (
        <div className="min-h-screen w-full flex justify-center items-start bg-gray-100 py-8 px-2 animate-fade-in">
            <div className="w-full flex rounded-2xl shadow-xl bg-white overflow-hidden border border-gray-200">
                {/* Left Sidebar */}
                <aside className="w-60 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-200 bg-white">
                    <Sidebar left={true} />
                </aside>

                {/* Main Content */}
                <main className="flex-grow min-h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50 px-8 py-6">
                    <Outlet />
                </main>

                {/* Right Sidebar */}
                <aside className="w-60 h-[calc(100vh-4rem)] overflow-y-auto border-l border-gray-200 bg-white">
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
