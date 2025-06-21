import Sidebar from '../components/react_components/SideBar/Sidebar';
import { Outlet } from 'react-router-dom';
function Layout() {
    return (
        <>
            {/* // <div className="max-w-screen-xl mx-auto flex h-screen relative"> */}
            {/* Left Sidebar */}
            <aside className="w-52 h-full overflow-y-auto border-r border-slate-700 ">
                <Sidebar left={true} />
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto">
                <Outlet />
            </main>

            {/* Right Sidebar */}
            <aside className="w-52 h-full overflow-y-auto border-l border-slate-700">
                <Sidebar right={true} />
            </aside>
        </>
        // </div>
    );
}

export default Layout;
