import FormField from '../FormField';

import Announcement from './Announcement';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  createdAt: string;
  avatars?: {
    large: string;
    medium: string;
    small: string;
  };
  photoUrl: string | null;
  requiredFields: FormField[];
  announcement: Announcement;
  consents: Record<string, boolean>;
  lastSyncAt?: Date;
  isPasswordSet: boolean;
}

export default UserProfile;
