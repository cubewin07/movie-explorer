import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Globe, X, Eye } from 'lucide-react';
import Image from 'next/image';

const genreMap = {
    18: 'Drama',
    10751: 'Family',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    10759: 'Action & Adventure',
};

export default function MovieReviewModalDemo({
    name = 'Unknown Title',
    original_name,
    first_air_date,
    genre_ids = [],
    poster_path,
    vote_average = 0,
    vote_count = 0,
    overview = 'No overview available.',
    original_language,
    onClose,
}) {
    const posterUrl = poster_path
        ? `https://image.tmdb.org/t/p/w500${poster_path}`
        : '/placeholder.svg?height=400&width=300';

    const genres = genre_ids.map((id) => genreMap[id]).filter(Boolean);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background border-border text-foreground">
                <CardContent className="p-6 relative">
                    {/* Close Button */}
                    <div className="absolute top-4 right-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="bg-background/80 border-border text-foreground hover:bg-background"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Poster */}
                        <div className="flex-shrink-0">
                            <div className="relative w-48 h-72 mx-auto lg:mx-0 rounded-lg overflow-hidden shadow-lg">
                                <Image src={posterUrl} alt={`${name} poster`} fill className="object-cover" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{name}</h1>
                                {original_name && original_name !== name && (
                                    <p className="text-lg text-muted-foreground">{original_name}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                                    <Badge key={genre} variant="secondary">
                                        {genre}
                                    </Badge>
                                ))}
                            </div>

                            {/* Overview */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                                <p className="leading-relaxed text-sm">{overview}</p>
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
