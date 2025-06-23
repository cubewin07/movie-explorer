import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Globe, X, Eye } from 'lucide-react';
import { FilmModalContext } from '@/context/FilmModalProvider';

export default function MovieReviewModalDemo({
    name = 'Unknown Title',
    original_name,
    first_air_date,
    genres = [],
    poster_path,
    vote_average = 0,
    vote_count = 0,
    overview = 'No overview available.',
    original_language,
}) {
    const { setIsOpen: toggleModal } = useContext(FilmModalContext);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-xl">
                <CardContent className="p-6 relative">
                    {/* Close Button */}
                    <div className="absolute top-4 right-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleModal(false)}
                            className="border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Poster */}
                        <div className="flex-shrink-0">
                            <div className="relative w-48 h-72 mx-auto lg:mx-0 rounded-lg overflow-hidden shadow-lg">
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${poster_path}`}
                                    alt={`${name} poster`}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{name}</h1>
                                {original_name && original_name !== name && (
                                    <p className="text-lg text-gray-500 dark:text-gray-400">{original_name}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                                {first_air_date && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(first_air_date).getFullYear()}</span>
                                    </div>
                                )}
                                {original_language && (
                                    <div className="flex items-center gap-1">
                                        <Globe className="h-4 w-4" />
                                        <span>{original_language.toUpperCase()}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{vote_average.toFixed(1)}/10</span>
                                    <span className="text-xs">({vote_count} votes)</span>
                                </div>
                            </div>

                            {/* Genres */}
                            <div className="flex flex-wrap gap-2">
                                {genres.map((genre) => (
                                    <Badge
                                        key={genre}
                                        variant="secondary"
                                        className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                                    >
                                        {genre}
                                    </Badge>
                                ))}
                            </div>

                            {/* Overview */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                                <p className="leading-relaxed text-sm text-gray-700 dark:text-gray-300">{overview}</p>
                            </div>

                            {/* View Details Button */}
                            <div className="pt-4">
                                <Button size="lg" className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white">
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
