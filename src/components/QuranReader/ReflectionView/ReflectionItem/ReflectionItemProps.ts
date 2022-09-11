import { ReflectionVerseReference } from 'types/ReflectionVerseReference';

type ReflectionItemProps = {
  id: number;
  authorName: string;
  authorUsername: string;
  avatarUrl: string;
  date: string;
  reflectionText: string;
  verseText: string;
  reflectionGroup?: string;
  reflectionGroupLink?: string;
  isAuthorVerified: boolean;
  selectedChapterId: string;
  selectedVerseNumber: string;
  verseReferences?: ReflectionVerseReference[];
  likesCount?: number;
  commentsCount?: number;
};

export default ReflectionItemProps;
