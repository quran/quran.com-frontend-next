import FormField from '../FormField';

import Announcement from './Announcement';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  photoUrl?: string;
  requiredFields: FormField[];
  announcement: Announcement;
  consents: Record<string, boolean>;
  lastSyncAt?: Date;
}

export default UserProfile;
