import { useSearchParams } from 'react-router-dom';
import InfiniteList from '../List';
import { usePaginatedFetch, usePopularMovies } from '@/hooks/API/data';

function PopularMoviesPage() {
    return <InfiniteList url="movie/popular" key="moviePopular-infinite" />;
}

export default PopularMoviesPage;
