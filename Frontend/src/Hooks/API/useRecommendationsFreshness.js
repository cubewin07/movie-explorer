import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Tracks whether the member recommendations payload has caught up
 * with the user's most recent watchlist mutation.
 *
 * Why this exists:
 * - Member recommendations are recomputed on the backend (potentially > 5 min).
 * - `useMemberRecommendations` invalidates and refetches on watchlist add.
 * - During the refetch we still display the previous list, so the user has
 *   no visible signal that their action was registered.
 * - This hook derives a UI "freshness phase" purely from React Query state
 *   and the mutation cache, so the lane can acknowledge recent activity
 *   without blocking on recompute completion or fabricating a fake ETA.
 *
 * Returned `phase` values:
 * - 'idle'         no recent activity detected
 * - 'refreshing'   a refetch is in flight after a recent watchlist mutation
 * - 'unchanged'    the refetch finished but returned the same set of picks
 * - 'updated'      the refetch finished with a different set of picks
 */
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
    const queryClient = useQueryClient();
    const [lastMutationAt, setLastMutationAt] = useState(null);
    const [lastAddedTitle, setLastAddedTitle] = useState(null);
    const [lastAddedType, setLastAddedType] = useState(null);
    const [phase, setPhase] = useState('idle');
    const previousIdsRef = useRef(null);
    const hasInitializedRef = useRef(false);

    // Subscribe to the mutation cache to detect the most recent
    // watchlist add. We snapshot the title/type at the moment of
    // success so the value survives any subsequent query refetches.
    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const cache = queryClient.getMutationCache();
        const captureFromMutations = () => {
            const mutations = cache.getAll();
            for (let i = mutations.length - 1; i >= 0; i -= 1) {
                const m = mutations[i];
                const mutationKey = m?.options?.mutationKey;
                const mutationFnName = m?.options?.mutationFn?.name || '';
                const isWatchlistMutation =
                    (Array.isArray(mutationKey) && mutationKey.includes('watchlist')) ||
                    /watchlist/i.test(mutationFnName);

                if (!isWatchlistMutation) {
                    continue;
                }
                if (m.state.status !== 'success') {
                    continue;
                }

                const data = m.state.data;
                const variables = m.state.variables;
                const title =
                    data?.title ||
                    data?.movie?.title ||
                    data?.series?.name ||
                    variables?.title ||
                    null;

                setLastMutationAt(m.state.submittedAt || Date.now());
                setLastAddedTitle(title);
                setLastAddedType(variables?.type || null);
                return;
            }
        };

        captureFromMutations();

        const unsubscribe = cache.subscribe(() => {
            captureFromMutations();
        });

        return unsubscribe;
    }, [queryClient, enabled]);

    // Derive the freshness phase from cache state.
    useEffect(() => {
        if (!enabled) {
            setPhase('idle');
            return undefined;
        }

        const ids = pickIds(currentData);
        const hasData = ids.length > 0;

        if (!hasInitializedRef.current) {
            if (hasData) {
                previousIdsRef.current = ids;
                hasInitializedRef.current = true;
            }
            return undefined;
        }

        const recentActivity = lastMutationAt && Date.now() - lastMutationAt <= staleWindowMs;

        if (isFetching) {
            setPhase(recentActivity ? 'refreshing' : 'idle');
            return undefined;
        }

        // Not fetching: see if the dataset changed since the last snapshot.
        const changed = !arraysEqual(previousIdsRef.current ?? [], ids);

        if (changed) {
            previousIdsRef.current = ids;
            if (recentActivity) {
                setPhase('updated');
                return undefined;
            }
            setPhase('idle');
            return undefined;
        }

        if (recentActivity) {
            setPhase('unchanged');
        } else if (phase !== 'updated') {
            setPhase('idle');
        }

        return undefined;
    }, [currentData, isFetching, lastMutationAt, staleWindowMs, enabled, phase]);

    const isActivityStale = useMemo(() => {
        if (!lastMutationAt) {
            return true;
        }
        return Date.now() - lastMutationAt > staleWindowMs;
    }, [lastMutationAt, staleWindowMs]);

    return {
        phase,
        lastAddedTitle,
        lastAddedType,
        isActivityStale,
    };
}
