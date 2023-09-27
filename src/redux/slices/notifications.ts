/* eslint-disable max-lines */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getNotificationsInitialState } from '../defaultSettings/util';
import NotificationsState from '../types/NotificationsState';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

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
    setAllAsSeen: (state: NotificationsState) => {
      const newPagedNotifications = {};
      const newNotifications = [];
      Object.keys(state.paginatedNotifications).forEach((pageKey) => {
        const old = {
          ...state.paginatedNotifications[pageKey],
          data: [...state.paginatedNotifications[pageKey].data],
        };

        const newData = old.data.map((notification) => ({
          ...notification,
          seen: true,
        }));
        newPagedNotifications[pageKey] = {
          ...old,
          data: newData,
        };
        newNotifications.push(...newData);
      });

      return {
        ...state,
        unseenCount: 0,
        notifications: newNotifications,
        paginatedNotifications: newPagedNotifications,
      };
    },
    setAllAsRead: (state: NotificationsState) => {
      const newPagedNotifications = {};
      const newNotifications = [];
      Object.keys(state.paginatedNotifications).forEach((pageKey) => {
        const old = {
          ...state.paginatedNotifications[pageKey],
          data: [...state.paginatedNotifications[pageKey].data],
        };

        const newData = old.data.map((notification) => ({
          ...notification,
          read: true,
        }));
        newPagedNotifications[pageKey] = {
          ...old,
          data: newData,
        };
        newNotifications.push(...newData);
      });

      return {
        ...state,
        notifications: newNotifications,
        paginatedNotifications: newPagedNotifications,
      };
    },
    setNotificationAsRead: (
      state: NotificationsState,
      action: PayloadAction<{ messageId: string }>,
    ) => {
      const newPagedNotifications = {};
      const newNotifications = [];

      Object.keys(state.paginatedNotifications).forEach((pageKey) => {
        const old = {
          ...state.paginatedNotifications[pageKey],
          data: [...state.paginatedNotifications[pageKey].data],
        };
        const newData = old.data.map((notification) => {
          // eslint-disable-next-line no-underscore-dangle
          if (notification._id === action.payload.messageId) {
            return {
              ...notification,
              read: true,
            };
          }
          return notification;
        });
        newPagedNotifications[pageKey] = {
          ...old,
          data: newData,
        };
        newNotifications.push(...newData);
      });

      return {
        ...state,
        notifications: newNotifications,
        paginatedNotifications: newPagedNotifications,
      };
    },
    setDeleteNotification: (
      state: NotificationsState,
      action: PayloadAction<{ messageId: string }>,
    ) => {
      const newPagedNotifications = {};
      const newNotifications = [];
      Object.keys(state.paginatedNotifications).forEach((pageKey) => {
        const old = {
          ...state.paginatedNotifications[pageKey],
          data: [...state.paginatedNotifications[pageKey].data],
        };

        const newData = old.data.filter((notification) => {
          // eslint-disable-next-line no-underscore-dangle
          return notification._id !== action.payload.messageId;
        });

        newPagedNotifications[pageKey] = {
          ...old,
          data: newData,
        };
        newNotifications.push(...newData);
      });

      return {
        ...state,
        notifications: newNotifications,
        paginatedNotifications: newPagedNotifications,
      };
    },
  },
});

export const {
  setNotificationsLoading,
  setNotificationsPageAndFinishLoading,
  setUnseenCount,
  setAllAsSeen,
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
export const selectNotificationsIsLoading = (state: RootState) =>
  state.notifications.isLoadingNotifications;
export const selectNotificationsIsFetching = (state: RootState) =>
  state.notifications.isFetchingNotifications;

export default notificationsSlice.reducer;
