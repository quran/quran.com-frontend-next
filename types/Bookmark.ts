interface Bookmark {
  id: string;
  key: number;
  type: string;
  verseNumber?: number;
  /**
   * Indicates whether this bookmark belongs to the default collection.
   * Undefined when collection membership hasn't been determined yet.
   */
  isInDefaultCollection?: boolean;
}

export default Bookmark;
