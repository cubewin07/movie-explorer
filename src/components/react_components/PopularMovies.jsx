import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import LoadingSideBar from "./LoadingSideBar";

function PopularMovies() {
    // const {data: popularMovies, isLoading: isPopularMoviesLoading} = useQuery({
    //     queryKey: ['popularMovies'],
    //     queryFn: () => axiosInstance.get('/movie/popular', {
    //         params: {
    //             language: 'en-US',
    //             page: 1,
    //         }
    //     }),
    //     retry: 1,
    // })

    // console.log(popularMovies);

    const isPopularMoviesLoading = true;

    if(isPopularMoviesLoading) {
        return <LoadingSideBar />
    }

    return ( 
        <div>
            <h1>Popular Movies</h1>
        </div>
    );
}

export default PopularMovies;