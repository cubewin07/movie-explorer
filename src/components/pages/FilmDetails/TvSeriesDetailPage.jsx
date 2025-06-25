// TVSeriesDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useTVSeriesDetails, useTVSeriesTrailer } from '@/hooks/API/data';
import { Play, Plus, Share, Heart, Star, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/ui/Loader';

export default function TVSeriesDetailPage() {
    const { id } = useParams();
    const { series, isLoading, isError } = useTVSeriesDetails(id);
    const { trailerUrl, isLoadingTrailer } = useTVSeriesTrailer(id);

    if (isLoading) return <Loader />;
    if (isError || !series) return <div className="p-8 text-red-400">Failed to load series.</div>;

    return (
        <div className="flex-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-y-auto">
            <div className="relative h-[500px] overflow-hidden">
                <img src={series.backdrop} alt={series.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent" />
            </div>

            <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 -mt-48 relative z-10">
                <img
                    src={series.poster}
                    alt={series.title}
                    className="w-60 h-90 rounded-xl object-cover shadow-2xl border border-white dark:border-slate-700"
                />

                <div className="flex-1 space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{series.title}</h1>

                    <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
                        <span>{series.years}</span>
                        <span className="opacity-60">•</span>
                        <span>{series.totalSeasons} Seasons</span>
                        <span className="opacity-60">•</span>
                        <span>{series.totalEpisodes} Episodes</span>
                        <span className="opacity-60">•</span>
                        <Badge className="bg-green-600 text-white">{series.status}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                        <span className="text-lg font-bold">{series.rating}</span>
                        <span className="text-slate-400">/10</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {series.genres.map((g) => (
                            <Badge key={g} className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs">
                                {g}
                            </Badge>
                        ))}
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-3xl">
                        {series.plot}
                    </p>

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
                        <TabsTrigger value="episodes">Episodes</TabsTrigger>
                        <TabsTrigger value="cast">Cast</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="similar">Similar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <p>{series.plot}</p>
                    </TabsContent>

                    <TabsContent value="episodes">
                        <div className="space-y-4">
                            {series.seasons?.map((season) => (
                                <div
                                    key={season.number}
                                    className="collapse collapse-arrow bg-slate-100 dark:bg-slate-800"
                                >
                                    <input type="checkbox" />
                                    <div className="collapse-title font-medium">
                                        Season {season.number} ({season.year})
                                    </div>
                                    <div className="collapse-content">
                                        {season.episodes_list?.map((ep) => (
                                            <div
                                                key={ep.number}
                                                className="p-4 border-b border-slate-200 dark:border-slate-700"
                                            >
                                                <h4 className="font-semibold">
                                                    {ep.number}. {ep.title}
                                                </h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {ep.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="cast">
                        <p>{series.stars?.join(', ')}</p>
                    </TabsContent>

                    <TabsContent value="details">
                        <ul className="text-slate-300 space-y-1">
                            <li>Language: {series.language}</li>
                            <li>Country: {series.country}</li>
                            <li>Network: {series.network}</li>
                            <li>Runtime: {series.runtime} min</li>
                            <li>First Aired: {series.firstAired}</li>
                            <li>Last Aired: {series.lastAired}</li>
                        </ul>
                    </TabsContent>

                    <TabsContent value="similar">
                        <p>Similar shows coming soon.</p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
