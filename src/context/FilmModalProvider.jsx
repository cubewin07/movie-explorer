import { useState, createContext } from 'react';

import MovieReviewModalDemo from '@/components/react_components/Modal/ReviewFilms';

export const FilmModalContext = createContext();

function FilmModalProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContext] = useState({});

    return (
        <FilmModalContext.Provider value={{ setIsOpen, setContext }}>
            {children}
            {isOpen && <MovieReviewModalDemo {...content} />}
        </FilmModalContext.Provider>
    );
}

export default FilmModalProvider;
