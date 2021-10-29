import { useCallback } from 'react';

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
import { areArraysEqual, stringsToNumbersArray } from 'src/utils/array';
import { TranslationsResponse } from 'types/ApiResponses';

const SettingsTranslation = ({ onBack }) => {
  // const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  // const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  // // const { translationFontScale } = quranReaderStyles;
  const { lang } = useTranslation();

  const onTranslationsChange = useCallback(
    (values) => dispatch(setSelectedTranslations(stringsToNumbersArray(values as string[]))),
    [dispatch],
  );

  return (
    <div>
      <Button onClick={onBack}>Back</Button>

      <DataFetcher
        queryKey={makeTranslationsUrl(lang)}
        render={(data: TranslationsResponse) => (
          <div>
            {data.translations.map((translation) => (
              <div key={translation.id}>
                <input
                  id={translation.id.toString()}
                  type="checkbox"
                  value={translation.name}
                  checked={selectedTranslations.includes(translation.id)}
                  onChange={() => onTranslationsChange([...selectedTranslations, translation.id])}
                />
                <label htmlFor={translation.id.toString()}>{translation.authorName}</label>
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
};

export default SettingsTranslation;
