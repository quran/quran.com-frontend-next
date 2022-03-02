import { useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Section from './Section';
import styles from './TafsirSection.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Counter from 'src/components/dls/Counter/Counter';
import SelectionCard from 'src/components/dls/SelectionCard/SelectionCard';
import Skeleton from 'src/components/dls/Skeleton/Skeleton';
import { setSettingsView, SettingsView } from 'src/redux/slices/navbar';
import {
  MAXIMUM_FONT_STEP,
  MINIMUM_FONT_STEP,
  selectQuranReaderStyles,
  increaseTafsirFontScale,
  decreaseTafsirFontScale,
} from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import { makeTafsirsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { logValueChange } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import { TafsirsResponse } from 'types/ApiResponses';

const TafsirSection = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { tafsirFontScale } = quranReaderStyles;
  const selectedTafsirs = useSelector(selectSelectedTafsirs, areArraysEqual);

  const tafsirLoading = useCallback(
    () => (
      <div>
        {selectedTafsirs.map((id) => (
          <Skeleton key={id}>
            <div>{id}</div>
          </Skeleton>
        ))}
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedTafsirs.length],
  );

  const localizedSelectedTafsirs = useMemo(
    () => toLocalizedNumber(selectedTafsirs.length - 1, lang),
    [selectedTafsirs, lang],
  );

  const onSelectionCardClicked = useCallback(() => {
    dispatch(setSettingsView(SettingsView.Tafsir));
    logValueChange('settings_view', SettingsView.Tafsir, SettingsView.Body);
  }, [dispatch]);
  const renderTafsirs = useCallback(
    (data: TafsirsResponse) => {
      const firstSelectedTafsir = data.tafsirs.find((tafsir) => tafsir.slug === selectedTafsirs[0]);

      let selectedValueString = t('settings.no-tafsir-selected');
      if (selectedTafsirs.length === 1) selectedValueString = firstSelectedTafsir.name;
      if (selectedTafsirs.length === 2)
        selectedValueString = t('settings.value-and-other', {
          value: firstSelectedTafsir.name,
          othersCount: localizedSelectedTafsirs,
        });
      if (selectedTafsirs.length > 2)
        selectedValueString = t('settings.value-and-others', {
          value: firstSelectedTafsir.name,
          othersCount: localizedSelectedTafsirs,
        });

      return (
        <SelectionCard
          label={t('settings.selected-tafsirs')}
          value={selectedValueString}
          onClick={onSelectionCardClicked}
        />
      );
    },
    [t, selectedTafsirs, localizedSelectedTafsirs, onSelectionCardClicked],
  );

  const onFontScaleDecreaseClicked = () => {
    logValueChange('tafsir_font_scale', tafsirFontScale, tafsirFontScale - 1);
    dispatch(decreaseTafsirFontScale());
  };

  const onFontScaleIncreaseClicked = () => {
    logValueChange('tafsir_font_scale', tafsirFontScale, tafsirFontScale + 1);
    dispatch(increaseTafsirFontScale());
  };

  return (
    <div className={styles.container}>
      <Section>
        <Section.Title>{t('tafsir.title')}</Section.Title>
        <Section.Row>
          <DataFetcher
            loading={tafsirLoading}
            queryKey={makeTafsirsUrl(lang)}
            render={renderTafsirs}
          />
        </Section.Row>
        <Section.Row>
          <Section.Label>{t('tafsir.font-size')}</Section.Label>
          <Counter
            count={tafsirFontScale}
            onDecrement={tafsirFontScale === MINIMUM_FONT_STEP ? null : onFontScaleDecreaseClicked}
            onIncrement={tafsirFontScale === MAXIMUM_FONT_STEP ? null : onFontScaleIncreaseClicked}
          />
        </Section.Row>
      </Section>
    </div>
  );
};

export default TafsirSection;
