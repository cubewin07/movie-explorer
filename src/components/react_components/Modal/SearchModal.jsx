import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, Star, Calendar } from 'lucide-react';
import Image from 'next/image';

export function SearchModal({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);

    const recentSearches = ['Inception', 'The Dark Knight', 'Interstellar'];

    const popularResults = [
        {
            title: 'Pulp Fiction',
            year: '1994',
            rating: '8.9',
            genres: ['Crime', 'Drama'],
            image: '/placeholder.svg?height=120&width=80',
        },
        {
            title: 'The Shawshank Redemption',
            year: '1994',
            rating: '9.3',
            genres: ['Drama'],
            image: '/placeholder.svg?height=120&width=80',
        },
        {
            title: 'The Godfather',
            year: '1972',
            rating: '9.2',
            genres: ['Crime', 'Drama'],
            image: '/placeholder.svg?height=120&width=80',
        },
        {
            title: 'Forrest Gump',
            year: '1994',
            rating: '8.8',
            genres: ['Drama', 'Romance'],
            image: '/placeholder.svg?height=120&width=80',
        },
    ];

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                // Let parent handle open logic
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setShowResults(false);
            const timer = setTimeout(() => setShowResults(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Search Movies & TV Series</h2>
                            <p className="text-sm text-gray-600 mt-1">Discover your next favorite movie or TV series</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Search Input */}
                    <div className="p-6 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search for movies, TV series, actors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 text-base"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Recent Searches */}
                        <div className="p-6 border-b">
                            <div className="flex items-center space-x-2 mb-4">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <h3 className="font-medium text-gray-900">Recent Searches</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((search, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-sm bg-gray-50 border-gray-200 hover:bg-gray-100"
                                        onClick={() => setSearchQuery(search)}
                                    >
                                        {search}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Popular Results */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-gray-900">Popular Results</h3>
                                <span className="text-sm text-blue-600">4 results</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {popularResults.map((movie, index) => (
                                    <div
                                        key={index}
                                        className={`flex space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-300 transform movie-card-hover ${
                                            showResults
                                                ? 'translate-y-0 opacity-100 animate-bounce-in'
                                                : 'translate-y-4 opacity-0'
                                        }`}
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                            animationFillMode: 'both',
                                        }}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <Image
                                                src={movie.image || '/placeholder.svg'}
                                                alt={movie.title}
                                                width={60}
                                                height={90}
                                                className="rounded-md object-cover"
                                            />
                                            <div className="absolute -top-1 -right-1 bg-black text-white px-1.5 py-0.5 rounded text-xs flex items-center">
                                                <Star className="w-2.5 h-2.5 text-yellow-400 fill-current mr-0.5" />
                                                {movie.rating}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">{movie.title}</h4>
                                            <div className="flex items-center space-x-1 mt-1 text-sm text-gray-600">
                                                <Calendar className="w-3 h-3" />
                                                <span>{movie.year}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {movie.genres.map((genre, genreIndex) => (
                                                    <span
                                                        key={genreIndex}
                                                        className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                    >
                                                        {genre}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
