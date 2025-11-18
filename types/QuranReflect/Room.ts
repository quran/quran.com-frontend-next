import PageMetadata from './PageMetadata';

interface Room {
  id: number;
  name?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _group?: string;
  activationToken?: string;
  public?: boolean;
  privateToken?: string;
  avatarFileName?: string;
  avatarContentType?: string;
  avatarFileSize?: number;
  avatarUpdatedAt?: Date;
  verified?: boolean;
  roomType?: RoomType;
  subdomain?: string;
  url?: string;
  country?: string;
  ownerId?: string;
  metadata?: PageMetadata;
  isAdmin?: boolean | string;
  isOwner?: boolean | string;
}

export enum RoomType {
  GROUP = 'group',
  PAGE = 'page',
}

export default Room;
