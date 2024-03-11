import { useMemo } from 'react';

import { getQuranReflectTagUrl } from '@/utils/quranReflect/navigation';

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
    () =>
      reflectionText
        .split(' ')
        .map((word) => {
          if (word.trim().startsWith('#')) {
            // eslint-disable-next-line i18next/no-literal-string
            return `<a target="_blank" href="${getQuranReflectTagUrl(
              word,
            )}" class="${hashtagStyle}">${word}</a>`;
          }

          return word;
        })
        .join(' ')
        .replace(/\r\n/g, '<br>'),
    [hashtagStyle, reflectionText],
  );

  return parsedBody;
};

export default useReflectionBodyParser;
