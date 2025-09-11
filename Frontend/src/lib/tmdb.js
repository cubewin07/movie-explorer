import axiosInstance from './axiosInstance';

export const fetchMovieDetails = async (id) => {
    try {
        const { data } = await axiosInstance.get(`/movie/${id}`, {
            params: { 
                language: 'en-US'
            }
        });
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        throw error;
    }
};

export const fetchTVDetails = async (id) => {
    try {
        const { data } = await axiosInstance.get(`/tv/${id}`, {
            params: {
                language: 'en-US'
            }
        });
        return data;
    } catch (error) {
        console.error('Error fetching TV series details:', error);
        throw error;
    }
};
