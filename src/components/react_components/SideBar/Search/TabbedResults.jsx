import { Clapperboard, Tv, SearchX } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function TabbedResults({ data, renderCards }) {
    const [activeTab, setActiveTab] = useState(() => {
        if (data?.movies?.length > 0) return 'movie';
        if (data?.tv?.length > 0) return 'tv';
        return 'movie';
    });

    const tabClass = (tab) =>
        `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-t-lg font-medium cursor-pointer border-b-2 transition-all duration-200 ${
            activeTab === tab
                ? 'text-primary border-primary bg-base-100'
                : 'text-base-content/70 border-transparent hover:text-primary hover:border-base-300 hover:bg-base-200'
        }`;

    return (
        <div className="w-full">
            {/* Tabs */}
            <div className="flex gap-2 sm:gap-4 border-b border-base-300 px-3 sm:px-4 md:px-6">
                <button
                    onClick={() => setActiveTab('movie')}
                    className={tabClass('movie')}
                >
                    <Clapperboard className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Movies</span>
                </button>
                <button
                    onClick={() => setActiveTab('tv')}
                    className={tabClass('tv')}
                >
                    <Tv className="w-4 h-4" />
                    <span className="text-sm sm:text-base">TV Series</span>
                </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 md:p-6 bg-base-100 min-h-[100px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'movie' ? (
                        <motion.div
                            key="movie"
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
