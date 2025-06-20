import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import LoadingSideBar from "./LoadingSideBar";

function PopularMovies() {
    const {data: popularMovies, isLoading: isPopularMoviesLoading} = useQuery({
        queryKey: ['popularMovies'],
        queryFn: () => axiosInstance.get('/movie/popular', {
            params: {
                language: 'en-US',
                page: 1,
            }
        }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    })

    const {data: genres, isLoading: isGenresLoading} = useQuery({
        queryKey: ['genres'],
        queryFn: () => axiosInstance.get('/genre/movie/list', {
            params: {
                language: 'en-US',
            }
        }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    })

    console.log(genres?.data);

    console.log(popularMovies?.data?.results);


    return ( 
        <div>
            <h1 className="text-white text-opacity-50 text-lg font-bold mb-3">Popular Movies</h1>
            {(isPopularMoviesLoading || isGenresLoading) && <LoadingSideBar />}
        </div>
    );
}

export default PopularMovies;