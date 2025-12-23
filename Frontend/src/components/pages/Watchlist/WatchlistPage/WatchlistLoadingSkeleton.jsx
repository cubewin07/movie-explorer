import LoadingState from '@/components/ui/LoadingState';
import SkeletonCard from '@/components/ui/skeletonCard';

/**
 * WatchlistLoadingSkeleton Component
 * 
 * Displays skeleton cards while watchlist data is being fetched.
 * Provides visual feedback during loading states.
 */
function WatchlistLoadingSkeleton() {
    return (
        <div className="px-2 sm:px-4 md:px-8 py-8">
            <LoadingState
                title="Loading Your Watchlist"
                subtitle="Fetching your favorite movies and TV shows..."
                fullScreen={false}
                transparentBg={true}
                className="!h-auto !min-h-0 !bg-transparent mb-8"
            />
            
            {/* Skeleton Cards Grid */}
            <div className="max-w-screen-xl mx-auto">
                <div className="grid gap-3 xs:gap-4 sm:gap-5 md:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {[...Array(12)].map((_, i) => (
                        <SkeletonCard
                            key={i}
                            delay={i}
                            variant="movie"
                            animation="shimmer"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WatchlistLoadingSkeleton;
