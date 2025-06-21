import Sidebar from "../components/react_components/SideBar/Sidebar";
import { Outlet } from "react-router-dom";
function Layout() {
    return (  
        <>
            <Sidebar left={true} />
            <main className="flex-1">
                <Outlet />
            </main>
            <Sidebar right={true} />
        </>
    );
}

export default Layout;