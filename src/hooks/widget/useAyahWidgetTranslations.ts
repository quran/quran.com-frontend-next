/* eslint-disable react-func/max-lines-per-function */
import { useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { getAvailableTranslations } from '@/api';
import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import useAbortableEffect from '@/hooks/useAbortableEffect';
import type AvailableTranslation from 'types/AvailableTranslation';

const DEFAULT_LOCALE = 'en';

/**
 * Fetch available translations for the Ayah widget builder and expose them as state.
 *
 * @param {string} locale locale used for the translations API (defaults to "en").
 * @returns {AvailableTranslation[]} list of available translations.
 */
const useAyahWidgetTranslations = (locale: string = DEFAULT_LOCALE): AvailableTranslation[] => {
  const { t } = useTranslation('embed');
  const toast = useToast();
  const [translations, setTranslations] = useState<AvailableTranslation[]>([]);
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

      const loadTranslations = async () => {
        try {
          isLoadingRef.current = true;
          const response = await getAvailableTranslations(locale);
          const list =
            response.translations?.filter(
              (translation): translation is AvailableTranslation =>
                Boolean(translation?.id) && Boolean(translation?.name),
            ) ?? [];
          setTranslations(list);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(t('errors.loadTranslations'), error);
          toast(t('errors.loadTranslations'), { status: ToastStatus.Error });
        } finally {
          if (!signal.aborted) {
            hasLoadedRef.current = true;
          }
          isLoadingRef.current = false;
        }
      };

      loadTranslations();
    },
    [locale, t, toast],
  );

  return translations;
};

export default useAyahWidgetTranslations;
