import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Calendar, Globe, X, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { FilmModalContext } from '@/context/FilmModalProvider';

const genreColorMap = {
    Action: 'bg-sky-200 text-sky-900 dark:bg-sky-800 dark:text-sky-100',
    Adventure: 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100',
    Animation: 'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    Comedy: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100',
    Crime: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100',
    Documentary: 'bg-teal-200 text-teal-900 dark:bg-teal-800 dark:text-teal-100',
    Drama: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
    Family: 'bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100',
    Fantasy: 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
    History: 'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-100',
    Horror: 'bg-red-300 text-red-900 dark:bg-red-900 dark:text-red-100',
    Music: 'bg-purple-200 text-purple-900 dark:bg-purple-800 dark:text-purple-100',
    Mystery: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    Romance: 'bg-pink-100 text-pink-700 dark:bg-pink-800 dark:text-pink-100',
    'Science Fiction': 'bg-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
    Thriller: 'bg-pink-200 text-pink-800 dark:bg-pink-800 dark:text-pink-100',
    War: 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
    Western: 'bg-yellow-300 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100',
};

export default function MovieReviewModal({
    title,
    id,
    name,
    original_title,
    original_name,
    first_air_date,
    genres = [],
    poster_path,
    vote_average = 0,
    vote_count = 0,
    overview = 'No overview available.',
    original_language,
    runtime,
}) {
    const { setIsOpen } = useContext(FilmModalContext);
    const posterUrl = poster_path
        ? `https://image.tmdb.org/t/p/w500${poster_path}`
        : '/placeholder.svg?height=400&width=300';

    const navigate = useNavigate();
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [setIsOpen]);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => setIsOpen(false)}
        >
            <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden bg-background border border-border text-foreground shadow-xl rounded-xl"
            >
                <CardContent className="p-4 sm:p-6 relative">
                    {/* Close Button */}
                    <div className="absolute top-4 right-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted/70 dark:hover:bg-muted/30 rounded-full border border-border"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                        {/* Poster */}
                        <motion.img
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            src={posterUrl}
                            alt={`${title} poster`}
                            className="w-32 h-48 sm:w-48 sm:h-72 mx-auto lg:mx-0 rounded-xl object-cover shadow-md"
                        />

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold">{title || name}</h1>
                                {original_title && original_title !== title && original_title !== name && (
                                    <p className="text-base text-muted-foreground italic">{original_title}</p>
                                )}
                                {original_name && original_name !== name && original_name !== title && (
                                    <p className="text-base text-muted-foreground italic">{original_name}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {original_language && (
                                    <div className="flex items-center gap-1">
                                        <Globe className="w-4 h-4" />
                                        {original_language.toUpperCase()}
                                    </div>
                                )}
                                {vote_average > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                                        {vote_average.toFixed(1)}/10
                                        <span className="text-xs ml-1">({vote_count} votes)</span>
                                    </div>
                                )}
                                {runtime && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {Math.floor(runtime / 60)}h {runtime % 60}m
                                    </div>
                                )}
                                {first_air_date && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(first_air_date).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            {/* Genre Tags */}
                            <motion.div
                                className="flex flex-wrap gap-2"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: {},
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.06,
                                        },
                                    },
                                }}
                            >
                                {genres.map((genre) => (
                                    <motion.span
                                        key={genre}
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            genreColorMap[genre] ||
                                            'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                        }`}
                                        variants={{
                                            hidden: { opacity: 0, y: 10 },
                                            visible: { opacity: 1, y: 0 },
                                        }}
                                    >
                                        {genre}
                                    </motion.span>
                                ))}
                            </motion.div>

                            {/* Overview */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{overview}</p>
                            </div>

                            {/* CTA */}
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                className="pt-4"
                                onClick={() => {
                                    navigate(title ? `/movie/${id}` : `/tv/${id}`);
                                    setIsOpen(false);
                                }}
                            >
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </CardContent>
            </motion.div>
        </motion.div>
    );
}
