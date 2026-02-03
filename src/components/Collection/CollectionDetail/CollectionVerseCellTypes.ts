type CollectionVerseCellProps = {
  bookmarkId: string;
  chapterId: number;
  verseNumber: number;
  collectionId: string;
  collectionName: string;
  isOwner: boolean;
  onDelete?: (bookmarkId: string) => void;
  createdAt?: string;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (bookmarkId: string) => void;
  isExpanded?: boolean;
  onToggleExpansion?: (bookmarkId: string) => void;
};

export default CollectionVerseCellProps;
