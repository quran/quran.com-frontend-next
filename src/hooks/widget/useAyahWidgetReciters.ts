/* eslint-disable react-func/max-lines-per-function */
import { useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { getAvailableReciters } from '@/api';
import { useToast, ToastStatus } from '@/dls/Toast/Toast';
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
  const toast = useToast();
  const hasLoadedRef = useRef(false);
  const lastLoadedLocaleRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  useAbortableEffect(
    (signal) => {
      if (lastLoadedLocaleRef.current !== locale) {
        hasLoadedRef.current = false;
      }
      if (isLoadingRef.current) {
        return;
      }
      if (hasLoadedRef.current && lastLoadedLocaleRef.current === locale) {
        return;
      }
      lastLoadedLocaleRef.current = locale;
      const loadReciters = async () => {
        try {
          isLoadingRef.current = true;
          const response = await getAvailableReciters(locale, []);
          setReciters(response.reciters ?? []);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(t('errors.loadReciters'), error);
          toast(t('errors.loadReciters'), { status: ToastStatus.Error });

          // Fallback to a default reciter if the API call fails (Mishary Rashid Alafasy).
          setReciters([
            {
              id: fallbackReciterId,
              reciterId: fallbackReciterId,
              name: 'Mishary Rashid Alafasy',
              recitationStyle: '',
              relativePath: '',
            },
          ]);
        } finally {
          if (!signal.aborted) {
            hasLoadedRef.current = true;
          }
          isLoadingRef.current = false;
        }
      };

      loadReciters();
    },
    [fallbackReciterId, locale, t, toast],
  );

  return reciters;
};

export default useAyahWidgetReciters;
