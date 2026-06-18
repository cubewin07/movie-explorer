import { createContext, useContext, useState, useEffect, useRef } from 'react';

const RecommendationFreshnessContext = createContext(null);

export function RecommendationFreshnessProvider({ children }) {
    const [lastAddedItem, setLastAddedItem] = useState(null); // { id, type, title, addedAt }
    const [isRecomputing, setIsRecomputing] = useState(false);
    const [originalIds, setOriginalIds] = useState(null); // IDs of recommendations before mutation
    const [hasUpdated, setHasUpdated] = useState(false);
    const timerRef = useRef(null);

    const registerWatchlistAdd = (id, type, title, currentIds) => {
        // Clear any existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setLastAddedItem({
            id,
            type,
            title,
            addedAt: Date.now(),
        });
        setIsRecomputing(true);
        setOriginalIds(currentIds);
        setHasUpdated(false);

        // Keep recomputing state active for 10 seconds or until dismissed
        timerRef.current = setTimeout(() => {
            setIsRecomputing(false);
        }, 10000);
    };

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return (
        <RecommendationFreshnessContext.Provider
            value={{
                lastAddedItem,
                isRecomputing,
                originalIds,
                setOriginalIds,
                hasUpdated,
                setHasUpdated,
                registerWatchlistAdd,
                setIsRecomputing,
            }}
        >
            {children}
        </RecommendationFreshnessContext.Provider>
    );
}

export function useRecommendationFreshnessContext() {
    const context = useContext(RecommendationFreshnessContext);
    if (!context) {
        throw new Error('useRecommendationFreshnessContext must be used within a RecommendationFreshnessProvider');
    }
    return context;
}
