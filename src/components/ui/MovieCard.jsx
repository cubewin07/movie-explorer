import { Star, Calendar, Film, Tv, Badge } from 'lucide-react';

function MovieCard({ title, year, rating, genres = [], image, onClick, type }) {
    return (
        <div
            onClick={onClick}
            className="group flex gap-4 items-start cursor-pointer hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-blue-100 hover:shadow-lg"
        >
            <div className="relative w-16 h-24 flex-shrink-0">
                <img
                    src={image || '/placeholder.svg?height=96&width=64'}
                    alt={title}
                    className="w-full h-full object-cover rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                />
                {rating && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg">
                        <Star className="w-3 h-3 fill-current mr-1" />
                        {rating}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start gap-2">
                    <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
                        {title}
                    </h4>
                </div>
                {year && (
                    <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                        {year}
                    </div>
                )}
                {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {genres.slice(0, 3).map((genre, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                                {genre}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MovieCard;
