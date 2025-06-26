import { useQuery } from '@tanstack/react-query';
import { useAuthen } from '@/context/AuthenProvider';
import useWatchlist from '@/hooks/watchList/useWatchList';
import { useNavigate } from 'react-router-dom';

function WatchlistPage() {
    const { user } = useAuthen();
    const navigate = useNavigate();

    const {
        data: watchlist,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['watchlist', user?.email],
        queryFn: () => useWatchlist(user.email),
        enabled: !!user,
    });

    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold">You must be logged in to view your watchlist.</h2>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => navigate('/')}>
                    Go Home
                </button>
            </div>
        );
    }

    if (isLoading) return <div className="text-center py-20">Loading...</div>;
    if (isError) return <div className="text-center py-20">Error loading watchlist.</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Your Watchlist</h1>
            {watchlist.length === 0 ? (
                <p className="text-muted-foreground">You haven’t added any movies to your watchlist yet.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {watchlist.map((movie) => (
                        <div
                            key={movie.id}
                            className="rounded overflow-hidden shadow hover:shadow-md transition duration-200 cursor-pointer"
                            onClick={() => navigate(`/movie/${movie.id}`)}
                        >
                            <img
                                src={movie.poster || '/placeholder.svg'}
                                alt={movie.title}
                                className="w-full h-60 object-cover"
                            />
                            <div className="p-3">
                                <h3 className="text-lg font-semibold truncate">{movie.title}</h3>
                                <p className="text-sm text-muted-foreground">{movie.year}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WatchlistPage;
