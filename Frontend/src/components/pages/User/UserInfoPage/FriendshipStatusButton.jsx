import { Loader2, UserCheck, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * FriendshipStatusButton - Renders the appropriate friendship action button
 * based on the current friendship state
 */
const FriendshipStatusButton = ({
  friendshipState,
  isLoading,
  onSendRequest,
  onAcceptRequest,
  onBlockRequest,
  onCancelRequest,
}) => {
  const { type, hasIncoming, hasOutgoing, isFriend } = friendshipState;
  const { send, update, delete: deleteLoading } = isLoading;

  // Incoming request - show Accept/Block
  if (hasIncoming) {
    return (
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          onClick={onAcceptRequest}
          disabled={update}
        >
          {update ? 'Processing...' : 'Accept'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-50"
          onClick={onBlockRequest}
          disabled={update}
        >
          {update ? 'Processing...' : 'Block'}
        </motion.button>
      </div>
    );
  }

  // Outgoing request - show Pending + Cancel
  if (hasOutgoing) {
    return (
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-medium">Request Pending</span>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-50"
          onClick={onCancelRequest}
          disabled={deleteLoading}
        >
          {deleteLoading ? 'Processing...' : 'Cancel'}
        </motion.button>
      </div>
    );
  }

  // Already friends
  if (isFriend) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800"
      >
        <UserCheck className="w-4 h-4" />
        <span className="font-medium">Friends</span>
      </motion.div>
    );
  }

  // Request sent in this session
  if (type === 'sent') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <UserCheck className="w-4 h-4" />
        <span className="font-medium">Request Sent</span>
      </motion.div>
    );
  }

  // No relationship - show send request button
  return (
    <motion.button
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      onClick={onSendRequest}
      disabled={send}
    >
      {send ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Sending...</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Send Friend Request</span>
        </>
      )}
    </motion.button>
  );
};

export default FriendshipStatusButton;
