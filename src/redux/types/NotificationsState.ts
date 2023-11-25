import type { IMessage } from '@novu/shared';

interface IPaginatedResponse<T = unknown> {
  data: T[];
  hasMore: boolean;
  totalCount: number;
  pageSize: number;
  page: number;
}

type NotificationsState = {
  notifications: IMessage[];
  paginatedNotifications: Record<number, IPaginatedResponse<IMessage>>;
  isLoadingNotifications: boolean; // initial fetch
  isFetchingNotifications: boolean; // initial fetch and subsequent fetches

  unseenCount: number;
};

export default NotificationsState;
