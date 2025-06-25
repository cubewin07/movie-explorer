import { useParams } from 'react-router-dom';
import InfiniteList from '../List';

const typeMap = {
    popular: 'movie/popular',
    top_rated: 'movie/top_rated',
    trending: 'trending/movie/week',
};

function PopularMoviesPage() {
    const { type } = useParams();
    const endpoint = typeMap[type] || 'movie/popular'; // fallback if unknown

    return <InfiniteList url={endpoint} queryKey={`movies-${type}`} type="movies" />;
}

export default PopularMoviesPage;
