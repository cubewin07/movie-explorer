function helper() {
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
    return {
        getChatDisplayInfo
    }
}