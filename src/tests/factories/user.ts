import merge from 'lodash/merge';

import { AnnouncementType } from '@/types/auth/Announcement';
import type UserProfile from '@/types/auth/UserProfile';

const defaults: UserProfile = {
  id: 'user-123',
  firstName: 'Ahmad',
  lastName: 'Ali',
  email: 'ahmad.ali@example.com',
  username: 'ahmad_ali',
  createdAt: '2024-01-01T00:00:00.000Z',
  photoUrl: null,
  requiredFields: [],
  announcement: {
    id: 'announcement-1',
    type: AnnouncementType.AuthOnboarding,
  },
  consents: {},
  isPasswordSet: true,
};

export const makeUser = (overrides: Partial<UserProfile> = {}): UserProfile =>
  merge({ ...defaults }, overrides) as UserProfile;
