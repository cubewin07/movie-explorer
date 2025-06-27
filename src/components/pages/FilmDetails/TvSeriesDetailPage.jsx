import { useParams } from 'react-router-dom';
import { Play, Plus, Share, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

import { useTVSeriesDetails, useTVSeriesTrailer } from '@/hooks/API/data';
import { useAuthen } from '@/context/AuthenProvider';
import useAddToWatchlist from '@/hooks/watchList/useAddtoWatchList';
import SeasonAccordion from './SeasonAccordion';

export default function TVSeriesDetailPage() {
    const { id } = useParams();
    const { user } = useAuthen();
    const { series, isLoading, isError } = useTVSeriesDetails(id);
    const { trailerUrl, isLoadingTrailer } = useTVSeriesTrailer(id);

    const genres = series?.genres?.map((g) => g.name) || [];
    const watchlistData = series && {
        id: series.id,
        name: series.name,
        image: series.poster_path
            ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
            : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(series.name),
        rating: series.vote_average?.toFixed(1),
        year: series.first_air_date?.slice(0, 4),
        totalSeasons: series.number_of_seasons,
        extra: genres,
    };

    const { mutate: addToWatchlist, isPending } = useAddToWatchlist();

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-32 rounded-lg" />
                ))}
            </div>
        );
    }

    if (isError || !series) return <div className="p-8 text-red-500">Failed to load series.</div>;

    return (
        <div className="flex-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-y-auto">
            {/* Backdrop */}
            <div className="relative h-[500px] overflow-hidden">
                <img
                    src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`}
                    alt={series.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent" />
            </div>

            {/* Poster + Info */}
            <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 -mt-48 relative z-10">
                <img
                    src={`https://image.tmdb.org/t/p/w342${series.poster_path}`}
                    alt={series.name}
                    className="w-60 h-90 rounded-xl object-cover shadow-2xl border border-white dark:border-slate-700"
                />

                <div className="flex-1 space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{series.name}</h1>

                    <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
                        <span>
                            {series.first_air_date?.slice(0, 4)} - {series.last_air_date?.slice(0, 4)}
                        </span>
                        <span className="opacity-60">•</span>
                        <span>{series.number_of_seasons} Seasons</span>
                        <span className="opacity-60">•</span>
                        <span>{series.number_of_episodes} Episodes</span>
                        <span className="opacity-60">•</span>
                        <Badge className="bg-green-600 text-white">{series.status}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                        <span className="text-lg font-bold">{series.vote_average?.toFixed(1)}</span>
                        <span className="text-slate-400">/10</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {series?.genres?.map((g) => (
                            <Badge key={g.id} className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs">
                                {g.name}
                            </Badge>
                        ))}
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-3xl">
                        {series.overview}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-4">
                        <Button
                            className="bg-blue-600 hover:scale-105 transition-transform duration-200 ease-in-out hover:bg-blue-700 text-white px-6 py-2 text-sm sm:text-base"
                            onClick={() => window.open(trailerUrl, '_blank')}
                            disabled={!trailerUrl || isLoadingTrailer}
                        >
                            <Play className="w-4 h-4 mr-2" /> Watch Trailer
                        </Button>

                        <Button
                            variant="outline"
                            className="bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:bg-transparent dark:text-white dark:border-slate-600 dark:hover:bg-slate-800"
                            onClick={() => addToWatchlist(watchlistData)}
                            disabled={isPending}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add to Watchlist
                        </Button>

                        <Button
                            variant="outline"
                            className="bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:bg-transparent dark:text-white dark:border-slate-600 dark:hover:bg-slate-800"
                        >
                            <Share className="w-4 h-4 mr-2" /> Share
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="p-6 sm:p-8">
                <Tabs defaultValue="overview">
                    <TabsList className="grid grid-cols-3 md:grid-cols-5 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="episodes">Episodes</TabsTrigger>
                        <TabsTrigger value="cast">Cast</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="similar">Similar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                            {series.overview}
                        </p>
                    </TabsContent>

                    <TabsContent value="episodes">
                        <div className="space-y-4">
                            {series.seasons?.map((season) => (
                                <SeasonAccordion
                                    key={season.id}
                                    tvId={series.id}
                                    seasonNumber={season.season_number}
                                    season={season}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="cast">
                        <p className="text-slate-600 dark:text-slate-300">
                            {series.credits?.cast
                                ?.slice(0, 10)
                                .map((c) => c.name)
                                .join(', ') || 'No cast info'}
                        </p>
                    </TabsContent>

                    <TabsContent value="details">
                        <ul className="text-slate-600 dark:text-slate-300 space-y-1">
                            <li>Language: {series.original_language?.toUpperCase()}</li>
                            <li>Country: {series.origin_country?.join(', ')}</li>
                            <li>Runtime: {series.episode_run_time?.[0] || 0} min</li>
                            <li>First Aired: {series.first_air_date}</li>
                            <li>Last Aired: {series.last_air_date}</li>
                        </ul>
                    </TabsContent>

                    <TabsContent value="similar">
                        <p className="text-slate-600 dark:text-slate-300">Similar shows coming soon.</p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
