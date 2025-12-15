import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { getAvailableTranslations } from '@/api';
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
  const { t } = useTranslation('ayah-widget');
  const [translations, setTranslations] = useState<AvailableTranslation[]>([]);

  useAbortableEffect(
    (signal) => {
      const loadTranslations = async () => {
        try {
          const response = await getAvailableTranslations(locale);
          if (signal.aborted) {
            return;
          }
          const list =
            response.translations?.filter(
              (translation): translation is AvailableTranslation =>
                Boolean(translation?.id) && Boolean(translation?.name),
            ) ?? [];
          setTranslations(list);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(t('errors.loadTranslations'), error);
        }
      };

      loadTranslations();
    },
    [locale, t],
  );

  return translations;
};

export default useAyahWidgetTranslations;
