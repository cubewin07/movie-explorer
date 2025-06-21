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

    // DaisyUI theme toggle
    const handleThemeToggle = (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
    };

    const handleActive = (path) => {
        setActive(path);
    };

    if (left) {
        return (
            <div className="flex flex-col h-full w-full bg-white rounded-2xl shadow-md p-4 gap-6 animate-fade-in overflow-y-auto">
                {/* Theme Toggle */}
                <div className="flex justify-end mb-2">
                    <label className="swap swap-rotate">
                        <input type="checkbox" onChange={handleThemeToggle} className="theme-controller" />
                        <svg
                            className="swap-on fill-current w-6 h-6 text-yellow-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <path d="M5.64 17.66A9 9 0 0 1 12 3v0a9 9 0 1 0 9 9h0a9 9 0 0 1-15.36 5.66z"></path>
                        </svg>
                        <svg
                            className="swap-off fill-current w-6 h-6 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <path d="M21.64 13A9 9 0 0 1 12 21a9 9 0 0 1 0-18 9 9 0 0 1 9 9z"></path>
                        </svg>
                    </label>
                </div>
                {/* Logo Area */}
                <div className="flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-blue-600 tracking-tight">MovieHub</span>
                </div>
                <div className="flex flex-col justify-between flex-1 gap-6">
                    <ul className="menu menu-border w-full pr-0">
                        <li className="menu-title text-xs text-gray-400 uppercase tracking-wider">Menu</li>
                        <li className={active === '/' ? 'menu-item-active' : ''}>
                            <Link
                                to="/"
                                onClick={() => handleActive('/')}
                                className="transition-transform duration-150 hover:scale-[1.03]"
                            >
                                <Home className="h-5 w-5" />
                                Home
                            </Link>
                        </li>
                        <li className={active === '/community' ? 'menu-item-active' : ''}>
                            <Link
                                to="/community"
                                onClick={() => handleActive('/community')}
                                className="transition-transform duration-150 hover:scale-[1.03]"
                            >
                                <Users className="h-5 w-5" />
                                Community
                            </Link>
                        </li>
                        <li className={active === '/discovery' ? 'menu-item-active' : ''}>
                            <Link
                                to="/discovery"
                                onClick={() => handleActive('/discovery')}
                                className="transition-transform duration-150 hover:scale-[1.03]"
                            >
                                <Compass className="h-5 w-5" />
                                Discovery
                            </Link>
                        </li>
                        <li className={active === '/coming-soon' ? 'menu-item-active' : ''}>
                            <Link
                                to="/coming-soon"
                                onClick={() => handleActive('/coming-soon')}
                                className="transition-transform duration-150 hover:scale-[1.03]"
                            >
                                <Clock className="h-5 w-5" />
                                Coming Soon
                            </Link>
                        </li>
                    </ul>

                    <ul className="menu w-full pr-0 menu-border">
                        <li className="menu-title text-xs text-gray-400 uppercase tracking-wider">Social</li>
                        <li className={active === '/profile' ? 'menu-item-active' : ''}>
                            <Link
                                to="/profile"
                                onClick={() => handleActive('/profile')}
                                className="transition-transform duration-150 hover:scale-[1.03]"
                            >
                                <User className="h-5 w-5" />
                                Profile
                            </Link>
                        </li>
                        <li className={active === '/friend' ? 'menu-item-active' : ''}>
                            <Link
                                to="/friend"
                                onClick={() => handleActive('/friend')}
                                className="transition-transform duration-150 hover:scale-[1.03]"
                            >
                                <UserPlus className="h-5 w-5" />
                                Friend
                            </Link>
                        </li>
                        <li className={active === '/media' ? 'menu-item-active' : ''}>
                            <Link
                                to="/media"
                                onClick={() => handleActive('/media')}
                                className="transition-transform duration-150 hover:scale-[1.03]"
                            >
                                <List className="h-5 w-5" />
                                Media
                            </Link>
                        </li>
                    </ul>

                    <ul className="menu w-full pr-0 menu-border">
                        <li className="menu-title text-xs text-gray-400 uppercase tracking-wider">General</li>
                        <li className={active === '/settings' ? 'menu-item-active' : ''}>
                            <Link
                                to="/settings"
                                onClick={() => handleActive('/settings')}
                                className="transition-transform duration-150 hover:scale-[1.03]"
                            >
                                <Settings className="h-5 w-5" />
                                Settings
                            </Link>
                        </li>
                        <li className={active === '/logout' ? 'menu-item-active' : ''}>
                            <Link
                                to="/logout"
                                onClick={() => handleActive('/logout')}
                                className="transition-transform duration-150 hover:scale-[1.03]"
                            >
                                <LogOut className="h-5 w-5" />
                                Logout
                            </Link>
                        </li>
                        <li className={active === '/help' ? 'menu-item-active' : ''}>
                            <Link
                                to="/help"
                                onClick={() => handleActive('/help')}
                                className="transition-transform duration-150 hover:scale-[1.03]"
                            >
                                <HelpCircle className="h-5 w-5" />
                                Help & Support
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
    if (right) {
        return (
            <div className="flex flex-col h-full w-full bg-white rounded-2xl shadow-md p-4 gap-6 animate-fade-in overflow-y-auto">
                <div className="mb-4">
                    <SearchInput />
                </div>
                <div className="mb-4">
                    <PopularMovies />
                </div>
                <div>
                    <PopularTvSeries />
                </div>
            </div>
        );
    }
}

export default Sidebar;
