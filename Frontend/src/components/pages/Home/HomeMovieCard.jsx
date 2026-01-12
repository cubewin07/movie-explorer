import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const MovieCard = ({ movie, type = 'movie', index = 0, genreMap, setContext, setIsOpen }) => {
    const genreNames = movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean) || [];
    const [isImageHovered, setIsImageHovered] = useState(false);
    
    // 3D Tilt Effect Setup
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setIsImageHovered(false);
    };

    return (
        <motion.div
            ref={ref}
            key={`${movie.id}-${type}-${index}`}
            className="movie-card w-[200px] md:w-[240px] flex-shrink-0 relative perspective-1000 group"
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for "stunning" feel
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setIsImageHovered(true)}
            onClick={() => {
                setContext({ ...movie, genres: genreNames });
                setIsOpen(true);
            }}
        >
            <div className="relative h-full bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl border border-gray-100 dark:border-slate-700">
                
                {/* Image Container */}
                <div className="relative h-[320px] overflow-hidden">
                    <motion.img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title || movie.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    
                    {/* Cinematic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                    {/* Floating Rating Badge */}
                    <motion.div 
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                    >
                        ★ {movie.vote_average?.toFixed(1)}
                    </motion.div>

                    {/* Play Button Reveal */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            <svg className="w-6 h-6 text-white fill-current ml-1" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-5 relative z-10 bg-white dark:bg-slate-800 transform transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate mb-2 group-hover:text-blue-500 transition-colors">
                        {movie.title || movie.name}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                        {genreNames.slice(0, 2).map((name, idx) => (
                            <span 
                                key={idx}
                                className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                            >
                                {name}
                            </span>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4)}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MovieCard;