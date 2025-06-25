import { useParams } from 'react-router-dom';
import InfiniteList from '../List';

const typeMap = {
    popular: 'tv/popular',
    top_rated: 'tv/top_rated',
    trending: 'trending/tv/week',
};

function PopularTvSeriesPage() {
    const { type } = useParams();
    const endpoint = typeMap[type] || 'tv/popular';

    return <InfiniteList url={endpoint} queryKey={`tv-${type}`} type="tvseries" />;
}

export default PopularTvSeriesPage;
