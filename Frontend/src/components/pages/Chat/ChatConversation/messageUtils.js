import { MAX_MESSAGE_LENGTH, GROUP_GAP_MS } from './chatConstants';

/**
 * Format a date for message header display
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (Today, Yesterday, or full date)
 */
export const formatDateHeader = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return messageDate.toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
    }
};

/**
 * Get status display info for friend online status
 * @param {string|boolean} status - Friend's online status
 * @returns {Object} Status display info with color and text
 */
export const getStatusDisplay = (status) => {
    if (!status) return null;
    
    const isOnline = status === true || status === 'online';
    return {
        isOnline,
        text: isOnline ? 'Online' : 'Offline',
        color: isOnline ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400',
    };
};

/**
 * Group messages by sender and time gap
 * @param {Array} messages - Array of messages to group
 * @param {number} gapMs - Time gap in milliseconds for grouping
 * @returns {Array} Grouped message structure with type indicators
 */
export const groupMessagesByDateAndSender = (messages, gapMs = GROUP_GAP_MS) => {
    const groups = [];
    let currentDate = null;
    
    messages.forEach((message) => {
        const messageDate = new Date(message.createdAt);
        const dateString = messageDate.toDateString();
        
        if (dateString !== currentDate) {
            currentDate = dateString;
            groups.push({
                type: 'date',
                date: messageDate,
                dateString: dateString
            });
        }
        
        groups.push({
            type: 'message',
            data: message
        });
    });
    
    return groups;
};

/**
 * Determine if a message is the last of a group
 * @param {Object} message - Current message
 * @param {Object} nextMessage - Next message or null
 * @param {number} gapMs - Time gap threshold in milliseconds
 * @returns {boolean} True if message is end of group
 */
export const isGroupEnd = (message, nextMessage, gapMs = GROUP_GAP_MS) => {
    if (!nextMessage) return true;
    if (nextMessage.senderId !== message.senderId) return true;
    return (new Date(nextMessage.createdAt) - new Date(message.createdAt)) > gapMs;
};

/**
 * Determine if a message is the first of a group
 * @param {Object} message - Current message
 * @param {Object} prevMessage - Previous message or null
 * @param {number} gapMs - Time gap threshold in milliseconds
 * @returns {boolean} True if message is start of group
 */
export const isGroupStart = (message, prevMessage, gapMs = GROUP_GAP_MS) => {
    if (!prevMessage) return true;
    if (prevMessage.senderId !== message.senderId) return true;
    return (new Date(message.createdAt) - new Date(prevMessage.createdAt)) > gapMs;
};

/**
 * Validate message text before sending
 * @param {string} text - Message text to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {Object} Validation result with isValid and error message
 */
export const validateMessage = (text, maxLength = MAX_MESSAGE_LENGTH) => {
    const trimmed = text.trim();
    
    if (!trimmed) {
        return { isValid: false, error: 'Message cannot be empty' };
    }
    
    if (trimmed.length > maxLength) {
        return { 
            isValid: false, 
            error: `Message too long. Limit is ${maxLength} characters.` 
        };
    }
    
    return { isValid: true, error: null };
};

/**
 * Format message time for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

/**
 * Calculate remaining characters for message input
 * @param {string} text - Current message text
 * @param {number} maxLength - Maximum allowed length
 * @returns {number} Remaining characters
 */
export const getRemainingCharacters = (text, maxLength = MAX_MESSAGE_LENGTH) => {
    return maxLength - text.length;
};

/**
 * Check if message is from current user
 * @param {Object} message - Message object
 * @param {number} userId - Current user ID
 * @returns {boolean} True if message is from current user
 */
export const isSentByUser = (message, userId) => {
    return message.senderId === userId;
};

/**
 * Get avatar seed for message sender
 * @param {Object} message - Message object
 * @returns {string} Avatar seed value
 */
export const getMessageAvatarSeed = (message) => {
    return message.senderId || message.sender?.id || message.senderName || 'user';
};

/**
 * Get display name for message sender
 * @param {Object} message - Message object
 * @returns {string} Display name
 */
export const getMessageDisplayName = (message) => {
    return message.senderName || message.sender?.username || 'User';
};

/**
 * Merge server and optimistic messages while maintaining order
 * @param {Array} serverMessages - Messages from server
 * @param {Array} pendingMessages - Optimistic/pending messages
 * @returns {Array} Merged and sorted messages
 */
export const mergePendingMessages = (serverMessages, pendingMessages) => {
    const merged = [...serverMessages, ...pendingMessages];
    return merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

/**
 * Check if a pending message matches a server message
 * @param {Object} pending - Pending message
 * @param {Object} server - Server message
 * @returns {boolean} True if they match
 */
export const matchesPendingMessage = (pending, server) => {
    return (
        server.senderId === pending.senderId &&
        (server.text || server.content) === (pending.text || pending.content) &&
        Math.abs(new Date(server.createdAt) - new Date(pending.createdAt)) < 30000
    );
};
