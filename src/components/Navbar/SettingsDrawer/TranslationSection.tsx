import { useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getAvailableTranslations } from 'src/api';
import Counter from 'src/components/dls/Counter/Counter';
import Combobox from 'src/components/dls/Forms/Combobox';
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
  selectTranslations,
  setSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { numbersToStringsArray, stringsToNumbersArray } from 'src/utils/array';
import { throwIfError } from 'src/utils/error';
import useSWR from 'swr';
import { makeTranslationsUrl } from 'src/utils/apiPaths';
import { getTranslatedLabelWithLanguage } from 'src/utils/input';
import { DropdownItem } from 'src/components/dls/Forms/Combobox/ComboboxItem';
import AvailableTranslation from 'types/AvailableTranslation';
import Section from './Section';

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
  const dispatch = useDispatch();
  const { selectedTranslations } = useSelector(selectTranslations, shallowEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { translationFontScale } = quranReaderStyles;
  const { lang } = useTranslation();

  const onTranslationsChange = useCallback(
    (values) => dispatch(setSelectedTranslations(stringsToNumbersArray(values as string[]))),
    [dispatch],
  );

  const { data: translations, error } = useSWR(makeTranslationsUrl(lang), () =>
    getAvailableTranslations(lang).then((res) => {
      throwIfError(res);
      return res.translations;
    }),
  );

  if (error || !translations) {
    return null;
  }

  const items = translationsToComboboxItems(translations);

  return (
    <Section>
      <Section.Title>Translation</Section.Title>
      <Section.Row>
        <Section.Label>Translation</Section.Label>
        <div>
          <Combobox
            id="translations"
            items={items || []}
            isMultiSelect
            size={ComboboxSize.Medium}
            value={numbersToStringsArray(selectedTranslations)}
            onChange={onTranslationsChange}
          />
        </div>
      </Section.Row>
      <Section.Row>
        <Section.Label>Font size</Section.Label>

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
  );
};
export default TranslationSection;
