/* eslint-disable react-func/max-lines-per-function */
import { FC, useContext, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import ReciterSettings from './ReciterSettings';
import TranslationSettingsSection from './TranslationSectionSetting';
import VersesRangeSelector from './VersesRangeSelector';

import { RangeSelectorType } from '@/components/Verse/AdvancedCopy/SelectorContainer';
import validateRangeSelection from '@/components/Verse/AdvancedCopy/utils/validateRangeSelection';
import DataContext from '@/contexts/DataContext';
import Select, { SelectSize } from '@/dls/Forms/Select';
import Separator from '@/dls/Separator/Separator';
import MediaSettings, { ChangedSettings } from '@/types/Media/MediaSettings';
import Reciter from '@/types/Reciter';
import { toLocalizedVerseKey } from '@/utils/locale';
import { MAX_AYAHS_LIMIT } from '@/utils/validator';
import { generateChapterVersesKeys, getVerseNumberFromKey } from '@/utils/verse';

type AudioTabProps = {
  chaptersList: any[];
  reciters: Reciter[];
  isFetching: boolean;
  mediaSettings: MediaSettings;
  onSettingsUpdate: (settings: ChangedSettings, key?: keyof MediaSettings, value?: any) => void;
};

const AudioTab: FC<AudioTabProps> = ({
  chaptersList,
  reciters,
  isFetching,
  mediaSettings,
  onSettingsUpdate,
}) => {
  const { lang, t } = useTranslation('media');
  const chaptersData = useContext(DataContext);
  const [rangesError, setRangesError] = useState(null);

  const { verseFrom, verseTo, surah } = mediaSettings;
  const onChapterChange = (newChapter: string) => {
    const numberOfFirstVerseOfNewChapter = '1';
    onSettingsUpdate(
      {
        surah: Number(newChapter),
        verseFrom: numberOfFirstVerseOfNewChapter,
        verseTo: numberOfFirstVerseOfNewChapter,
      },
      'surah',
      newChapter,
    );
  };

  const verseNumbers = useMemo(() => {
    return generateChapterVersesKeys(chaptersData, String(surah)).map((verseKey) => {
      const verseNumber = String(getVerseNumberFromKey(verseKey));
      return {
        id: verseNumber,
        name: verseNumber,
        value: verseNumber,
        label: toLocalizedVerseKey(verseNumber, lang),
      };
    });
  }, [chaptersData, lang, surah]);

  const onVerseRangeChange = (
    newSelectedVerseNumber: string,
    verseSelectorId: RangeSelectorType,
  ) => {
    setRangesError(null);
    const isVerseKeyStartOfRange = verseSelectorId === RangeSelectorType.START;
    const startVerseNumber = isVerseKeyStartOfRange ? newSelectedVerseNumber : verseFrom;
    const endVerseNumber = !isVerseKeyStartOfRange ? newSelectedVerseNumber : verseTo;
    const startVerseKey = `${surah}:${startVerseNumber}`;
    const endVerseKey = `${surah}:${endVerseNumber}`;
    const validationError = validateRangeSelection(startVerseKey, endVerseKey, t);
    if (validationError) {
      setRangesError(validationError);
      return false;
    }
    if (isVerseKeyStartOfRange) {
      const isMaxAyahs = Number(verseTo) - Number(newSelectedVerseNumber) >= MAX_AYAHS_LIMIT;

      onSettingsUpdate(
        {
          verseFrom: newSelectedVerseNumber,
          verseTo: isMaxAyahs ? newSelectedVerseNumber : verseTo,
          surah,
        },
        'verseFrom',
        newSelectedVerseNumber,
      );
    } else {
      const isMaxAyahs = Number(newSelectedVerseNumber) - Number(verseFrom) >= MAX_AYAHS_LIMIT;

      onSettingsUpdate(
        {
          verseFrom: isMaxAyahs ? newSelectedVerseNumber : verseFrom,
          verseTo: newSelectedVerseNumber,
          surah,
        },
        'verseTo',
        newSelectedVerseNumber,
      );
    }
    return true;
  };

  return (
    <div className={styles.tabContainer}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          {t('common:ayahs')}
          <div className={styles.label}>{t('max-ayahs')}</div>
        </div>

        <div className={styles.selectContainer}>
          <Select
            id="surah"
            name="surah"
            options={chaptersList || []}
            value={String(surah)}
            onChange={onChapterChange}
            disabled={isFetching}
            size={SelectSize.Medium}
            className={styles.select}
          />

          <VersesRangeSelector
            dropdownItems={verseNumbers}
            rangeStartVerse={verseFrom}
            rangeEndVerse={verseTo}
            onChange={onVerseRangeChange}
            isVisible
            isDisabled={isFetching}
          />
        </div>
        {rangesError && <div className={styles.error}>{rangesError}</div>}
      </div>

      <div className={styles.separatorContainer}>
        <Separator isVertical />
      </div>
      <ReciterSettings
        reciter={mediaSettings.reciter}
        onSettingsUpdate={onSettingsUpdate}
        reciters={reciters}
      />
      <div className={styles.separatorContainer}>
        <Separator isVertical />
      </div>
      <TranslationSettingsSection
        translations={mediaSettings.translations}
        onSettingsUpdate={onSettingsUpdate}
      />
    </div>
  );
};

export default AudioTab;
