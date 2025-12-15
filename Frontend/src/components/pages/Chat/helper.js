function useHelper() {
    const getChatDisplayInfo = (chat, currentUser) => {
        if (chat.isGroup) {
            return {
            name: chat.name || 'Unnamed Group',
            avatarSeed: chat.name || 'group-chat',
            isGroup: true,
            };
        }

        const otherParticipant = chat.participants.find(p => p.id !== currentUser?.id);

        return {
            name: otherParticipant?.username || otherParticipant?.email || 'Unknown User',
            avatarSeed: otherParticipant?.email || otherParticipant?.username || 'user',
            isGroup: false,
            email: otherParticipant?.email,
        };
    };

    const getFriendInfo = (email, friends) => {
        if (!email || !friends) {
            return { isFriend: false, status: undefined };
        }

        const friend = friends.find(f => f.user?.email === email);
        
        if (!friend) {
            return { isFriend: false, status: undefined };
        }

        return {
            isFriend: true,
            status: friend.status,
            isOnline: friend.status === true || friend.status === 'online',
        };
    };

    // Format date for display
    const formatDateHeader = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const messageDate = new Date(date);
        
        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    };

    // Get status display text and color
    const getStatusDisplay = (status) => {
        if (status === undefined) return null; // Not friends, don't show status
        
        if (status === true || status === 'online') {
            return { text: 'Active Now', color: 'text-emerald-600 dark:text-emerald-400', isOnline: true };
        }
        if (status === false || status === 'offline') {
            return { text: 'Offline', color: 'text-slate-500 dark:text-slate-400', isOnline: false };
        }
        if (status === 'busy') {
            return { text: 'Busy', color: 'text-amber-600 dark:text-amber-400', isOnline: false };
        }
        return { text: 'Offline', color: 'text-slate-500 dark:text-slate-400', isOnline: false };
    };

    const getStatusColor = (status) => {
        switch(status) {
        case true: return 'ring-2 ring-green-500';
        case false: return 'ring-2 ring-yellow-500';
        case 'busy': return 'ring-2 ring-red-500';
        default: return 'ring-2 ring-slate-300';
        }
    };
    
    return {
        getChatDisplayInfo,
        getFriendInfo,
        formatDateHeader,
        getStatusDisplay,
        getStatusColor
    }
}

export default useHelper;