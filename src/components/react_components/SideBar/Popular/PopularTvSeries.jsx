import { usePopularTvSeries } from '@/hooks/API/data';
import { useTvSeriesGenres } from '@/hooks/API/genres';

import Popular from '@/components/react_components/SideBar/Popular/Popular.jsx';
import LoadingSideBar from '@/components/react_components/SideBar/Popular/LoadingSideBar.jsx';

function PopularTvSeries() {
    const { popularTvSeries, LoadingPopularTvSeries, isError } = usePopularTvSeries(1);
    const { TvSeriesGenresRes, isTvSeriesGenreLoading: LoadingTvSeriesGenre } = useTvSeriesGenres();

    const TvSeriesGenres = TvSeriesGenresRes?.data?.genres;
    const PopularTvSeries = popularTvSeries?.results || [];
    const visiblePopularTvSeries = PopularTvSeries.slice(0, 3);

    return (
        <div>
            <h1 className="text-white text-opacity-50 text-lg font-bold mb-3">Popular TV Series</h1>
            {isError ? (
                <div className="text-red-500 font-semibold p-4">
                    Failed to load popular TV series. Please try again later.
                </div>
            ) : LoadingPopularTvSeries ? (
                <LoadingSideBar />
            ) : (
                !LoadingTvSeriesGenre && <Popular movies={visiblePopularTvSeries} genres={TvSeriesGenres} />
            )}
        </div>
    );
}

export default PopularTvSeries;
