import { useState, useEffect } from 'react';

/**
 * Custom hook for handling debounced field validation with error display
 * Only shows errors when field has content (not for empty/required errors)
 * @param {string} fieldName - Name of the field to validate
 * @param {string} fieldValue - Current value of the field
 * @param {boolean} isDirty - Whether the field has been touched
 * @param {Function} trigger - React Hook Form trigger function for validation
 * @param {number} delay - Debounce delay in milliseconds (default: 500)
 * @returns {boolean} - Whether to show validation error for filled fields
 */
export const useDebounceValidation = (
    fieldName,
    fieldValue,
    isDirty,
    trigger,
    delay = 500
) => {
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        // Clear error immediately when user starts typing
        setShowError(false);

        // Clear existing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Only validate if field has been touched/modified AND has a value
        // This hook is for format/content validation, not required field validation
        if (isDirty && fieldValue && fieldValue.trim() !== '') {
            const timer = setTimeout(() => {
                trigger(fieldName).then((isValid) => {
                    // Only show error if field has content but validation failed
                    // Required field errors are handled by react-hook-form on submit
                    setShowError(!isValid);
                });
            }, delay);

            setTypingTimeout(timer);
        } else {
            // Reset error state when field is empty
            setShowError(false);
        }

        // Cleanup: clear timeout on unmount or when dependencies change
        return () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        };
    }, [fieldValue, fieldName, isDirty, trigger, delay]);

    return showError;
};
