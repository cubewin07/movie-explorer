import WatchlistCard from '@/components/ui/WatchlistCard';
import MovieGrid from '@/components/ui/MovieGrid';

/**
 * WatchlistGrid Component
 *
 * Displays films in a responsive grid with staggered entrance animation,
 * delegating layout and motion to the shared {@link MovieGrid} wrapper.
 *
 * @param {Object} props
 * @param {Array<Object>} props.films - Array of film objects to display
 * @param {Function} props.onRemove - Callback function when film is removed from watchlist
 * @returns {JSX.Element}
 */
function WatchlistGrid({ films, onRemove }) {
    return (
        <MovieGrid
            items={films}
            getKey={(item) => item.id}
            columnsClassName="grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
            gapClassName="gap-3 xs:gap-4 sm:gap-5 md:gap-6"
            withExit
        >
            {(item) => (
                <WatchlistCard
                    item={item}
                    onRemove={(film) => onRemove(film)}
                />
            )}
        </MovieGrid>
    );
}

export default WatchlistGrid;
