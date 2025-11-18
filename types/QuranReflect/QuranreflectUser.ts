import AvatarUrls from './AvatarUrls';

interface QuranreflectUser {
  username?: string;
  id: string;
  verified?: boolean;
  postAs?: boolean;
  firstName?: string;
  lastName?: string;
  postsCount?: number;
  averageToxicity?: number;
  languageId?: number;
  avatarFileName?: string;
  banned?: boolean;
  reliabilityScore?: number;
  memberType?: number;
  followersCount?: number;
  likesCount?: number;
  isAdmin?: boolean; // comes from token decoding of authenticated user
  languageIsoCode?: string; // present only in response of the logged in user details only
  settings?: {
    reflectionLanguages?: number[]; // ids of the preferred languages
    ayahLanguages?: number[]; // ids of the preferred languages
  };
  createdAt?: string | Date;
  joiningYear?: number;
  bio?: string;
  country?: string;
  followed?: boolean;
  avatarUrls: AvatarUrls;
}

export default QuranreflectUser;
