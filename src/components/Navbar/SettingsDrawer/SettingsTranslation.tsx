import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import BackIcon from '../../../../public/icons/west.svg';

import styles from './SettingsTranslation.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Button from 'src/components/dls/Button/Button';
import {
  selectSelectedTranslations,
  setSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { TranslationsResponse } from 'types/ApiResponses';

const SettingsTranslation = ({ onBack }) => {
  const dispatch = useDispatch();
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const { lang } = useTranslation();

  // TODO: there's a bug from previous version, where the TranslationView sometime not updated when selectedTranslations is updated
  const onTranslationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTranslationId = e.target.value;

    // when the checkbox is checked
    // add the selectedTranslationId to redux
    // if unchecked, remove it from redux
    const nextTranslations = e.target.checked
      ? [...selectedTranslations, Number(selectedTranslationId)]
      : selectedTranslations.filter((id) => id !== Number(selectedTranslationId)); // remove the id

    dispatch(setSelectedTranslations(nextTranslations));
  };

  return (
    <div>
      <div className={styles.titleContainer}>
        <Button prefix={<BackIcon />} onClick={onBack}>
          Back
        </Button>
      </div>

      <DataFetcher
        queryKey={makeTranslationsUrl(lang)}
        render={(data: TranslationsResponse) => {
          const translationByLanguages = groupBy(data.translations, 'languageName');
          return (
            <div>
              {Object.entries(translationByLanguages).map(([language, translations]) => {
                return (
                  <div>
                    <div className={styles.language}>{language}</div>
                    {translations.map((translation) => (
                      <div key={translation.id} className={styles.translation}>
                        <input
                          id={translation.id.toString()}
                          type="checkbox"
                          value={translation.id}
                          checked={selectedTranslations.includes(translation.id)}
                          onChange={onTranslationsChange}
                        />
                        <label htmlFor={translation.id.toString()}>{translation.authorName}</label>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
};

export default SettingsTranslation;
