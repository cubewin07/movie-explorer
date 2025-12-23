import { useEffect, useRef, useState } from 'react';

/**
 * Hook for managing message scroll behavior
 * Handles auto-scroll on new messages and scroll button visibility
 */
export function useMessageScroll() {
    const scrollRef = useRef(null);
    const observerTarget = useRef(null);
    const lastMessageRef = useRef(null);
    const prevMessagesLength = useRef(0);
    const isUserScrolling = useRef(false);
    const scrollTimeout = useRef(null);
    const scrollButtonEnabled = useRef(false);
    const shouldScrollToBottom = useRef(true);
    
    const [showScrollButton, setShowScrollButton] = useState(false);

    /**
     * Smooth scroll to bottom of messages
     * @param {string} behavior - 'smooth' or 'auto'
     */
    const scrollToBottom = (behavior = 'smooth') => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTo({
                    top: scrollElement.scrollHeight,
                    behavior: behavior
                });
            }
        }
    };

    /**
     * Handle scroll detection to track if user is scrolling
     */
    const handleScroll = () => {
        const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (!scrollElement) return;
        
        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        isUserScrolling.current = distanceFromBottom > 100;
        
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        
        scrollTimeout.current = setTimeout(() => {
            if (distanceFromBottom < 100) {
                isUserScrolling.current = false;
            }
        }, 150);
    };

    /**
     * Attach scroll listener to message area
     */
    useEffect(() => {
        const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll);
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [scrollRef.current]);

    /**
     * Observer for last message visibility
     */
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!scrollButtonEnabled.current || shouldScrollToBottom.current) {
                    setShowScrollButton(false);
                    return;
                }

                if (!entry.isIntersecting) {
                    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
                    if (scrollElement) {
                        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
                        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
                        setShowScrollButton(distanceFromBottom > 50);
                    } else {
                        setShowScrollButton(false);
                    }
                } else {
                    setShowScrollButton(false);
                }
            },
            { threshold: 0.1 }
        );

        if (lastMessageRef.current) {
            observer.observe(lastMessageRef.current);
        }

        return () => {
            if (lastMessageRef.current) {
                observer.unobserve(lastMessageRef.current);
            }
        };
    }, []);

    /**
     * Handle scroll to bottom button click
     */
    const handleScrollToBottom = () => {
        scrollToBottom('smooth');
        isUserScrolling.current = false;
    };

    return {
        scrollRef,
        observerTarget,
        lastMessageRef,
        showScrollButton,
        setShowScrollButton,
        prevMessagesLength,
        isUserScrolling,
        shouldScrollToBottom,
        scrollButtonEnabled,
        scrollToBottom,
        handleScroll,
        handleScrollToBottom
    };
}
