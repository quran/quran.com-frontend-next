import { useMemo } from 'react';

import { parseReflectionBody } from '@/utils/quranReflect/bodyParser';

/**
 * A hook to parse the reflection body and replace the hashtags with links.
 *
 * TODO: make all usages of this hook DRY.
 *
 * @param {string} reflectionText
 * @param {string} hashtagStyle
 * @returns {string}
 */
const useReflectionBodyParser = (reflectionText: string, hashtagStyle: string): string => {
  const parsedBody = useMemo(
    () => parseReflectionBody(reflectionText, hashtagStyle),
    [hashtagStyle, reflectionText],
  );

  return parsedBody;
};

export default useReflectionBodyParser;
