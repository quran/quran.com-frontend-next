export type Collection = {
  id: string;
  updatedAt: string;
  name: string;
  url: string;
  count?: number;
  bookmarksCount?: number;
  isDefault?: boolean;
};
