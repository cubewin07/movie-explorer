import { useState, useRef, useEffect } from "react";
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
  Search,
} from "lucide-react";

function Sidebar({left = false, right = false}) {
    if(left) {
        return (
            <aside className="w-52 border-r border-r-2 border-slate-50 border-opacity-20">
              <div>{/* <img src={logo} alt="logo" /> */}</div>
        
              <div className="flex flex-col items-center justify-between mt-4">
                <ul className="menu menu-border w-full pr-0">
                  <li className="menu-title">Menu</li>
                  <li className="menu-item-active">
                    <Link to="/" >
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
        if(right) {
            const inputRef = useRef(null);
            const [search, setSearch] = useState("");
            const [isFocused, setIsFocused] = useState(false);
            const handleSearch = () => {
                setSearch(inputRef.current.value);
            }

            useEffect(() => {
                if(isFocused) {
                    inputRef.current.focus();
                }
            }, [isFocused]);

            useEffect(() => {
                inputRef.current.addEventListener("keydown", (e) => {
                    if(e.key === "Enter") {
                        handleSearch();
                    }
                });
            }, [handleSearch]);

            useEffect(() => {
                const handleKeyDown = (event) => {
                    const isCmdOrCtrl = event.metaKey || event.ctrlKey
                
                    if (isCmdOrCtrl && event.key.toLowerCase() === 'k') {
                      event.preventDefault();
                      setIsFocused(true);
                    }
                  }
                
                  window.addEventListener('keydown', handleKeyDown)
                  return () => window.removeEventListener('keydown', handleKeyDown)
            }, [])

          return (
              <aside className="w-52 border-l border-l-2 border-slate-50 border-opacity-20">
                <div className="flex flex-col items-center justify-between mt-4 px-2 ">
                    <label className="input input-accent border border-primary text-white bg-slate-800 animate-pulse-glow">
                        {isFocused ? (
                            // Only input when focused
                            <input
                            type="search"
                            className="grow bg-transparent placeholder:text-gray-400 text-white"
                            placeholder="Search"
                            value={search}
                            onChange={handleSearch}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            ref={inputRef}
                            />
                        ) : (
                            // Full layout when not focused
                            <>
                            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                                </g>
                            </svg>
                            <input
                                type="search"
                                className="grow bg-transparent placeholder:text-gray-400 text-white"
                                placeholder="Search"
                                value={search}
                                onChange={handleSearch}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                ref={inputRef}
                            />
                            <kbd className="kbd kbd-sm">⌘</kbd>
                            <kbd className="kbd kbd-sm">K</kbd>
                            </>
                        )}
                    </label>

                </div>  
              </aside>
          )
        }
        
}

export default Sidebar;
