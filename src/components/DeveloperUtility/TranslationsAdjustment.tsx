/* eslint-disable i18next/no-literal-string */
import { useEffect, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './TranslationsAdjustment.module.scss';

import {
  selectSelectedTranslations,
  setSelectedTranslations,
} from '@/redux/slices/QuranReader/translations';
import { areArraysEqual, numbersToStringsArray } from '@/utils/array';
import { getAvailableTranslations } from 'src/api';
import AvailableTranslation from 'types/AvailableTranslation';

const TranslationsAdjustment = () => {
  const dispatch = useDispatch();
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const { lang } = useTranslation();
  const [translations, setTranslations] = useState<AvailableTranslation[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    getAvailableTranslations(lang)
      .then((res) => {
        // if there is an internal server error.
        if (res.status === 500) {
          setHasError(true);
        } else {
          setTranslations(res.translations);
        }
      })
      .catch(() => {
        setHasError(true);
      });
  }, [lang]);

  if (hasError) {
    return null;
  }

  /**
   * Handle when an item(s) get selected or un-selected.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e
   */
  const onSelectedTranslationsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // extract the selected translation IDs
    const selectedTranslationsIDs = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value),
    );
    dispatch({
      type: setSelectedTranslations.type,
      payload: { translations: selectedTranslationsIDs, locale: lang },
    });
  };

  return (
    <div>
      Selected translations{' '}
      <button type="button" onClick={() => setIsExpanded((prevIsExpanded) => !prevIsExpanded)}>
        <p>{isExpanded ? 'Hide' : 'Show'} Translations</p>
      </button>
      {isExpanded && (
        <select
          name="translations"
          multiple
          className={styles.styledSelect}
          onChange={onSelectedTranslationsChange}
          defaultValue={numbersToStringsArray(selectedTranslations)}
        >
          {translations.map((translation) => (
            <option key={translation.id} value={translation.id}>
              {translation.translatedName.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default TranslationsAdjustment;
