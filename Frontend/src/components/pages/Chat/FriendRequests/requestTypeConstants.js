/**
 * Constants for Friend Request Types and Status
 */

export const REQUEST_TYPES = {
  INCOMING: 'incoming',
  SENT: 'sent'
};

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  BLOCKED: 'BLOCKED'
};

export const REQUEST_TYPE_CONFIG = {
  [REQUEST_TYPES.INCOMING]: {
    icon: 'Inbox',
    title: 'No incoming requests',
    subtitle: "You're all caught up!",
    actions: [
      {
        label: 'Accept',
        variant: 'default'
      },
      {
        label: 'Block',
        variant: 'ghost'
      }
    ]
  },
  [REQUEST_TYPES.SENT]: {
    icon: 'Send',
    title: 'No sent requests',
    subtitle: 'Start adding friends!',
    actions: [
      {
        label: 'Cancel Request',
        variant: 'ghost'
      }
    ]
  }
};

export const REQUEST_MESSAGES = {
  INCOMING: 'Incoming request',
  SENT: 'Pending sent request'
};
