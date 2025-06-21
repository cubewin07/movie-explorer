import { useQuery } from '@tanstack/react-query';

import Popular from '@/components/react_components/SideBar/Popular/Popular.jsx';
import LoadingSideBar from '@/components/react_components/SideBar/Popular/LoadingSideBar.jsx';
import axiosInstance from '@/lib/axiosInstance.js';

function PopularTvSeries() {
    const { data: PopularTvSeriesRes, isLoading: LoadingPopularTvSeries } = useQuery({
        queryKey: ['popularTvSeries'],
        queryFn: () => {
            return axiosInstance.get('/tv/popular', {
                params: {
                    language: 'en-US',
                    page: 1,
                },
            });
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });
    const { data: TvSeriesGenresRes, isLoading: LoadingTvSeriesGenre } = useQuery({
        queryKey: ['tvSeriesGenres'],
        queryFn: () => {
            return axiosInstance.get('/genre/tv/list', {
                params: {
                    language: 'en-US',
                },
            });
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

    const TvSeriesGenres = TvSeriesGenresRes?.data?.genres;
    const PopularTvSeries = PopularTvSeriesRes?.data?.results || [];
    const visiblePopularTvSeries = PopularTvSeries.slice(0, 3);

    return (
        <div>
            <h1 className="text-white text-opacity-50 text-lg font-bold mb-3">Popular TV Series</h1>
            {LoadingPopularTvSeries && <LoadingSideBar />}
            {!LoadingPopularTvSeries && !LoadingTvSeriesGenre && (
                <Popular movies={visiblePopularTvSeries} genres={TvSeriesGenres} />
            )}
        </div>
    );
}

export default PopularTvSeries;
