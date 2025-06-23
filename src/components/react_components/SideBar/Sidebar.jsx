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
            <div className="flex flex-col h-full w-full bg-card rounded-2xl shadow-md p-4 gap-6 animate-fade-in overflow-y-auto text-foreground border-l border-border">
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
