import FormField from '../FormField';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
  requiredFields: FormField[];
  isOnboarded?: boolean;
}

export default UserProfile;
