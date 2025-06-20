import { Link } from "react-router-dom";
function Sidebar({}) {
    return (
        <aside className="w-48 border-r border-slate-800">
            <div>
                {/* <img src={logo} alt="logo" /> */}
            </div>
            <div className="flex flex-col items-center justify-between">
                <ul className="menu w-full">
                    <li className="menu-title">Menu</li>
                    <li className="menu-active">
                        <Link to="/"> 
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                                />
                            </svg>
                                Home
                            </Link>
                        </li>
                    <li><Link to="/community">Community</Link></li>
                    <li><Link to="/discovery">Discovery</Link></li>
                    <li><Link to="/coming-soon">Coming Soon</Link></li>
                </ul>
                <ul className="menu w-full">
                    <li className="menu-title">Social</li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/friend">Friend</Link></li>
                    <li><Link to="/media">Media</Link></li>
                </ul>
                <ul className="menu w-full">
                    <li className="menu-title">General</li>
                    <li><Link to="/settings">Settings</Link></li>
                    <li><Link to="/logout">Logout</Link></li>
                    <li><Link to="/help">Help & Support</Link></li>
                </ul>
            </div>
            
        </aside>
      );
}

export default Sidebar;