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
import {
  generateChapterVersesKeys,
  getChapterNumberFromKey,
  getVerseNumberFromKey,
} from '@/utils/verse';

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
  const { lang, t } = useTranslation('quran-media-maker');
  const chaptersData = useContext(DataContext);
  const [rangesError, setRangesError] = useState(null);

  const { verseFrom, verseTo, surah } = mediaSettings;
  const onChapterChange = (newChapter: string) => {
    const keyOfFirstVerseOfNewChapter = `${newChapter}:1`;
    onSettingsUpdate(
      {
        surah: Number(newChapter),
        verseFrom: keyOfFirstVerseOfNewChapter,
        verseTo: keyOfFirstVerseOfNewChapter,
      },
      'surah',
      newChapter,
    );
  };

  const verseKeys = useMemo(() => {
    return generateChapterVersesKeys(chaptersData, String(surah)).map((verseKey) => ({
      id: verseKey,
      name: verseKey,
      value: verseKey,
      label: toLocalizedVerseKey(String(getVerseNumberFromKey(verseKey)), lang),
    }));
  }, [chaptersData, lang, surah]);

  const onVerseRangeChange = (newSelectedVerseKey: string, verseSelectorId: RangeSelectorType) => {
    setRangesError(null);
    const isVerseKeyStartOfRange = verseSelectorId === RangeSelectorType.START;
    const startVerseKey = isVerseKeyStartOfRange ? newSelectedVerseKey : verseFrom;
    const endVerseKey = !isVerseKeyStartOfRange ? newSelectedVerseKey : verseTo;
    const validationError = validateRangeSelection(startVerseKey, endVerseKey, t);
    if (validationError) {
      setRangesError(validationError);
      return false;
    }
    if (isVerseKeyStartOfRange) {
      const isMaxAyahs =
        getVerseNumberFromKey(verseTo) - getVerseNumberFromKey(newSelectedVerseKey) >= 10;

      onSettingsUpdate(
        {
          verseFrom: newSelectedVerseKey,
          verseTo: isMaxAyahs ? newSelectedVerseKey : verseTo,
          surah: getChapterNumberFromKey(newSelectedVerseKey),
        },
        'verseFrom',
        newSelectedVerseKey,
      );
    } else {
      const isMaxAyahs =
        getVerseNumberFromKey(newSelectedVerseKey) - getVerseNumberFromKey(verseFrom) >= 10;

      onSettingsUpdate(
        {
          verseFrom: isMaxAyahs ? newSelectedVerseKey : verseFrom,
          verseTo: newSelectedVerseKey,
          surah: getChapterNumberFromKey(newSelectedVerseKey),
        },
        'verseTo',
        newSelectedVerseKey,
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
            dropdownItems={verseKeys}
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
