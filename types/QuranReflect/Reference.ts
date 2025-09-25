interface Reference {
  id: string; // -->> indicatorText: surah-num-aya_start:aya_end
  discussionId?: number;
  topicId?: number;
  bookId?: number;
  chapterId?: number;
  from?: number;
  to?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default Reference;
