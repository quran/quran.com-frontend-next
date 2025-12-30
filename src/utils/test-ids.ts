/**
 * Centralized test IDs for use in automated testing (Playwright, React Testing Library, etc.).
 *
 * This module provides a single source of truth for test identifiers used across the application.
 * Test IDs should be added here to ensure consistency and make it easier to update selectors
 * when needed.
 *
 * @example
 * ```tsx
 * import TEST_IDS from '@/utils/test-ids';
 *
 * <button data-testid={TEST_IDS.profile.editButton}>Edit</button>
 * ```
 */
const TEST_IDS = {
  AUTH: {
    UPDATE_PROFILE: {
      EDIT_DETAILS_SECTION: 'auth-update-profile-edit-details-section',
      PERSONALIZATION_SECTION: 'auth-update-profile-personalization-section',
      CHANGE_PASSWORD_SECTION: 'auth-update-profile-change-password-section',
      EMAIL_NOTIFICATION_SETTINGS_SECTION:
        'auth-update-profile-email-notification-settings-section',
      EMAIL_NOTIFICATION_SETTINGS_CHECKBOX:
        'auth-update-profile-email-notification-settings-checkbox',
      PROFILE_INPUT: 'auth-update-profile-input',
      CURRENT_PASSWORD_INPUT: 'auth-update-profile-current-password-input',
      NEW_PASSWORD_INPUT: 'auth-update-profile-new-password-input',
      CONFIRM_NEW_PASSWORD_INPUT: 'auth-update-profile-confirm-new-password-input',
    },
  },
};

export default TEST_IDS;
