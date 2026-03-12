import QuranreflectUser from './QuranreflectUser';
import Reference from './Reference';
import Room from './Room';

interface AyahFeedItem {
  id: number;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: Date;
  publishedAt?: Date;
  hidden: boolean;
  reported: boolean;
  removed: boolean;
  verified: boolean;
  roomPostStatus?: number;
  commentsCount: number;
  likesCount: number;
  viewsCount: number;
  languageId?: number;
  languageName?: string;
  moderationStatus?: number;
  reviewStatus?: number;
  estimatedReadingTime?: number;
  roomId: number;
  postTypeId: number;
  postTypeName?: string;
  isLiked: boolean;
  isSaved: boolean;
  isCommentedOn: boolean;
  isByFollowedUser: boolean;
  author: QuranreflectUser;
  room?: Room;
  references: Reference[];
  locale: string;
  isEnglish: boolean;
  isPreferredLocale: boolean;
  canShowFollowButton: boolean;
  isAuthorFollowed: boolean;
}

export default AyahFeedItem;
