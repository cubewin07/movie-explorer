import { useAuthen } from '@/context/AuthenProvider';
import { useNavigate } from 'react-router-dom';
import useWatchlist from '@/hooks/watchList/useWatchList';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

function WatchlistPage() {
    const { user } = useAuthen();
    const navigate = useNavigate();

    const { data: watchlist = [], isLoading, isError } = useWatchlist(user?.email || 'guest'); // you can change key to `user?.id` later

    if (!user) {
        return (
            <div className="text-center py-10">
                <p className="text-lg text-muted-foreground mb-4">Please log in to view your watchlist.</p>
                <Button onClick={() => navigate('/')}>Go Home</Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader className="animate-spin w-6 h-6 text-blue-500" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">Failed to load your watchlist. Please try again later.</p>
            </div>
        );
    }

    return (
        <section className="px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Your Watchlist</h1>
            {watchlist.length === 0 ? (
                <p className="text-muted-foreground">You haven’t added anything yet.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {watchlist.map((movie) => (
                        <div key={movie.id} className="bg-card border rounded-lg shadow p-2">
                            <img
                                src={movie.image || '/placeholder.svg'}
                                alt={movie.title}
                                className="rounded-md mb-2 w-full h-48 object-cover"
                            />
                            <h3 className="text-sm font-semibold truncate">{movie.title}</h3>
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 text-xs"
                                onClick={() => console.log('Remove feature coming soon')}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default WatchlistPage;
