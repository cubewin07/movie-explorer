import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

function SearchInput() {
    const inputRef = useRef(null);
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const handleSearch = () => {
        setSearch(inputRef.current.value);
    };

    useEffect(() => {
        if (isFocused) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    useEffect(() => {
        inputRef.current.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }, [handleSearch]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const isCmdOrCtrl = event.metaKey || event.ctrlKey;

            if (isCmdOrCtrl && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setIsFocused(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['search', search],
        queryFn: () => axiosInstance.get(`/search/movie?query=${search}`),
        enabled: !!search,
    });
    return (
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
                        <g
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeWidth="2.5"
                            fill="none"
                            stroke="currentColor"
                        >
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
    );
}

export default SearchInput;
