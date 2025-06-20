import { Link } from "react-router-dom";
import {
  Home,
  Users,
  Compass,
  Clock,
  User,
  UserPlus,
  List,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react";

function Sidebar({left = false, right = false}) {
    if(left) {
        return (
            <aside className="w-48 border-r border-slate-800">
              <div>{/* <img src={logo} alt="logo" /> */}</div>
        
              <div className="flex flex-col items-center justify-between">
                <ul className="menu menu-border w-full pr-0">
                  <li className="menu-title">Menu</li>
                  <li>
                    <Link to="/">
                      <Home className="h-5 w-5" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/community">
                      <Users className="h-5 w-5" />
                      Community
                    </Link>
                  </li>
                  <li>
                    <Link to="/discovery">
                      <Compass className="h-5 w-5" />
                      Discovery
                    </Link>
                  </li>
                  <li>
                    <Link to="/coming-soon">
                      <Clock className="h-5 w-5" />
                      Coming Soon
                    </Link>
                  </li>
                </ul>
        
                <ul className="menu w-full pr-0 menu-border">
                  <li className="menu-title">Social</li>
                  <li>
                    <Link to="/profile">
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/friend">
                      <UserPlus className="h-5 w-5" />
                      Friend
                    </Link>
                  </li>
                  <li>
                    <Link to="/media">
                      <List className="h-5 w-5" />
                      Media
                    </Link>
                  </li>
                </ul>
        
                <ul className="menu w-full pr-0 menu-border">
                  <li className="menu-title">General</li>
                  <li>
                    <Link to="/settings">
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/logout">
                      <LogOut className="h-5 w-5" />
                      Logout
                    </Link>
                  </li>
                  <li>
                    <Link to="/help">
                      <HelpCircle className="h-5 w-5" />
                      Help & Support
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>
          );
    }
  
}

export default Sidebar;
