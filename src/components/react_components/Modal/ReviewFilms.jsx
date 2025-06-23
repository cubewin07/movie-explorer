import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Globe, X, Eye, Clock } from 'lucide-react';
import { FilmModalContext } from '@/context/FilmModalProvider';

// Example genre color map
const genreColorMap = {
    Action: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Drama: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Mystery: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    Horror: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100',
    Thriller: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100',
    SciFi: 'bg-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
    Comedy: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100',
};

export default function MovieReviewModal({
    name = 'Unknown Title',
    original_name,
    first_air_date,
    genres = [],
    poster_path,
    vote_average = 0,
    vote_count = 0,
    overview = 'No overview available.',
    original_language,
    runtime, // optional
}) {
    const { setIsOpen } = useContext(FilmModalContext);

    const posterUrl = poster_path
        ? `https://image.tmdb.org/t/p/w500${poster_path}`
        : '/placeholder.svg?height=400&width=300';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background border border-border text-foreground shadow-2xl">
                <CardContent className="p-6 relative">
                    {/* Close Button */}
                    <div className="absolute top-4 right-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="text-muted-foreground hover:bg-muted"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Poster */}
                        <div className="flex-shrink-0">
                            <img
                                src={posterUrl}
                                alt={`${name} poster`}
                                className="w-48 h-72 mx-auto lg:mx-0 rounded-xl object-cover shadow-md"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            {/* Title */}
                            <div>
                                <h1 className="text-3xl font-bold">{name}</h1>
                                {original_name && original_name !== name && (
                                    <p className="text-base text-muted-foreground">{original_name}</p>
                                )}
                            </div>

                            {/* Meta */}
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

                            {/* Genres */}
                            <div className="flex flex-wrap gap-2">
                                {genres.map((genre) => (
                                    <span
                                        key={genre}
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${genreColorMap[genre] || 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>

                            {/* Overview */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{overview}</p>
                            </div>

                            {/* CTA */}
                            <div className="pt-4">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
