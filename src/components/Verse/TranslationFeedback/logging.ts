import { logErrorToSentry } from '@/lib/sentry';

/**
 * Log translation feedback submission failures with relevant identifiers.
 *
 * @param {unknown} error - The thrown error or unexpected response object.
 * @param {string} verseKey - The verse key associated with the feedback (e.g. 2:255).
 * @param {string} translationId - The selected translation id used in the submission.
 * @returns {void}
 */
const sendFeedbackErrorToSentry = (error: unknown, verseKey: string, translationId: string) =>
  logErrorToSentry(error, {
    transactionName: 'submitTranslationFeedback',
    metadata: { verseKey, translationId },
  });

export default sendFeedbackErrorToSentry;
