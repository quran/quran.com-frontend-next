interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
  requiredFields: string[];
}

export default UserProfile;
