import { useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getTafsirs } from 'src/api';
import Combobox from 'src/components/dls/Forms/Combobox';
import {
  selectTafsirs,
  setSelectedTafsirs,
  TafsirsSettings,
} from 'src/redux/slices/QuranReader/tafsirs';
import { throwIfError } from 'src/utils/error';
import useSWR from 'swr';
import { areArraysEquals, numbersToStringsArray, stringsToNumbersArray } from 'src/utils/array';
import {
  MAXIMUM_FONT_STEP,
  MINIMUM_FONT_STEP,
  QuranReaderStyles,
  selectQuranReaderStyles,
  increaseTafsirFontScale,
  decreaseTafsirFontScale,
} from 'src/redux/slices/QuranReader/styles';
import Counter from 'src/components/dls/Counter/Counter';
import { getTranslatedLabelWithLanguage } from 'src/utils/input';
import TafsirInfo from 'types/TafsirInfo';
import { DropdownItem } from 'src/components/dls/Forms/Combobox/ComboboxItem';
import Section from './Section';

// convert tafsir data (from API) to combobox items structure
// so use it with Combobox component
const tafsirsToComboboxItems = (tafsirs: TafsirInfo[]): DropdownItem[] =>
  tafsirs.map((item) => {
    const stringId = item.id.toString();
    return {
      id: stringId,
      value: stringId,
      label: getTranslatedLabelWithLanguage(item),
      name: stringId,
    };
  });

const TafsirSection = () => {
  const dispatch = useDispatch();
  const selectedTafsirs = useSelector(selectTafsirs, areArraysEquals) as TafsirsSettings;
  const { lang } = useTranslation();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { tafsirFontScale } = quranReaderStyles;

  const onTafsirsChange = useCallback(
    (values) => dispatch(setSelectedTafsirs(stringsToNumbersArray(values as string[]))),
    [dispatch],
  );

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
      <Section.Title>Tafsir</Section.Title>
      <Section.Row>
        <Section.Label>Tafsir</Section.Label>
        <div>
          <Combobox
            minimumRequiredItems={1}
            id="tafsir"
            isMultiSelect
            items={items}
            onChange={onTafsirsChange}
            value={numbersToStringsArray(selectedTafsirs)}
          />
        </div>
      </Section.Row>
      <Section.Row>
        <Section.Label>Tafsir font size</Section.Label>
        <Counter
          count={tafsirFontScale}
          onDecrement={
            tafsirFontScale === MINIMUM_FONT_STEP ? null : () => dispatch(decreaseTafsirFontScale())
          }
          onIncrement={
            tafsirFontScale === MAXIMUM_FONT_STEP ? null : () => dispatch(increaseTafsirFontScale())
          }
        />
      </Section.Row>
    </Section>
  );
};

export default TafsirSection;
