import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';
import {
  // shallowEqual,
  useDispatch,
  useSelector,
} from 'react-redux';

import DataFetcher from 'src/components/DataFetcher';
import Button from 'src/components/dls/Button/Button';
// import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import {
  selectSelectedTranslations,
  setSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { TranslationsResponse } from 'types/ApiResponses';

const SettingsTranslation = ({ onBack }) => {
  // const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  // const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  // // const { translationFontScale } = quranReaderStyles;
  const { lang } = useTranslation();

  // TODO: there's a bug from previous version, where the TranslationView sometime not updated when selectedTranslations is updated
  const onTranslationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const translationId = e.target.value;
    const nextTranslations = e.target.checked
      ? [...selectedTranslations, Number(translationId)]
      : selectedTranslations.filter((id) => id !== Number(translationId)); // remove the id

    dispatch(setSelectedTranslations(nextTranslations));
  };

  return (
    <div>
      <Button onClick={onBack}>Back</Button>

      <DataFetcher
        queryKey={makeTranslationsUrl(lang)}
        render={(data: TranslationsResponse) => {
          const translationByLanguages = groupBy(data.translations, 'languageName');
          return (
            <div>
              {Object.entries(translationByLanguages).map(([language, translations]) => {
                return (
                  <div>
                    <div style={{ textTransform: 'capitalize' }}>{language}</div>
                    {translations.map((translation) => (
                      <div key={translation.id}>
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
