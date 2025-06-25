// MovieDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useMovieDetails, useMovieTrailer } from '@/hooks/API/data';
import { Play, Plus, Share, Heart, Star, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/ui/Loader';

export default function MovieDetailPage() {
    const { id } = useParams();
    const { movie, isLoading, isError } = useMovieDetails(id);
    const { trailerUrl, isLoadingTrailer } = useMovieTrailer(id);

    if (isLoading) return <Loader />;
    if (isError || !movie) return <div className="p-8 text-red-400">Failed to load movie.</div>;

    return (
        <div className="flex-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-y-auto">
            {/* Backdrop */}
            <div className="relative h-[500px] overflow-hidden">
                <img
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent" />
            </div>

            {/* Poster + Info */}
            <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 -mt-48 relative z-10">
                <img
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt={movie.title}
                    className="w-60 h-90 rounded-xl object-cover shadow-2xl border border-white dark:border-slate-700"
                />

                <div className="flex-1 space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{movie.title}</h1>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{movie.release_date?.slice(0, 4)}</span>
                        </div>
                        <span className="opacity-60">•</span>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{movie.runtime} min</span>
                        </div>
                        <span className="opacity-60">•</span>
                        <div className="flex items-center gap-1 uppercase tracking-wide">
                            <span>{movie.original_language}</span>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                        <span className="text-lg font-bold">{movie.vote_average?.toFixed(1)}</span>
                        <span className="text-slate-400">/10</span>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2">
                        {movie.genres.map((g) => (
                            <Badge key={g.id} className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs">
                                {g.name}
                            </Badge>
                        ))}
                    </div>

                    {/* Overview */}
                    <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-3xl">
                        {movie.overview}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm sm:text-base"
                            onClick={() => window.open(trailerUrl, '_blank')}
                            disabled={!trailerUrl || isLoadingTrailer}
                        >
                            <Play className="w-4 h-4 mr-2" /> Watch Trailer
                        </Button>

                        <Button
                            variant="outline"
                            className="border-slate-400 dark:border-slate-600 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-2 text-sm sm:text-base"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add to Watchlist
                        </Button>

                        <Button
                            variant="outline"
                            className="border-slate-400 dark:border-slate-600 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-2 text-sm sm:text-base"
                        >
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
