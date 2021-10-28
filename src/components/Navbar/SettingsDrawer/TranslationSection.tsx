import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Section from './Section';
import styles from './TranslationSection.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Counter from 'src/components/dls/Counter/Counter';
import Combobox from 'src/components/dls/Forms/Combobox';
import { DropdownItem } from 'src/components/dls/Forms/Combobox/ComboboxItem';
import ComboboxSize from 'src/components/dls/Forms/Combobox/types/ComboboxSize';
import {
  decreaseTranslationFontScale,
  increaseTranslationFontScale,
  MAXIMUM_FONT_STEP,
  MINIMUM_FONT_STEP,
  QuranReaderStyles,
  selectQuranReaderStyles,
} from 'src/redux/slices/QuranReader/styles';
import {
  selectSelectedTranslations,
  setSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from 'src/utils/apiPaths';
import { areArraysEqual, numbersToStringsArray, stringsToNumbersArray } from 'src/utils/array';
import { getTranslatedLabelWithLanguage } from 'src/utils/input';
import { TranslationsResponse } from 'types/ApiResponses';
import AvailableTranslation from 'types/AvailableTranslation';

// convert translations data (from API) to combobox items
// so we can use Combobox component
const translationsToComboboxItems = (translations: AvailableTranslation[]): DropdownItem[] =>
  translations.map((item) => {
    const stringId = item.id.toString();
    return {
      id: stringId,
      value: stringId,
      label: getTranslatedLabelWithLanguage(item),
      name: stringId,
    };
  });

const TranslationSection = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { translationFontScale } = quranReaderStyles;
  const { lang } = useTranslation();

  const onTranslationsChange = useCallback(
    (values) => dispatch(setSelectedTranslations(stringsToNumbersArray(values as string[]))),
    [dispatch],
  );

  return (
    <div className={styles.container}>
      <DataFetcher
        queryKey={makeTranslationsUrl(lang)}
        render={(data: TranslationsResponse) => (
          <Section>
            <Section.Title>{t('translation')}</Section.Title>
            <Section.Row>
              <Section.Label>{t('translation')}</Section.Label>
              <div>
                <Combobox
                  id="translations"
                  items={data ? translationsToComboboxItems(data.translations) : []}
                  isMultiSelect
                  size={ComboboxSize.Medium}
                  value={numbersToStringsArray(selectedTranslations)}
                  onChange={onTranslationsChange}
                />
              </div>
            </Section.Row>
            <Section.Row>
              <Section.Label>{t('fonts.font-size')}</Section.Label>

              {/* disable `onIncrement` function and UI, when translationFontScale is MAXIMUM_FONT_SCALE
            we do this by giving null to `onIncrement` prop
            same applies to `onDecrement` */}
              <Counter
                count={translationFontScale}
                onIncrement={
                  MAXIMUM_FONT_STEP === translationFontScale
                    ? null
                    : () => dispatch(increaseTranslationFontScale())
                }
                onDecrement={
                  MINIMUM_FONT_STEP === translationFontScale
                    ? null
                    : () => dispatch(decreaseTranslationFontScale())
                }
              />
            </Section.Row>
          </Section>
        )}
      />
    </div>
  );
};
export default TranslationSection;
