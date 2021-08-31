import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import { getTafsirs } from 'src/api';
import Combobox from 'src/components/dls/Forms/Combobox';
import {
  selectTafsirs,
  setSelectedTafsirs,
  TafsirsSettings,
} from 'src/redux/slices/QuranReader/tafsirs';
import { throwIfError } from 'src/utils/error';
import useSWR from 'swr';
import { numbersToStringsArray, stringsToNumbersArray } from 'src/utils/array';
import { SectionLabel, SectionRow, SectionTitle, Section } from './Section';

// convert translations data (from API) to combobox items structure
// so use it with Combobox component
const tafsirsToComboboxItems = (translations) =>
  translations.map((item) => ({
    id: item.id.toString(),
    value: item.id,
    label: item.name.toString(),
    name: item.id.toString(),
  }));

const TafsirSection = () => {
  const dispatch = useDispatch();
  const { selectedTafsirs } = useSelector(selectTafsirs) as TafsirsSettings;
  const { lang } = useTranslation();

  const { data: tafsirs, error } = useSWR(`/tafsirs/${lang}`, () =>
    getTafsirs(lang).then((res) => {
      throwIfError(res);
      return res.tafsirs;
    }),
  );

  if (!tafsirs || error) return null;

  const items = tafsirsToComboboxItems(tafsirs);

  return (
    <Section>
      <SectionTitle>Tafsir</SectionTitle>
      <SectionRow>
        <SectionLabel>Tafsir</SectionLabel>
        <Combobox
          id="tafsir"
          isMultiSelect
          items={items}
          onChange={(values) =>
            dispatch(setSelectedTafsirs(stringsToNumbersArray(values as string[])))
          }
          value={numbersToStringsArray(selectedTafsirs)}
        />
      </SectionRow>
    </Section>
  );
};

export default TafsirSection;
