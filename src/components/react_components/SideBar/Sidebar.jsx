import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, Compass, Clock, User, UserPlus, List, Settings, LogOut, HelpCircle, Search } from 'lucide-react';

import axiosInstance from '@/lib/axiosInstance';
import PopularMovies from './Popular/PopularMovies';
import PopularTvSeries from './Popular/PopularTvSeries';
import SearchInput from './Search/SearchInput';

function Sidebar({ left = false, right = false }) {
    const [active, setActive] = useState('/');

    const handleActive = (path) => {
        setActive(path);
    };

    if (left) {
        return (
            // <aside className="w-52 border-r-2 border-slate-50 border-opacity-20 ">
            <>
                <div>{/* <img src={logo} alt="logo" /> */}</div>

                <div className="flex flex-col items-center justify-between mt-4">
                    <ul className="menu menu-border w-full pr-0">
                        <li className="menu-title">Menu</li>
                        <li className={active === '/' ? 'menu-item-active' : ''}>
                            <Link to="/" onClick={() => handleActive('/')}>
                                <Home className="h-5 w-5" />
                                Home
                            </Link>
                        </li>
                        <li className={active === '/community' ? 'menu-item-active' : ''}>
                            <Link to="/community" onClick={() => handleActive('/community')}>
                                <Users className="h-5 w-5" />
                                Community
                            </Link>
                        </li>
                        <li className={active === '/discovery' ? 'menu-item-active' : ''}>
                            <Link to="/discovery" onClick={() => handleActive('/discovery')}>
                                <Compass className="h-5 w-5" />
                                Discovery
                            </Link>
                        </li>
                        <li className={active === '/coming-soon' ? 'menu-item-active' : ''}>
                            <Link to="/coming-soon" onClick={() => handleActive('/coming-soon')}>
                                <Clock className="h-5 w-5" />
                                Coming Soon
                            </Link>
                        </li>
                    </ul>

                    <ul className="menu w-full pr-0 menu-border">
                        <li className="menu-title">Social</li>
                        <li className={active === '/profile' ? 'menu-item-active' : ''}>
                            <Link to="/profile" onClick={() => handleActive('/profile')}>
                                <User className="h-5 w-5" />
                                Profile
                            </Link>
                        </li>
                        <li className={active === '/friend' ? 'menu-item-active' : ''}>
                            <Link to="/friend" onClick={() => handleActive('/friend')}>
                                <UserPlus className="h-5 w-5" />
                                Friend
                            </Link>
                        </li>
                        <li className={active === '/media' ? 'menu-item-active' : ''}>
                            <Link to="/media" onClick={() => handleActive('/media')}>
                                <List className="h-5 w-5" />
                                Media
                            </Link>
                        </li>
                    </ul>

                    <ul className="menu w-full pr-0 menu-border">
                        <li className="menu-title">General</li>
                        <li className={active === '/settings' ? 'menu-item-active' : ''}>
                            <Link to="/settings" onClick={() => handleActive('/settings')}>
                                <Settings className="h-5 w-5" />
                                Settings
                            </Link>
                        </li>
                        <li className={active === '/logout' ? 'menu-item-active' : ''}>
                            <Link to="/logout" onClick={() => handleActive('/logout')}>
                                <LogOut className="h-5 w-5" />
                                Logout
                            </Link>
                        </li>
                        <li className={active === '/help' ? 'menu-item-active' : ''}>
                            <Link to="/help" onClick={() => handleActive('/help')}>
                                <HelpCircle className="h-5 w-5" />
                                Help & Support
                            </Link>
                        </li>
                    </ul>
                </div>
            </>
            // </aside>
        );
    }
    if (right) {
        return (
            <>
                {/* <aside className="w-52 border-l-2 border-slate-50 border-opacity-20"> */}
                <div className="flex flex-col items-center justify-between mt-4 pr-2 pl-6 space-y-5 relative">
                    <SearchInput />
                    <PopularMovies />
                    <PopularTvSeries />
                </div>
                {/* </aside> */}
            </>
        );
    }
}

export default Sidebar;
