import { useState, useEffect, useRef } from 'react';
import { COMPOSER_TYPING_TIMEOUT } from './chatConstants';

/**
 * Hook for managing typing indicators and message input state
 */
export function useTypingIndicator(newMessage) {
    const [isComposerTyping, setIsComposerTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false); // Remote typing signals
    const typingTimeoutRef = useRef(null);

    /**
     * Handle composer typing indicator
     * Shows typing state while user is composing, clears after timeout
     */
    useEffect(() => {
        if (!newMessage) {
            setIsComposerTyping(false);
            return;
        }

        setIsComposerTyping(true);
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsComposerTyping(false);
        }, COMPOSER_TYPING_TIMEOUT);

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [newMessage]);

    /**
     * Set remote user typing state
     */
    const setRemoteTyping = (typing) => {
        setIsTyping(typing);
    };

    return {
        isComposerTyping,
        isTyping,
        setIsTyping,
        setRemoteTyping,
        typingTimeoutRef
    };
}
