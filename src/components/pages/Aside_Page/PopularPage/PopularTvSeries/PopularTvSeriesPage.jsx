import InfiniteList from '../List';

function PopularTvSeriesPage() {
    return <InfiniteList url="tv/popular" queryKey="PopularTvSeries-infinite" type="Tv series" />;
}

export default PopularTvSeriesPage;
