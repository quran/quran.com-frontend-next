export const MAX_REFLECTION_LENGTH = 450;

/**
 * Get the percentage of the initial visible portion of the post which
 * will be used to calculate how long it would take on average to
 * mark it as read relative to the post's estimated average reading time.
 * The percentage will be 100% if the post is shorter than MAX_REFLECTION_LENGTH.
 *
 * @param {number} reflectionTextLength
 * @returns {number}
 */
export const getInitialVisiblePostPercentage = (reflectionTextLength: number): number => {
  if (reflectionTextLength > MAX_REFLECTION_LENGTH) {
    return (MAX_REFLECTION_LENGTH * 100) / reflectionTextLength;
  }
  return 100;
};

/**
 * Estimate how long it would take to read the initial visible
 * portion of the post knowing the estimated reading time of the
 * entire post.
 *
 * @param {number} initialVisiblePostPercentage
 * @param {number} estimatedReadingTimeOfEntirePost
 * @returns {number}
 */
export const estimateReadingTimeOfInitialVisiblePortion = (
  initialVisiblePostPercentage: number,
  estimatedReadingTimeOfEntirePost: number,
): number => {
  // we need to calculate the value if the initial visible portion is not 100%
  if (initialVisiblePostPercentage !== 100) {
    return (initialVisiblePostPercentage * estimatedReadingTimeOfEntirePost) / 100;
  }
  // if 100% is initially visible, estimated time to read should be the same as estimated time to read the entire post
  return estimatedReadingTimeOfEntirePost;
};
