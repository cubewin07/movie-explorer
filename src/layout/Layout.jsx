import Sidebar from "../components/react_components/Sidebar";
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