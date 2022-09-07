/* eslint-disable i18next/no-literal-string */
import React, { useEffect, useState } from 'react';

import capitalize from 'lodash/capitalize';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './TafsirsAdjustment.module.scss';

import { selectSelectedTafsirs, setSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { areArraysEqual } from '@/utils/array';
import { getTafsirs } from 'src/api';
import TafsirInfo from 'types/TafsirInfo';

const TafsirsAdjustment = () => {
  const dispatch = useDispatch();
  const selectedTafsirs = useSelector(selectSelectedTafsirs, areArraysEqual);
  const { lang } = useTranslation();
  const [tafsirs, setTafsirs] = useState<TafsirInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    getTafsirs(lang)
      .then((res) => {
        // if there is an internal server error.
        if (res.status === 500) {
          setHasError(true);
        } else {
          setTafsirs(res.tafsirs);
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
  const onSelectedTafsirsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // extract the selected tafsir IDs
    const selectedTafsirsIDs = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value),
    );
    dispatch({
      type: setSelectedTafsirs.type,
      payload: { tafsirs: selectedTafsirsIDs, locale: lang },
    });
  };

  return (
    <div>
      Selected tafsirs{' '}
      <button type="button" onClick={() => setIsExpanded((prevIsExpanded) => !prevIsExpanded)}>
        <p>{isExpanded ? 'Hide' : 'Show'} Tafsirs</p>
      </button>
      {isExpanded && (
        <select
          name="tafsirs"
          multiple
          className={styles.select}
          onChange={onSelectedTafsirsChange}
          defaultValue={selectedTafsirs}
        >
          {tafsirs.map((tafsir) => (
            <option key={tafsir.id} value={tafsir.id}>
              {capitalize(tafsir.languageName)} - {tafsir.translatedName.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default TafsirsAdjustment;
