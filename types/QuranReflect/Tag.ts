interface Tag {
  id: number;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  rank?: number;
  languageId?: number;
  languageName?: string;
  postsCount?: number;
  commentsCount?: number;
}

export default Tag;
