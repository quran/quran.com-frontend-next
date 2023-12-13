/* eslint-disable max-lines */
import type { IMessage } from '@novu/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getNotificationsInitialState } from '../defaultSettings/util';
import NotificationsState from '../types/NotificationsState';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

// A helper function to clone and process the notifications while keeping the pagination intact.
const cloneAndProcessNotifications = (
  state: NotificationsState,
  processor: (data: IMessage[]) => IMessage[],
) => {
  const newPagedNotifications: NotificationsState['paginatedNotifications'] = {};
  const newNotifications: NotificationsState['notifications'] = [];

  Object.keys(state.paginatedNotifications).forEach((pageKey) => {
    const old = {
      ...state.paginatedNotifications[pageKey],
      data: [...state.paginatedNotifications[pageKey].data],
    };
    const newData = processor(old.data);
    newPagedNotifications[pageKey] = {
      ...old,
      data: newData,
    };
    newNotifications.push(...newData);
  });

  return {
    notifications: newNotifications,
    paginatedNotifications: newPagedNotifications,
  };
};

export const notificationsSlice = createSlice({
  name: SliceName.NOTIFICATIONS,
  initialState: getNotificationsInitialState(),
  reducers: {
    setNotificationsLoading: (
      state: NotificationsState,
      action: PayloadAction<{
        isLoading: boolean;
        isFetching: boolean;
        shouldResetOldData?: boolean;
      }>,
    ) => ({
      ...state,
      isLoadingNotifications: action.payload.isLoading,
      isFetchingNotifications: action.payload.isFetching,

      /**
       * reset the notifications if the flag is set to true
       * this is useful when we want to fetch the data from the beginning when the user re-opens the notification widget
       */
      ...(action.payload.shouldResetOldData
        ? { notifications: [], paginatedNotifications: {} }
        : {}),
    }),
    setNotificationsPageAndFinishLoading: (
      state: NotificationsState,
      action: PayloadAction<{
        page: number;
        data: NotificationsState['paginatedNotifications'][number];
        shouldResetOldData?: boolean;
      }>,
    ) => {
      const newPagedNotifications = {
        ...(action.payload.shouldResetOldData ? {} : state.paginatedNotifications),
        [action.payload.page]: action.payload.data,
      };
      // eslint-disable-next-line unicorn/no-array-reduce
      const newNotifications = Object.keys(newPagedNotifications).reduce((acc, pageKey) => {
        return [...acc, ...newPagedNotifications[pageKey].data];
      }, []);

      return {
        ...state,
        paginatedNotifications: newPagedNotifications,
        notifications: newNotifications,
        isLoadingNotifications: false,
        isFetchingNotifications: false,
      };
    },
    setUnseenCount: (state: NotificationsState, action: PayloadAction<number>) => ({
      ...state,
      unseenCount: action.payload,
    }),
    setAllAsRead: (state: NotificationsState) => {
      return {
        ...state,
        ...cloneAndProcessNotifications(state, (notifications) =>
          notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        ),
      };
    },
    setNotificationAsRead: (
      state: NotificationsState,
      action: PayloadAction<{ messageId: string }>,
    ) => {
      return {
        ...state,
        ...cloneAndProcessNotifications(state, (notifications) =>
          notifications.map((notification) => {
            // eslint-disable-next-line no-underscore-dangle
            if (notification._id === action.payload.messageId) {
              return {
                ...notification,
                read: true,
              };
            }
            return notification;
          }),
        ),
      };
    },
    setDeleteNotification: (
      state: NotificationsState,
      action: PayloadAction<{ messageId: string }>,
    ) => {
      return {
        ...state,
        ...cloneAndProcessNotifications(state, (notifications) =>
          notifications.filter((notification) => {
            // eslint-disable-next-line no-underscore-dangle
            return notification._id !== action.payload.messageId;
          }),
        ),
      };
    },
  },
});

export const {
  setNotificationsLoading,
  setNotificationsPageAndFinishLoading,
  setUnseenCount,
  setAllAsRead,
  setNotificationAsRead,
  setDeleteNotification,
} = notificationsSlice.actions;

export const selectUnseenCount = (state: RootState) => state.notifications.unseenCount;
export const selectNotifications = (state: RootState) => state.notifications.notifications;
export const selectHasMoreNotifications = (state: RootState) => {
  const { paginatedNotifications } = state.notifications;
  const lastPage = Math.max(...(Object.keys(paginatedNotifications) as unknown as number[]));
  return !!paginatedNotifications[lastPage]?.hasMore;
};
export const selectLastLoadedNotificationsPage = (state: RootState) => {
  const { paginatedNotifications } = state.notifications;
  return Math.max(...(Object.keys(paginatedNotifications) as unknown as number[]));
};
export const selectLoadedNotificationsPages = (state: RootState) => {
  const { paginatedNotifications } = state.notifications;
  return Object.keys(paginatedNotifications) as unknown as number[];
};
export const selectNotificationsIsLoading = (state: RootState) =>
  state.notifications.isLoadingNotifications;
export const selectNotificationsIsFetching = (state: RootState) =>
  state.notifications.isFetchingNotifications;

export default notificationsSlice.reducer;
