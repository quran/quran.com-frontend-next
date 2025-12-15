import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { getAvailableReciters } from '@/api';
import useAbortableEffect from '@/hooks/useAbortableEffect';
import type Reciter from 'types/Reciter';

const DEFAULT_LOCALE = 'en';
const DEFAULT_RECITER_ID = 7;

/**
 * Fetch available reciters for the Ayah widget builder and include a fallback when the API fails.
 *
 * @param {string} locale locale used for the reciters API (defaults to "en").
 * @param {number} fallbackReciterId reciter id used for the fallback entry.
 * @returns {Reciter[]} list of reciters or a single fallback reciter.
 */
const useAyahWidgetReciters = (
  locale: string = DEFAULT_LOCALE,
  fallbackReciterId: number = DEFAULT_RECITER_ID,
): Reciter[] => {
  const { t } = useTranslation('ayah-widget');
  const [reciters, setReciters] = useState<Reciter[]>([]);

  useAbortableEffect(
    (signal) => {
      const loadReciters = async () => {
        try {
          const response = await getAvailableReciters(locale, undefined);
          if (signal.aborted) {
            return;
          }
          setReciters(response.reciters ?? []);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(t('errors.loadReciters'), error);
          if (signal.aborted) {
            return;
          }
          setReciters([
            {
              id: fallbackReciterId,
              reciterId: fallbackReciterId,
              name: t('reciters.fallback'),
              recitationStyle: '',
              relativePath: '',
            },
          ]);
        }
      };

      loadReciters();
    },
    [fallbackReciterId, locale, t],
  );

  return reciters;
};

export default useAyahWidgetReciters;
