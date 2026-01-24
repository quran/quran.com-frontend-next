import React from 'react';

/**
 * Splits subtitle text intelligently for line break at the last comma.
 * This helps with better text formatting on different screen sizes.
 *
 * @param {string} text - The subtitle text to format
 * @returns {React.ReactNode} The formatted text with line break after last comma, or original text if no comma found
 *
 * @example
 * // Returns: <>Track your progress,<br />stay consistent</>
 * getFormattedSubtitle("Track your progress, stay consistent")
 *
 * @example
 * // Returns: "No comma here"
 * getFormattedSubtitle("No comma here")
 */
const getFormattedSubtitle = (text: string): React.ReactNode => {
  // Find the last comma in the text
  const lastCommaIndex = text.lastIndexOf(',');

  if (lastCommaIndex === -1) {
    // No comma found, return text as is
    return text;
  }

  // Split at the last comma
  const firstPart = text.substring(0, lastCommaIndex + 1); // Include the comma
  const secondPart = text.substring(lastCommaIndex + 1).trim();

  return (
    <>
      {firstPart}
      <br />
      {secondPart}
    </>
  );
};

export default getFormattedSubtitle;
