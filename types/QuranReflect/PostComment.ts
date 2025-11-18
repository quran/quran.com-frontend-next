interface PostComment {
  id: number;
  postId: number;
  authorId: string;
  parentId: number;
  isPrivate: boolean;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  toxicityScore?: number;
  repliesCount?: number;
  likesCount?: number;
  reported?: boolean;
  removed?: boolean;
  hidden?: boolean;
  languageId?: number;
  languageName?: string;
  moderationStatus?: number;
}

export default PostComment;
