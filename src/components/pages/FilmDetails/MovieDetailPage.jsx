// MovieDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useMovieDetails, useMovieTrailer } from '@/hooks/API/data';
import { Play, Plus, Share, Heart, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MovieDetailPage() {
    const { id } = useParams();
    const { movie, isLoading, error } = useMovieDetails(id);
    const { trailerUrl, isLoadingTrailer } = useMovieTrailer(id);

    if (isLoading) return <div className="p-8 text-white">Loading...</div>;
    if (error || !movie) return <div className="p-8 text-red-400">Failed to load movie.</div>;

    return (
        <div className="flex-1 bg-slate-950 text-white overflow-y-auto">
            <div className="relative h-[500px] overflow-hidden">
                <img
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            </div>

            <div className="p-8 flex flex-col md:flex-row gap-8 -mt-48 relative z-10">
                <img
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt={movie.title}
                    className="w-60 h-90 rounded-lg object-cover shadow-2xl"
                />

                <div className="flex-1 space-y-4">
                    <h1 className="text-4xl font-bold">{movie.title}</h1>
                    <div className="flex gap-4 text-slate-300 text-sm">
                        <span>{movie.release_date?.slice(0, 4)}</span>
                        <span>•</span>
                        <span>{movie.runtime} min</span>
                        <span>•</span>
                        <span>{movie.original_language?.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                        <span className="text-lg font-semibold">{movie.vote_average?.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {movie.genres.map((g) => (
                            <Badge key={g.id} className="bg-blue-600 text-white">
                                {g.name}
                            </Badge>
                        ))}
                    </div>
                    <p className="text-slate-300 text-base leading-relaxed max-w-3xl">{movie.overview}</p>

                    <div className="flex gap-3 pt-4">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                            onClick={() => window.open(trailerUrl, '_blank')}
                            disabled={!trailerUrl || isLoadingTrailer}
                        >
                            <Play className="w-4 h-4 mr-2" /> Watch Trailer
                        </Button>
                        <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-6 py-2">
                            <Plus className="w-4 h-4 mr-2" /> Add to Watchlist
                        </Button>
                        <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-6 py-2">
                            <Share className="w-4 h-4 mr-2" /> Share
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <Tabs defaultValue="overview">
                    <TabsList className="grid grid-cols-3 md:grid-cols-5 bg-slate-800">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="cast">Cast</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="similar">Similar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <p>{movie.overview}</p>
                    </TabsContent>
                    <TabsContent value="cast">
                        <p>Cast info here (future feature).</p>
                    </TabsContent>
                    <TabsContent value="reviews">
                        <p>Reviews placeholder.</p>
                    </TabsContent>
                    <TabsContent value="details">
                        <ul className="text-slate-300 space-y-1">
                            <li>Budget: ${movie.budget?.toLocaleString()}</li>
                            <li>Revenue: ${movie.revenue?.toLocaleString()}</li>
                            <li>Language: {movie.original_language?.toUpperCase()}</li>
                            <li>Release Date: {movie.release_date}</li>
                        </ul>
                    </TabsContent>
                    <TabsContent value="similar">
                        <p>Similar movies coming soon.</p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
