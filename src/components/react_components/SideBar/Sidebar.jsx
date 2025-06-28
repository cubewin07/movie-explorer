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

    if (right) {
        return (
            <div className="flex flex-col h-full w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-card rounded-2xl shadow-md p-2 sm:p-3 md:p-4 text-foreground border-l border-border min-w-0">
                <div className="mb-3 sm:mb-4 flex-shrink-0">
                    <SearchInput />
                </div>
                <div className="overflow-y-auto space-y-3 sm:space-y-4 flex-1 min-w-0">
                    <PopularMovies />
                    <PopularTvSeries />
                </div>
            </div>
        );
    }
}

export default Sidebar;
