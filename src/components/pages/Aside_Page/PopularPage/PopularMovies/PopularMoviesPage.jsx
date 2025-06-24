import { useSearchParams } from 'react-router-dom';
import List from '../List';

function PopularMoviesPage() {
    const [searchPage, setSearchPage] = useSearchParams();
    const page = Number(searchPage.get('page')) || 1;

    const handleSetPage = (newPage) => {
        setSearchPage({ page: newPage });
    };
    return (
        <div>
            <List url="movie/popular" page={page} />
        </div>
    );
}

export default PopularMoviesPage;
