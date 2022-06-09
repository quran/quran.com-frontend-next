import { CompleteSignupRequestKey } from './CompleteSignupRequest';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
  requiredFields: CompleteSignupRequestKey[];
}

export default UserProfile;
