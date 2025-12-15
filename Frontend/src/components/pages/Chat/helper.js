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
    
    return {
        getChatDisplayInfo,
        getFriendInfo,
        formatDateHeader
    }
}

export default useHelper;