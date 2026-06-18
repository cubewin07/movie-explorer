import { useEffect, useMemo } from 'react';
import { useRecommendationFreshnessContext } from '@/context/RecommendationFreshnessProvider';

function pickIds(payload) {
    if (!Array.isArray(payload)) {
        return [];
    }
    return payload
        .map((item) => {
            const type = String(item?.type || '').toUpperCase() === 'SERIES' ? 'SERIES' : 'MOVIE';
            const id = Number(item?.filmId);
            return Number.isInteger(id) && id > 0 ? `${type}:${id}` : null;
        })
        .filter(Boolean)
        .sort();
}

function arraysEqual(a, b) {
    if (!a || !b) return false;
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

export function useRecommendationsFreshness({
    currentData,
    isFetching,
    staleWindowMs = 1000 * 60 * 10,
    enabled = true,
}) {
    const {
        lastAddedItem,
        isRecomputing,
        originalIds,
        setOriginalIds,
        hasUpdated,
        setHasUpdated,
    } = useRecommendationFreshnessContext();

    const currentIds = useMemo(() => pickIds(currentData), [currentData]);

    // Detect if the recommendations list has updated compared to originalIds
    useEffect(() => {
        if (!enabled || !isRecomputing || !originalIds) {
            return;
        }

        // If the current recommendations are different from before the mutation
        if (!arraysEqual(originalIds, currentIds)) {
            setHasUpdated(true);
            setOriginalIds(null); // clear original IDs once updated
        }
    }, [currentIds, originalIds, isRecomputing, enabled, setHasUpdated, setOriginalIds]);

    const phase = useMemo(() => {
        if (!enabled || !isRecomputing) {
            return 'idle';
        }

        if (hasUpdated) {
            return 'updated';
        }

        if (isFetching) {
            return 'refreshing';
        }

        return 'unchanged';
    }, [enabled, isRecomputing, hasUpdated, isFetching]);

    const isActivityStale = useMemo(() => {
        if (!lastAddedItem) {
            return true;
        }
        return Date.now() - lastAddedItem.addedAt > staleWindowMs;
    }, [lastAddedItem, staleWindowMs]);

    return {
        phase,
        lastAddedTitle: lastAddedItem?.title || null,
        lastAddedType: lastAddedItem?.type || null,
        isActivityStale,
    };
}