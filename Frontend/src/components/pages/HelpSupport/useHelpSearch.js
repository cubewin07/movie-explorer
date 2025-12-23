import { useState } from 'react';

/**
 * Custom hook for searching and filtering FAQ content
 * @param {Array} faqData - Array of FAQ categories with items
 * @returns {Object} Contains filteredFAQs and search query state
 */
export function useHelpSearch(faqData) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFAQs = faqData
        .map((category) => ({
            ...category,
            items: category.items.filter(
                (item) =>
                    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        }))
        .filter((category) => category.items.length > 0);

    return {
        searchQuery,
        setSearchQuery,
        filteredFAQs,
        resultsCount: filteredFAQs.reduce((total, category) => total + category.items.length, 0),
    };
}
