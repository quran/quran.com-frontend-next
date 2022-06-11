import PreferenceGroup from 'types/auth/PreferenceGroup';

interface UserPreference {
  value: Record<string, any>;
  group: PreferenceGroup;
}
export default UserPreference;
