import UserProfile from 'types/auth/UserProfile';
import FormField, { FormFieldType } from 'types/FormField';

/**
 * Checks if a user profile is complete by verifying that all required fields are filled
 * @param {UserProfile} userData - User profile data
 * @returns {boolean} - Indicating if the profile is complete
 */
export const isCompleteProfile = (userData: UserProfile): boolean => {
  return !!userData?.email && !!userData?.firstName && !!userData?.lastName && !!userData?.username;
};

/**
 * Determines which fields are missing from a user profile
 * @param {UserProfile} userData - User profile data
 * @returns {string[]} - Array of field names that are missing
 */
export const getMissingFields = (userData: UserProfile): string[] => {
  const missingFields = [];

  if (!userData?.firstName) missingFields.push('firstName');
  if (!userData?.lastName) missingFields.push('lastName');
  if (!userData?.email) missingFields.push('email');
  if (!userData?.username) missingFields.push('username');

  return missingFields;
};

/**
 * Converts missing field names to FormField objects for the form builder
 * @param {string[]} missingFields - Array of missing field names
 * @returns {FormField[]} - Array of FormField objects
 */
export const convertMissingFieldsToFormFields = (missingFields: string[]): FormField[] => {
  return missingFields.map((field) => {
    // Determine the appropriate field type
    let type = FormFieldType.Text;
    if (field === 'email') {
      type = FormFieldType.Text; // Using text with email input type in the UI
    } else if (field === 'password' || field === 'confirmPassword') {
      type = FormFieldType.Password;
    }

    return {
      field,
      type,
    };
  });
};
