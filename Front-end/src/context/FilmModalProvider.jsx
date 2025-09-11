import { useState, createContext } from 'react';
import { AnimatePresence } from 'framer-motion';

import MovieReviewModalDemo from '@/components/react_components/Modal/ReviewFilms';

export const FilmModalContext = createContext();

function FilmModalProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContext] = useState({});

    return (
        <FilmModalContext.Provider value={{ setIsOpen, setContext }}>
            {children}
            <AnimatePresence mode="wait">{isOpen && <MovieReviewModalDemo {...content} />}</AnimatePresence>
        </FilmModalContext.Provider>
    );
}

export default FilmModalProvider;
