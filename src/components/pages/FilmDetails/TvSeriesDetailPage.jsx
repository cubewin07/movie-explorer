// components/TVSeriesDetailPage.jsx

import React, { useState } from 'react';
import { Play, Plus, Share, Heart, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TVSeriesDetailPage({ seriesData }) {
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(1);

    return (
        <div className="flex-1 bg-slate-950 text-white overflow-y-auto">
            <div className="relative">
                <div className="relative h-96 overflow-hidden">
                    <img src={seriesData.backdrop} alt={seriesData.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex gap-8">
                        <div className="flex-shrink-0">
                            <img
                                src={seriesData.poster}
                                alt={seriesData.title}
                                className="w-64 h-96 rounded-lg object-cover shadow-2xl"
                            />
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-5xl font-bold mb-2">{seriesData.title}</h1>
                                <div className="flex items-center gap-4 text-slate-300">
                                    <span>{seriesData.years}</span>
                                    <span>•</span>
                                    <span>{seriesData.totalSeasons} Seasons</span>
                                    <span>•</span>
                                    <span>{seriesData.totalEpisodes} Episodes</span>
                                    <span>•</span>
                                    <Badge variant="secondary" className="bg-green-600">
                                        {seriesData.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                                    <span className="text-2xl font-bold">{seriesData.rating}</span>
                                    <span className="text-slate-400">/10</span>
                                </div>
                                {seriesData.rottenTomatoes && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-500 font-bold">RT</span>
                                        <span className="text-xl font-bold">{seriesData.rottenTomatoes}%</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {seriesData.genres?.map((genre) => (
                                    <Badge key={genre} variant="secondary" className="bg-blue-600 text-white">
                                        {genre}
                                    </Badge>
                                ))}
                            </div>

                            <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">{seriesData.plot}</p>

                            <div className="flex gap-3 pt-4">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                                    <Play className="w-5 h-5 mr-2" />
                                    Watch Now
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-slate-600 text-white hover:bg-slate-800 px-6 py-3"
                                    onClick={() => setIsInWatchlist(!isInWatchlist)}
                                >
                                    {isInWatchlist ? (
                                        <>
                                            <Heart className="w-5 h-5 mr-2 fill-red-500 text-red-500" /> In Watchlist
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5 mr-2" /> Add to Watchlist
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-slate-600 text-white hover:bg-slate-800 px-6 py-3"
                                >
                                    <Share className="w-5 h-5 mr-2" /> Share
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="p-8">
                <Tabs defaultValue="episodes" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-slate-800">
                        <TabsTrigger value="episodes">Episodes</TabsTrigger>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="similar">Similar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="episodes" className="space-y-6 mt-8">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {seriesData.seasons?.map((season) => (
                                <Button
                                    key={season.number}
                                    variant={selectedSeason === season.number ? 'default' : 'outline'}
                                    className={selectedSeason === season.number ? 'bg-blue-600' : 'border-slate-600'}
                                    onClick={() => setSelectedSeason(season.number)}
                                >
                                    Season {season.number}
                                </Button>
                            ))}
                        </div>

                        {/* Episodes */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src={seriesData.seasons[selectedSeason - 1]?.poster}
                                    alt={`Season ${selectedSeason}`}
                                    className="w-24 h-36 rounded object-cover"
                                />
                                <div>
                                    <h3 className="text-2xl font-bold">Season {selectedSeason}</h3>
                                    <p className="text-slate-400">
                                        {seriesData.seasons[selectedSeason - 1]?.episodes} Episodes •{' '}
                                        {seriesData.seasons[selectedSeason - 1]?.year}
                                    </p>
                                </div>
                            </div>
                            {seriesData.seasons[selectedSeason - 1]?.episodes_list?.length > 0 ? (
                                <div className="space-y-3">
                                    {seriesData.seasons[selectedSeason - 1].episodes_list.map((ep) => (
                                        <div
                                            key={ep.number}
                                            className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 cursor-pointer transition-colors"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-32 h-20 bg-slate-700 rounded flex items-center justify-center text-slate-400">
                                                    <Play className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-lg">
                                                                {ep.number}. {ep.title}
                                                            </h4>
                                                            <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                                                <span>{ep.runtime} min</span>
                                                                <span>•</span>
                                                                <span>{ep.airDate}</span>
                                                                <span>•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                                                    <span>{ep.rating}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-300 mt-2">{ep.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <p>Episode details not available for this season</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="overview" className="space-y-8 mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold">Creator</h3>
                                <p className="text-slate-300">{seriesData.creators?.join(', ')}</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">Network</h3>
                                <p className="text-slate-300">{seriesData.network}</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">Stars</h3>
                                <p className="text-slate-300">{seriesData.stars?.join(', ')}</p>
                            </div>
                        </div>

                        {seriesData.awards?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <Award className="w-5 h-5" /> Awards & Recognition
                                </h3>
                                <div className="flex gap-2">
                                    {seriesData.awards.map((award, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="border-yellow-500 text-yellow-500"
                                        >
                                            {award}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="cast" className="space-y-8 mt-8">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-semibold">Main Cast</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {seriesData.cast?.map((actor, index) => (
                                    <div key={index} className="text-center space-y-2">
                                        <img
                                            src={actor.image}
                                            alt={actor.name}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <div>
                                            <p className="font-medium text-white">{actor.name}</p>
                                            <p className="text-sm text-slate-400">{actor.character}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-6 mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="font-semibold">First Aired</h4>
                                    <p className="text-slate-300">{seriesData.firstAired}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Last Aired</h4>
                                    <p className="text-slate-300">{seriesData.lastAired}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Runtime</h4>
                                    <p className="text-slate-300">{seriesData.runtime} minutes per episode</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Language</h4>
                                    <p className="text-slate-300">{seriesData.language}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Network</h4>
                                    <p className="text-slate-300">{seriesData.network}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Country</h4>
                                    <p className="text-slate-300">{seriesData.country}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Total Seasons</h4>
                                    <p className="text-slate-300">{seriesData.totalSeasons}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Total Episodes</h4>
                                    <p className="text-slate-300">{seriesData.totalEpisodes}</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="similar" className="space-y-6 mt-8">
                        <h3 className="text-2xl font-semibold">Similar TV Series</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {seriesData.similarShows?.map((show, index) => (
                                <div key={index} className="group cursor-pointer">
                                    <div className="relative overflow-hidden rounded-lg">
                                        <img
                                            src={show.poster}
                                            alt={show.title}
                                            className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1 flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                            <span className="text-white text-xs font-medium">{show.rating}</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <h4 className="font-medium truncate">{show.title}</h4>
                                        <p className="text-slate-400 text-sm">{show.year}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
