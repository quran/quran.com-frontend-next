import {
  useContext,
  createContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import { HeadlessService, IFeedId, IMessageId } from '@novu/headless';
import type { IMessage } from '@novu/shared';

import { getUserIdCookie } from '@/utils/auth/login';

type NotificationContextType = {
  unseenCount: number;
  pageNumber: number;
  notifications: IMessage[];
};

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState<IMessage[]>([]);
  const [unseenCount, setUnseenCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const headlessServiceRef = useRef<HeadlessService>(null);

  const markNotificationsAsSeen = useCallback((messageIds: IMessageId) => {
    // if it's a single message
    if (!Array.isArray(messageIds)) {
      messageIds = [messageIds];
    }
    const headlessService = headlessServiceRef.current;

    if (headlessService) {
      headlessService.markNotificationsAsSeen({
        messageId: messageIds,
        listener: (result) => {},
        onError: (error) => {
          console.error('Error marking notifications as read:', error);
        },
      });
    }
  }, []);

  const fetchNotifications = useCallback(
    (shouldMarkAsSeenOnSuccess = true) => {
      const headlessService = headlessServiceRef.current;
      if (headlessService) {
        headlessService.fetchNotifications({
          page: pageNumber, // page number to be fetched
          listener: ({ data, error, isError, isFetching, isLoading, status }) => {
            // Handle the state of the fetching process and errors here.
          },
          onSuccess: (response) => {
            setNotifications(response.data); // Store notifications in the state
            if (shouldMarkAsSeenOnSuccess) {
              const messageIds = response.data.map((message) => {
                return message.id;
              });
              markNotificationsAsSeen(messageIds);
            }
          },
          onError: (error) => {},
        });
      }
    },
    [markNotificationsAsSeen, pageNumber],
  );

  useEffect(() => {
    const headlessService = new HeadlessService({
      backendUrl: process.env.NEXT_PUBLIC_NOVU_BACKEND_URL,
      socketUrl: process.env.NEXT_PUBLIC_NOVU_SOCKET_URL,
      subscriberId: getUserIdCookie(),
      // TODO: add HMAC
      applicationIdentifier: process.env.NEXT_PUBLIC_NOVU_APP_ID,
    });

    headlessService.initializeSession({
      listener: (res) => {},
      onSuccess: (session) => {
        headlessServiceRef.current = headlessService;
        headlessService.fetchUnseenCount({
          listener: () => {},
          onSuccess: ({ count }) => {
            setUnseenCount(count);
          },
          onError: (error: unknown) => {
            console.error('onError', error);
          },
        });
        headlessService.listenUnseenCountChange({
          listener: (count) => {
            setUnseenCount(count);
          },
        });
      },
      onError: (error) => {
        console.log('headlessSice error:', error);
      },
    });
  }, []);

  // Function to mark notifications as read
  const markNotificationsAsRead = (messageId: string) => {
    const headlessService = headlessServiceRef.current;

    if (headlessService) {
      headlessService.markNotificationsAsRead({
        messageId: [messageId],
        listener: (result) => {},
        onSuccess: () => {
          // manually update the read state of the notification instead of calling the API again
          setNotifications((prevNotifications) => {
            const newNotifications = [...prevNotifications];
            const updatedNotificationIndex = newNotifications.findIndex(
              (notification) => notification.id === messageId,
            );
            // if the notification is found
            if (updatedNotificationIndex !== -1) {
              newNotifications[updatedNotificationIndex] = {
                ...newNotifications[updatedNotificationIndex],
                read: true,
              };
            }
            return newNotifications;
          });
        },
        onError: (error) => {
          console.error('Error marking notifications as read:', error);
        },
      });
    }
  };

  // Function to mark notifications as read

  const deleteNotification = (messageId: string) => {
    const headlessService = headlessServiceRef.current;
    if (headlessService) {
      headlessService.removeNotification({
        messageId,
        listener: () => {},
        onSuccess: () => {
          fetchNotifications();
        },
        onError: (error) => {
          console.error(error);
        },
      });
    }
  };

  const markAllMessagesAsRead = (feedId: IFeedId) => {
    const headlessService = headlessServiceRef.current;

    headlessService.markAllMessagesAsRead({
      listener: (result) => {
        console.log(result);
        // Handle the result of marking all messages as read
        // You can update the state or perform other actions here
      },
      onSuccess: () => {
        setUnseenCount(0);
        // manually set all notifications to read instead of calling the API again
        setNotifications((prevNotifications) => {
          const newNotifications = [...prevNotifications];

          return newNotifications.map((notification) => {
            return {
              ...notification,
              read: true,
            };
          });
        });
      },
      onError: (error) => {
        console.error('Error marking all messages as read:', error);
        // Implement error handling if needed
      },
      feedId, // Pass the feed ID here, it can be an array or a single ID
    });
  };

  const value = useMemo(
    () => ({
      notifications,
      markNotificationsAsRead,
      markAllMessagesAsRead,
      deleteNotification,
      pageNumber,
      unseenCount,
      setPageNumber,
      fetchNotifications,
    }),
    [fetchNotifications, notifications, pageNumber, unseenCount],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

const useNotification = () => useContext(NotificationContext);

export { useNotification, NotificationProvider };
