import { useCallback } from 'react';
import {
  useNotificationActions,
} from '@/hooks/notification/useNotificationActions';

/**
 * Custom hook that wraps notification mutation actions
 * Provides clean API for notification operations
 * @returns {Object} Notification action mutations
 */
export const useNotificationActionsHook = () => {
  const { markAsRead, markAllAsRead, deleteNotification, deleteNotificationsByIds } =
    useNotificationActions();

  // Wrapped mutations with consistent error handling
  const handleMarkAsRead = useCallback(
    (notificationId, token, onSuccess) => {
      markAsRead.mutate(
        { id: notificationId, token },
        { onSuccess: onSuccess || (() => {}) }
      );
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(
    (token, onSuccess) => {
      markAllAsRead.mutate(token, {
        onSuccess: onSuccess || (() => {}),
      });
    },
    [markAllAsRead]
  );

  const handleDeleteNotification = useCallback(
    (notificationId, token, onSuccess) => {
      deleteNotification.mutate(
        { id: notificationId, token },
        { onSuccess: onSuccess || (() => {}) }
      );
    },
    [deleteNotification]
  );

  const handleDeleteNotificationsByIds = useCallback(
    (ids, token, onSuccess) => {
      deleteNotificationsByIds.mutate(
        { ids, token },
        { onSuccess: onSuccess || (() => {}) }
      );
    },
    [deleteNotificationsByIds]
  );

  return {
    markAsRead: {
      mutate: handleMarkAsRead,
      isPending: markAsRead.isPending,
      error: markAsRead.error,
    },
    markAllAsRead: {
      mutate: handleMarkAllAsRead,
      isPending: markAllAsRead.isPending,
      error: markAllAsRead.error,
    },
    deleteNotification: {
      mutate: handleDeleteNotification,
      isPending: deleteNotification.isPending,
      error: deleteNotification.error,
    },
    deleteNotificationsByIds: {
      mutate: handleDeleteNotificationsByIds,
      isPending: deleteNotificationsByIds.isPending,
      error: deleteNotificationsByIds.error,
    },
  };
};

export default useNotificationActionsHook;
