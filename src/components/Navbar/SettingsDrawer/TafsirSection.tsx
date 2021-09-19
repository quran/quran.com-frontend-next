import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Section from './Section';
import styles from './TafsirSection.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Counter from 'src/components/dls/Counter/Counter';
import Combobox from 'src/components/dls/Forms/Combobox';
import { DropdownItem } from 'src/components/dls/Forms/Combobox/ComboboxItem';
import {
  MAXIMUM_FONT_STEP,
  MINIMUM_FONT_STEP,
  QuranReaderStyles,
  selectQuranReaderStyles,
  increaseTafsirFontScale,
  decreaseTafsirFontScale,
} from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTafsirs, setSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import { makeTafsirsUrl } from 'src/utils/apiPaths';
import { areArraysEqual, numbersToStringsArray, stringsToNumbersArray } from 'src/utils/array';
import { getTranslatedLabelWithLanguage } from 'src/utils/input';
import { TafsirsResponse } from 'types/ApiResponses';
import TafsirInfo from 'types/TafsirInfo';

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
  const selectedTafsirs = useSelector(selectSelectedTafsirs, areArraysEqual);
  const { lang } = useTranslation();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { tafsirFontScale } = quranReaderStyles;

  const onTafsirsChange = useCallback(
    (values) => dispatch(setSelectedTafsirs(stringsToNumbersArray(values as string[]))),
    [dispatch],
  );

  return (
    <div className={styles.container}>
      <DataFetcher
        queryKey={makeTafsirsUrl(lang)}
        render={(data: TafsirsResponse) => (
          <Section>
            <Section.Title>Tafsir</Section.Title>
            <Section.Row>
              <Section.Label>Tafsir</Section.Label>
              <div>
                <Combobox
                  minimumRequiredItems={1}
                  id="tafsir"
                  isMultiSelect
                  items={data ? tafsirsToComboboxItems(data.tafsirs) : []}
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
                  tafsirFontScale === MINIMUM_FONT_STEP
                    ? null
                    : () => dispatch(decreaseTafsirFontScale())
                }
                onIncrement={
                  tafsirFontScale === MAXIMUM_FONT_STEP
                    ? null
                    : () => dispatch(increaseTafsirFontScale())
                }
              />
            </Section.Row>
          </Section>
        )}
      />
    </div>
  );
};

export default TafsirSection;
