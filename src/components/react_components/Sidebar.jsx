import { Link } from "react-router-dom";
function Sidebar({}) {
    return (
        <aside>
            <div>
                {/* <img src={logo} alt="logo" /> */}
            </div>
            <div className="flex flex-col items-center justify-between">
                <ul className="menu w-full">
                    <li className="menu-title">Menu</li>
                    <li><Link to="/">Home</Link></li>
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