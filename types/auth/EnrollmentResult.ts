/**
 * Discriminated union type for enrollment operation results.
 * Allows callers to handle each case appropriately.
 */
type EnrollmentResult =
  | { status: 'success' }
  | { status: 'not_logged_in' }
  | { status: 'already_enrolled' }
  | { status: 'error'; error?: Error };

export default EnrollmentResult;
