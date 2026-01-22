import { useMemo } from 'react';
import { usePaginatedFetch } from '@/hooks/API/data';
import { useTvSeriesGenres } from '@/hooks/API/genres';

export const useUpcomingTVSeries = () => {
    const today = new Date().toISOString().split('T')[0];
    const { data: upcomingTVData, isLoading: isLoadingUpcomingTV, error: tvError } = usePaginatedFetch(
        `discover/tv?first_air_date.gte=${today}&sort_by=first_air_date.asc`,
        1,
    );
    const { TvSeriesGenresRes } = useTvSeriesGenres();

    const tvGenreMap = useMemo(() => {
        return (
            TvSeriesGenresRes?.data?.genres?.reduce((acc, g) => {
                acc[g.id] = g.name;
                return acc;
            }, {}) || {}
        );
    }, [TvSeriesGenresRes]);

    const upcomingTVShows = useMemo(() => {
        return upcomingTVData?.results || [];
    }, [upcomingTVData]);

    return {
        upcomingTVShows,
        isLoadingUpcomingTV,
        tvError,
        tvGenreMap,
    };
};
