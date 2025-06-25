import { useParams } from 'react-router-dom';
import InfiniteList from '../List';
import Breadcrumb from '@/components/pages/Discovery/Breadcrumb';
const typeMap = {
    popular: 'movie/popular',
    top_rated: 'movie/top_rated',
    trending: 'trending/movie/week',
};

function PopularMoviesPage() {
    const { type } = useParams();
    const endpoint = typeMap[type] || 'movie/popular';

    const breadcrumbItems = [
        { name: 'Home', to: '/' },
        { name: 'Movies', to: '/movies' },
        { name: type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()), to: `/movie/${type}` },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <Breadcrumb items={breadcrumbItems} />
            <InfiniteList url={endpoint} queryKey={`movies-${type}`} type="movies" />
        </div>
    );
}

export default PopularMoviesPage;
