import { useMemo } from 'react';
import { useFriendRequests } from '@/hooks/friend/useFriendRequests';

/**
 * Hook to manage and determine friendship state with another user
 * @param {Object} userInfo - The user being viewed
 * @param {boolean} isRequestSent - Track if request was just sent in session
 * @param {boolean} isAccepted - Track if request was just accepted in session
 * @returns {Object} Friendship state information
 */
export const useFriendshipState = (userInfo, isRequestSent = false, isAccepted = false) => {
  const { incomingRequests, outgoingRequests } = useFriendRequests();

  const friendshipState = useMemo(() => {
    if (!userInfo?.id) {
      return {
        type: 'none',
        hasIncoming: false,
        hasOutgoing: false,
        isFriend: false,
        isRequestSentSession: false,
        isAcceptedSession: false,
      };
    }

    const incomingPending = incomingRequests?.data?.some((r) => r?.id === userInfo.id);
    const outgoingPending = outgoingRequests?.data?.some((r) => r?.id === userInfo.id);
    const isFriend = userInfo?.status === 'ACCEPTED' || isAccepted;

    // Determine state type
    let type = 'none';
    if (incomingPending) type = 'incoming';
    else if (outgoingPending) type = 'outgoing';
    else if (isFriend) type = 'friend';
    else if (isRequestSent) type = 'sent';

    return {
      type,
      hasIncoming: incomingPending,
      hasOutgoing: outgoingPending,
      isFriend,
      isRequestSentSession: isRequestSent,
      isAcceptedSession: isAccepted,
    };
  }, [userInfo?.id, userInfo?.status, incomingRequests, outgoingRequests, isRequestSent, isAccepted]);

  return friendshipState;
};
