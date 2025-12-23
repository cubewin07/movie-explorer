import { useState, useEffect } from 'react';

/**
 * Hook for managing connection state and offline notifications
 */
export function useConnectionState() {
    const [isOffline, setIsOffline] = useState(() => 
        (typeof navigator !== 'undefined' ? !navigator.onLine : false)
    );
    const [sendErrorBanner, setSendErrorBanner] = useState('');

    /**
     * Setup online/offline event listeners
     */
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    /**
     * Show error banner
     */
    const showErrorBanner = (message) => {
        setSendErrorBanner(message);
    };

    /**
     * Clear error banner
     */
    const clearErrorBanner = () => {
        setSendErrorBanner('');
    };

    return {
        isOffline,
        sendErrorBanner,
        setSendErrorBanner,
        showErrorBanner,
        clearErrorBanner
    };
}
