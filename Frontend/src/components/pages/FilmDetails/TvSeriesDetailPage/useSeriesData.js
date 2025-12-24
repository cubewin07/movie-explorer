import { useTVSeriesDetails, useTVSeriesTrailer, useTvSeriesCredits } from '../../../../hooks/API/data';

export function useSeriesData(id) {
    const { series, isLoading, isError } = useTVSeriesDetails(id);
    const { trailerUrl, isLoadingTrailer } = useTVSeriesTrailer(id);
    const { credits, isLoading: isLoadingCredits, isError: isErrorCredits } = useTvSeriesCredits(id);

    const cast = credits?.cast?.slice(0, 10) || [];
    const crew = credits?.crew?.slice(0, 5) || [];
    const genres = series?.genres?.map((g) => g.name) || [];

    const watchlistData = series && {
        id: series.id,
        name: series.name,
        image: series.poster_path
            ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
            : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(series.name),
        rating: series.vote_average?.toFixed(1),
        year: series.first_air_date?.slice(0, 4),
        totalSeasons: series.number_of_seasons,
        extra: genres,
    };

    return {
        series,
        isLoading,
        isError,
        trailerUrl,
        isLoadingTrailer,
        credits,
        isLoadingCredits,
        isErrorCredits,
        cast,
        crew,
        genres,
        watchlistData,
    };
}
