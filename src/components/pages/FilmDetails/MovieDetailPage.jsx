import { useState } from 'react';
import { Play, Plus, Share, Heart, Star, Clock, Calendar, Users, Award, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const movieData = {
    id: 1,
    title: 'The Dark Knight',
    year: 2008,
    runtime: 152,
    rating: 9.0,
    imdbRating: 9.0,
    rottenTomatoes: 94,
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    director: 'Christopher Nolan',
    writers: ['Jonathan Nolan', 'Christopher Nolan'],
    stars: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    plot: 'When the menace known as the Joker wreaks havoc...',
    poster: '/placeholder.svg?height=600&width=400',
    backdrop: '/placeholder.svg?height=400&width=1200',
    trailer: 'https://example.com/trailer',
    budget: '$185 million',
    boxOffice: '$1.005 billion',
    language: 'English',
    country: 'USA, UK',
    releaseDate: 'July 18, 2008',
    mpaaRating: 'PG-13',
    awards: ['Academy Award Winner', 'BAFTA Winner', 'Golden Globe Nominee'],
    cast: [],
    crew: [],
    reviews: [],
    similarMovies: [],
};

export default function MovieDetailPage() {
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = [movieData.backdrop, '/placeholder.svg?height=400&width=1200'];
    const nextImage = () => setCurrentImageIndex((i) => (i + 1) % images.length);
    const prevImage = () => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);

    return (
        <div className="flex-1 bg-slate-950 text-white overflow-y-auto">
            <div className="relative">
                <div className="relative h-96 overflow-hidden">
                    <img src={images[currentImageIndex]} alt={movieData.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                    {images.length > 1 && (
                        <>
                            <Button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <Button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentImageIndex(i)}
                                        className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex gap-8">
                        <img
                            src={movieData.poster}
                            alt={movieData.title}
                            className="w-64 h-96 rounded-lg object-cover shadow-2xl"
                        />
                        <div className="flex-1 space-y-4">
                            <h1 className="text-5xl font-bold">{movieData.title}</h1>
                            <div className="flex gap-4 text-slate-300">
                                <span>{movieData.year}</span>
                                <span>•</span>
                                <span>{movieData.mpaaRating}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{movieData.runtime} min</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                                    <span className="text-2xl font-bold">{movieData.rating}</span>
                                    <span className="text-slate-400">/10</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500 font-bold">RT</span>
                                    <span className="text-xl font-bold">{movieData.rottenTomatoes}%</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {movieData.genres.map((g) => (
                                    <Badge key={g} className="bg-blue-600 text-white">
                                        {g}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">{movieData.plot}</p>
                            <div className="flex gap-3 pt-4">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                                    <Play className="w-5 h-5 mr-2" /> Watch Now
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

            <div className="p-8">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-slate-800">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="similar">Similar</TabsTrigger>
                    </TabsList>
                    {/* Tab Content Goes Here (reuse same layout and optimize where needed) */}
                </Tabs>
            </div>
        </div>
    );
}
