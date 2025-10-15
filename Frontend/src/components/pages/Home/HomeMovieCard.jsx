import { useState } from 'react';
import { motion } from 'framer-motion';

const MovieCard = ({ movie, type = 'movie', index = 0, genreMap, setContext, setIsOpen }) => {
    const genreNames = movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean) || [];
    const [isImageHovered, setIsImageHovered] = useState(false);
    const [isCardHovered, setIsCardHovered] = useState(false);

    return (
        <motion.div
            key={`${movie.id}-${type}-${index}`}
            className="movie-card w-[180px] md:w-[200px] flex-shrink-0 relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-2xl flex flex-col overflow-hidden cursor-pointer backdrop-blur-sm group"
            whileHover={{
                y: -6,
                transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                },
            }}
            whileTap={{
                y: -2,
                transition: { duration: 0.1 },
            }}
            initial={{
                opacity: 0,
                y: 30,
                scale: 0.95,
            }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
            }}
            transition={{
                duration: 0.5,
                delay: 0.08 * index,
                ease: 'easeOut',
            }}
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
            onClick={() => {
                setContext({ ...movie, genres: genreNames });
                setIsOpen(true);
            }}
        >
            {/* Animated border glow effect */}
            <motion.div
                className="absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none"
                style={{
                    background:
                        'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent, rgba(147, 51, 234, 0.3), transparent)',
                    backgroundSize: '300% 300%',
                    animation: isCardHovered ? 'gradient-shift 3s ease infinite' : 'none',
                    opacity: isCardHovered ? 1 : 0,
                }}
            />

            {/* Inner glow */}
            <div
                className="absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none bg-gradient-to-t from-blue-500/5 to-transparent"
                style={{ opacity: isCardHovered ? 1 : 0 }}
            />

            {/* Image container with enhanced effects */}
            <div
                className="relative h-72 overflow-hidden rounded-t-2xl"
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
            >
                <motion.img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover transition-all duration-500"
                    style={{
                        filter: isCardHovered ? 'brightness(1.1) contrast(1.05)' : 'brightness(1) contrast(1)',
                    }}
                />

                {/* Subtle gradient overlay on hover */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-500"
                    style={{ opacity: isCardHovered ? 1 : 0 }}
                />

                {/* Rating badge with subtle animation */}
                <motion.div
                    className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.3 + index * 0.05,
                        duration: 0.4,
                        ease: 'easeOut',
                    }}
                    whileHover={{
                        y: -2,
                        boxShadow: '0 6px 20px rgba(251, 191, 36, 0.4)',
                        transition: { duration: 0.2 },
                    }}
                >
                    ★ {movie.vote_average?.toFixed(1)}
                </motion.div>

                {/* Subtle play indicator on image hover only */}
                <div
                    className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                    style={{ opacity: isImageHovered ? 1 : 0 }}
                >
                    <motion.div
                        className="w-12 h-12 bg-white/95 dark:bg-slate-800/95 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                            scale: isImageHovered ? 1 : 0.8,
                            opacity: isImageHovered ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <svg
                            className="w-4 h-4 text-gray-800 dark:text-white ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </motion.div>
                </div>
            </div>

            {/* Content section with enhanced animations */}
            <motion.div
                className="p-4 flex flex-col flex-1 relative"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
            >
                <div className="flex flex-col flex-grow min-h-0">
                    <h3
                        className="text-lg font-bold text-gray-900 dark:text-white truncate mb-2 transition-colors duration-300"
                        style={{
                            color: isCardHovered
                                ? 'rgb(37, 99, 235)' // blue-600
                                : undefined, // Use default CSS colors
                        }}
                    >
                        {movie.title || movie.name}
                    </h3>

                    <motion.div
                        className="flex flex-wrap gap-1.5 mb-3"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: {
                                transition: { staggerChildren: 0.1 },
                            },
                        }}
                    >
                        {genreNames.slice(0, 2).map((name, idx) => (
                            <motion.span
                                key={name + idx}
                                className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-medium shadow-sm"
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{
                                    duration: 0.4,
                                    delay: 0.4 + idx * 0.1,
                                    type: 'spring',
                                    stiffness: 200,
                                }}
                                whileHover={{
                                    y: -1,
                                    transition: { duration: 0.2 },
                                }}
                            >
                                {name}
                            </motion.span>
                        ))}
                    </motion.div>
                </div>

                <motion.span
                    className="text-sm text-gray-600 dark:text-gray-300 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                >
                    {movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4)}
                </motion.span>

                {/* Bottom accent line */}
                <div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out"
                    style={{
                        width: isCardHovered ? '100%' : '0%',
                    }}
                />
            </motion.div>
        </motion.div>
    );
};

export default MovieCard;