import { ProfileRequiredFields } from './CompleteSignupRequest';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
  requiredFields: ProfileRequiredFields[];
}

export default UserProfile;
