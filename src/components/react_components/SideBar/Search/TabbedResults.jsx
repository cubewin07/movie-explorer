import { Clapperboard, Tv, SearchX } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function TabbedResults({ data, renderCards }) {
    const [activeTab, setActiveTab] = useState(() => {
        if (data?.movies?.length > 0) return 'movie';
        if (data?.tv?.length > 0) return 'tv';
        return 'movie';
    });

    // Tabs config with counts
    const tabs = [
        {
            key: 'movie',
            label: 'Movies',
            icon: Clapperboard,
            count: data?.movies?.length || 0,
        },
        {
            key: 'tv',
            label: 'TV Series',
            icon: Tv,
            count: data?.tv?.length || 0,
        },
    ];

    return (
        <div className="w-full">
            {/* Tabs */}
            <div className="px-3 sm:px-4 md:px-6">
                <div
                    role="tablist"
                    aria-label="Search result types"
                    className="relative isolate flex w-full items-center gap-2 sm:gap-3 rounded-xl border border-base-300/60 bg-base-200/60 p-1 backdrop-blur supports-[backdrop-filter]:bg-base-200/40"
                >
                    {tabs.map(({ key, label, icon: Icon, count }) => {
                        const isActive = activeTab === key;
                        return (
                            <button
                                key={key}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`panel-${key}`}
                                onClick={() => setActiveTab(key)}
                                type="button"
                                className="relative group flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="tab-pill"
                                        className="absolute inset-0 -z-10 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent shadow-inner"
                                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                                    />
                                )}
                                <Icon
                                    className={`w-4 h-4 transition-transform duration-200 ${
                                        isActive
                                            ? 'text-primary drop-shadow-sm'
                                            : 'text-base-content/70 group-hover:text-primary'
                                    } ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
                                />
                                <span
                                    className={`${
                                        isActive
                                            ? 'text-primary'
                                            : 'text-base-content/80 group-hover:text-primary'
                                    }`}
                                >
                                    {label}
                                </span>
                                <span
                                    className={`ml-1 inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none transition-colors ${
                                        isActive
                                            ? 'border-primary/40 bg-primary/15 text-primary'
                                            : 'border-base-300 bg-base-100/60 text-base-content/60 group-hover:text-primary group-hover:border-primary/30'
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 md:p-6 bg-base-100/90 border-t border-base-300/60 rounded-b-xl min-h-[100px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'movie' ? (
                        <motion.div
                            key="movie"
                            id="panel-movie"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {data?.movies?.length > 0 ? (
                                renderCards(data.movies, 'movie')
                            ) : (
                                <motion.div
                                    className="flex flex-col items-center justify-center py-8 text-warning"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                                >
                                    <motion.div
                                        initial={{ rotate: -10, scale: 0.8 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ duration: 0.5, type: "spring" }}
                                    >
                                        <SearchX className="w-10 h-10 mb-2 opacity-70" />
                                    </motion.div>
                                    <motion.p
                                        className="text-lg font-semibold"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                    >
                                        No movies found.
                                    </motion.p>
                                    <motion.span
                                        className="text-sm text-base-content/60 mt-1"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35, duration: 0.3 }}
                                    >
                                        Try a different search term.
                                    </motion.span>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="tv"
                            id="panel-tv"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {data?.tv?.length > 0 ? (
                                renderCards(data.tv, 'tv')
                            ) : (
                                <motion.div
                                    className="flex flex-col items-center justify-center py-8 text-warning"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                                >
                                    <motion.div
                                        initial={{ rotate: -10, scale: 0.8 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ duration: 0.5, type: "spring" }}
                                    >
                                        <SearchX className="w-10 h-10 mb-2 opacity-70" />
                                    </motion.div>
                                    <motion.p
                                        className="text-lg font-semibold"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                    >
                                        No TV series found.
                                    </motion.p>
                                    <motion.span
                                        className="text-sm text-base-content/60 mt-1"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35, duration: 0.3 }}
                                    >
                                        Try a different search term.
                                    </motion.span>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default TabbedResults;
