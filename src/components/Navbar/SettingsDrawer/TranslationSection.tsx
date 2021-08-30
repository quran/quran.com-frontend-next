import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableTranslations } from 'src/api';
import Combobox from 'src/components/dls/Forms/Combobox';
import ComboboxSize from 'src/components/dls/Forms/Combobox/types/ComboboxSize';
import {
  selectTranslations,
  setSelectedTranslations,
  TranslationsSettings,
} from 'src/redux/slices/QuranReader/translations';
import { numbersToStringsArray, stringsToNumbersArray } from 'src/utils/array';
import { throwIfError } from 'src/utils/error';
import useSWR from 'swr';
import { Section, SectionLabel, SectionRow, SectionTitle } from './Section';

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
  const { lang } = useTranslation();

  const { data: translations, error } = useSWR(`get-translations/${lang}`, () =>
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
    </Section>
  );
};
export default TranslationSection;
