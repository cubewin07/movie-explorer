import { Clapperboard, Tv } from 'lucide-react';
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
                                <p className="text-warning text-center">No movies found.</p>
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
                                <p className="text-warning text-center">No TV series found.</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default TabbedResults;
