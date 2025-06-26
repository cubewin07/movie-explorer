import { useParams } from 'react-router-dom';
import InfiniteList from '../List';
import Breadcrumb from '@/components/pages/Discovery/Breadcrumb';
const typeMap = {
    popular: 'tv/popular',
    top_rated: 'tv/top_rated',
    trending: 'trending/tv/week',
};

function PopularTvSeriesPage() {
    const { type } = useParams();
    const endpoint = typeMap[type] || 'tv/popular';
    console.log(type);

    const breadcrumbItems = [
        { name: 'Home', to: '/' },
        { name: 'TV Series', to: '/tvseries' },
        { name: type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()), to: `/tvseries/${type}` },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <Breadcrumb items={breadcrumbItems} />
            <InfiniteList url={endpoint} queryKey={`tv-${type}`} type="tvseries" />
        </div>
    );
}

export default PopularTvSeriesPage;
