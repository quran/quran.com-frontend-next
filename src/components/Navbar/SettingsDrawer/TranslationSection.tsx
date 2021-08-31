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
  TranslationsSettings,
} from 'src/redux/slices/QuranReader/translations';
import { numbersToStringsArray, stringsToNumbersArray } from 'src/utils/array';
import { throwIfError } from 'src/utils/error';
import useSWR from 'swr';

import { Section, SectionLabel, SectionRow, SectionTitle } from './Section';

// convert translations data (from API) to combobox items
// so we can use Combobox component
const translationsToComboboxItems = (translations) =>
  translations.map((item) => ({
    id: item.id.toString(),
    value: item.id,
    label: item.name.toString(),
    name: item.id.toString(),
  }));

const TranslationSection = () => {
  const dispatch = useDispatch();
  const { selectedTranslations } = useSelector(selectTranslations) as TranslationsSettings;
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { translationFontScale } = quranReaderStyles;
  const { lang } = useTranslation();

  const { data: translations, error } = useSWR(`/translations/${lang}`, () =>
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
      <SectionTitle>Translation</SectionTitle>
      <SectionRow>
        <SectionLabel>Translation</SectionLabel>
        <Combobox
          id="translations"
          items={items || []}
          isMultiSelect
          size={ComboboxSize.Medium}
          value={numbersToStringsArray(selectedTranslations)}
          onChange={(values) =>
            dispatch(setSelectedTranslations(stringsToNumbersArray(values as string[])))
          }
        />
      </SectionRow>
      <SectionRow>
        <SectionLabel>Translation</SectionLabel>

        {/* we want to disable onIncrement, when current translationFontScale is MAXIMUM_FONT_STEP
            we do it by giving onIncrement props a null
            same for onDecrement */}
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
      </SectionRow>
    </Section>
  );
};
export default TranslationSection;
