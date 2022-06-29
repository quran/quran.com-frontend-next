import FormField from '../FormField';

import Announcement from './Announcement';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
  requiredFields: FormField[];
  announcement: Announcement;
}

export default UserProfile;
