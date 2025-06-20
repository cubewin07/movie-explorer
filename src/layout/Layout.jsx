import Sidebar from "../components/react_components/Sidebar";
import { Outlet } from "react-router-dom";
function Layout() {
    return (  
        <>
            <Sidebar />
            <main>
                <Outlet />
            </main>
            <Sidebar />
        </>
    );
}

export default Layout;