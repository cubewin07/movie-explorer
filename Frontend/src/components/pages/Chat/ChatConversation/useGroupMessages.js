import { useMemo, useEffect, useRef } from 'react';
import { groupMessagesByDateAndSender, mergePendingMessages, matchesPendingMessage } from './messageUtils';

/**
 * Hook for managing message grouping and pending message synchronization
 */
export function useGroupMessages(messages, pendingMessages, setPendingMessages) {
    const pendingTimeoutsRef = useRef({});

    /**
     * Group messages by date
     */
    const groupedMessages = useMemo(() => {
        const allMessages = [...messages, ...pendingMessages];
        const sorted = allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return groupMessagesByDateAndSender(sorted);
    }, [messages, pendingMessages]);

    /**
     * Combined messages (server + pending) in chronological order
     */
    const combinedMessages = useMemo(() => {
        return mergePendingMessages(messages, pendingMessages);
    }, [messages, pendingMessages]);

    /**
     * Get last optimistic message from user if sending or failed
     */
    const lastUserOptimistic = useMemo(() => {
        if (!combinedMessages || combinedMessages.length === 0) return null;
        const last = combinedMessages[combinedMessages.length - 1];
        if (!last) return null;
        const isUserLast = last.senderId;
        const isOptimistic = !!last.optimistic;
        const hasStatus = last.status === 'sending' || last.status === 'failed';
        return isUserLast && isOptimistic && hasStatus ? last : null;
    }, [combinedMessages]);

    /**
     * Mark a pending message with a new status
     */
    const markPendingStatus = (id, status) => {
        setPendingMessages((prev) => prev.map((msg) => msg.id === id ? { ...msg, status } : msg));
    };

    /**
     * Sync pending messages with server messages
     * Remove pending messages that have been confirmed by server
     */
    useEffect(() => {
        if (messages.length === 0) return;

        setPendingMessages((prev) => {
            if (prev.length === 0) return prev;

            let changed = false;
            const filtered = prev.filter((pending) => {
                const match = messages.find((m) => matchesPendingMessage(pending, m));

                if (match) {
                    changed = true;
                    if (pendingTimeoutsRef.current[pending.id]) {
                        clearTimeout(pendingTimeoutsRef.current[pending.id]);
                        delete pendingTimeoutsRef.current[pending.id];
                    }
                    console.log("[PENDING MATCH CONFIRMED]", {
                        pendingId: pending.id,
                        pendingCreatedAt: pending.createdAt,
                        serverMessageId: match.id,
                        serverCreatedAt: match.createdAt
                    });
                }

                return !match;
            });

            return changed ? filtered : prev;
        });
    }, [messages, setPendingMessages]);

    /**
     * Cleanup timeouts on unmount
     */
    useEffect(() => {
        return () => {
            Object.values(pendingTimeoutsRef.current).forEach(clearTimeout);
        };
    }, []);

    return {
        groupedMessages,
        combinedMessages,
        lastUserOptimistic,
        markPendingStatus,
        pendingTimeoutsRef
    };
}
