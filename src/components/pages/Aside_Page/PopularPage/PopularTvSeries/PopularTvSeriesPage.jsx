import InfiniteList from '../List';

function PopularTvSeriesPage() {
    return <InfiniteList url="movie/popular" key="moviePopular-infinite" type="movies" />;
}

export default PopularTvSeriesPage;
