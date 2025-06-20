import Sidebar from "../components/react_components/Sidebar";
import { Outlet } from "react-router-dom";
function Layout() {
    return (  
        <div className="flex h-screen max-w-screen-2xl mx-auto">
            <Sidebar />
            <main>
                <Outlet />
            </main>
            <Sidebar />
        </div>
    );
}

export default Layout;