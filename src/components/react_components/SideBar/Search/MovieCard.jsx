import { Star, Calendar } from 'lucide-react';

function MovieCard({ title, year, rating, genres = [], image, onClick }) {
    return (
        <div
            onClick={onClick}
            className="flex gap-4 items-start cursor-pointer hover:bg-gray-100 p-3 rounded-lg transition group"
        >
            {/* Poster */}
            <div className="relative w-20 h-28 flex-shrink-0">
                <img
                    src={image || '/placeholder.svg'}
                    alt={title}
                    className="w-full h-full object-cover rounded-md bg-gray-100 group-hover:shadow-md transition"
                />
                <div className="absolute -top-1 -left-1 bg-black text-white px-2 py-0.5 rounded text-sm flex items-center shadow">
                    <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                    {rating}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{title}</h4>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {year}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {genres.map((genre, i) => (
                        <span
                            key={i}
                            className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium"
                        >
                            {genre}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MovieCard;
