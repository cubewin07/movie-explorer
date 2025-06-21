import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Star, Calendar, Clock, ArrowRight, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const MovieReviewModal = ({
    movie = {
        id: 1,
        title: 'The Shawshank Redemption',
        overview:
            "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency. This masterpiece explores themes of hope, friendship, and the human spirit's resilience in the face of adversity.",
        poster_path: 'https://images.unsplash.com/photo-1489599735734-79b4169c4388?w=400&h=600&fit=crop',
        release_date: '1994-09-23',
        vote_average: 9.3,
        genres: ['Drama', 'Crime'],
        runtime: 142,
    },
    isOpen = true,
    onClose = () => {},
    onViewDetails = () => {},
    theme = 'dark',
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
            setIsAnimatingOut(false);
            document.body.style.overflow = 'hidden';
            const timer = setTimeout(() => {
                closeButtonRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setIsAnimatingOut(true);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleAnimationEnd = useCallback(() => {
        if (!isOpen && isAnimatingOut) {
            setIsMounted(false);
            setIsAnimatingOut(false);
        }
    }, [isOpen, isAnimatingOut]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const formatRuntime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatRating = (rating) => rating.toFixed(1);

    const formatReleaseDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (!isMounted && !isAnimatingOut) return null;

    const themeClasses = {
        overlay: theme === 'light' ? `bg-black/40 backdrop-blur-sm` : `bg-black/60 backdrop-blur-sm`,
        card: theme === 'light' ? 'bg-white border-gray-200 shadow-2xl' : 'bg-background border-border shadow-2xl',
        title: theme === 'light' ? 'text-gray-900' : 'text-foreground',
        text: theme === 'light' ? 'text-gray-600' : 'text-muted-foreground',
        closeButton:
            theme === 'light'
                ? 'bg-white/90 hover:bg-white border-gray-200/50'
                : 'bg-background/80 hover:bg-background border-border/50',
        rating: theme === 'light' ? 'bg-yellow-500/15' : 'bg-yellow-500/10',
        badge:
            theme === 'light'
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'bg-primary/10 text-primary hover:bg-primary/20',
        button:
            theme === 'light'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground',
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${themeClasses.overlay} ${isOpen && !isAnimatingOut ? 'opacity-100' : 'opacity-0'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onTransitionEnd={handleAnimationEnd}
        >
            <Card
                ref={modalRef}
                className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden ${themeClasses.card} transition-all duration-300 ease-out ${
                    isOpen && !isAnimatingOut
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-95 opacity-0 translate-y-4'
                }`}
            >
                <div className="flex flex-col lg:flex-row h-full">
                    <div className="lg:w-1/3 h-64 lg:h-auto relative overflow-hidden">
                        {movie.poster_path ? (
                            <img
                                src={movie.poster_path}
                                alt={`${movie.title} poster`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className={`w-full h-full flex items-center justify-center ${
                                    theme === 'light' ? 'bg-gray-100' : 'bg-muted'
                                }`}
                            >
                                <span className={`text-lg ${themeClasses.text}`}>No Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:bg-gradient-to-r" />
                    </div>

                    <div className="lg:w-2/3 p-6 lg:p-8 overflow-y-auto">
                        <Button
                            ref={closeButtonRef}
                            variant="ghost"
                            size="icon"
                            className={`absolute top-4 right-4 z-10 h-8 w-8 rounded-full backdrop-blur-sm border transition-colors ${themeClasses.closeButton}`}
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        <h1
                            id="modal-title"
                            className={`text-2xl lg:text-3xl font-bold mb-4 pr-12 leading-tight ${themeClasses.title}`}
                        >
                            {movie.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${themeClasses.rating}`}>
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span className={`font-semibold ${themeClasses.title}`}>
                                    {formatRating(movie.vote_average)}
                                </span>
                            </div>

                            <div className={`flex items-center gap-1 ${themeClasses.text}`}>
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">{formatReleaseDate(movie.release_date)}</span>
                            </div>

                            <div className={`flex items-center gap-1 ${themeClasses.text}`}>
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{formatRuntime(movie.runtime)}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {movie.genres.map((genre, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className={`transition-colors ${themeClasses.badge}`}
                                >
                                    {genre}
                                </Badge>
                            ))}
                        </div>

                        <div className="mb-8">
                            <h2 className={`text-lg font-semibold mb-3 ${themeClasses.title}`}>Overview</h2>
                            <p className={`leading-relaxed text-sm lg:text-base ${themeClasses.text}`}>
                                {movie.overview}
                            </p>
                        </div>

                        <Button
                            onClick={() => onViewDetails(movie)}
                            className={`w-full sm:w-auto group font-medium px-6 py-3 transition-all duration-200 hover:shadow-lg ${themeClasses.button}`}
                            size="lg"
                        >
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const MovieReviewModalDemo = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [theme, setTheme] = useState('dark');

    const handleViewDetails = (movie) => {
        console.log('Viewing details for:', movie.title);
        setIsModalOpen(false);
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const demoThemeClasses = {
        background: theme === 'light' ? 'bg-gray-50' : 'bg-background',
        title: theme === 'light' ? 'text-gray-900' : 'text-foreground',
        text: theme === 'light' ? 'text-gray-600' : 'text-muted-foreground',
        button:
            theme === 'light'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground',
    };

    return (
        <div className={`min-h-screen p-8 transition-colors duration-300 ${demoThemeClasses.background}`}>
            <div className="max-w-2xl mx-auto text-center">
                <div className="flex justify-center mb-6">
                    <Button onClick={toggleTheme} variant="outline" size="sm" className="flex items-center gap-2">
                        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        {theme === 'light' ? 'Dark' : 'Light'} Theme
                    </Button>
                </div>

                <h1 className={`text-3xl font-bold mb-4 transition-colors ${demoThemeClasses.title}`}>
                    Movie Review Modal Demo
                </h1>
                <p className={`mb-8 transition-colors ${demoThemeClasses.text}`}>
                    Click the button below to open the movie review modal
                </p>
                <Button onClick={() => setIsModalOpen(true)} size="lg" className={demoThemeClasses.button}>
                    Open Movie Modal
                </Button>
            </div>

            <MovieReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onViewDetails={handleViewDetails}
                theme={theme}
            />
        </div>
    );
};

export default MovieReviewModalDemo;
