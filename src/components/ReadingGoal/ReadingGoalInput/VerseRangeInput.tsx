/* eslint-disable max-lines */
import { useContext, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingGoalInput.module.scss';

import DataContext from '@/contexts/DataContext';
import Combobox from '@/dls/Forms/Combobox';
import ComboboxSize from '@/dls/Forms/Combobox/types/ComboboxSize';
import { RangeItem, RangeItemPosition } from '@/types/Range';
import { generateChapterOptions, generateVerseOptions } from '@/utils/generators';
import { getChapterNumberFromKey, getVerseNumberFromKey, makeVerseKey } from '@/utils/verse';

interface VerseRangesInputProps {
  rangeStartVerse?: string;
  rangeEndVerse?: string;
  onRangeChange: (range: { startVerse: string | null; endVerse: string | null }) => void;

  logChange?: (
    field: 'start_verse' | 'end_verse',
    data: { currentValue: string | null; newValue: string | null },
    extraData?: {
      chapter: string | null;
      verse: string | null;
    },
  ) => void;
}

const VerseRangeInput = ({
  rangeStartVerse,
  rangeEndVerse,
  onRangeChange,
  logChange,
}: VerseRangesInputProps) => {
  const { t, lang } = useTranslation('reading-goal');
  const chaptersData = useContext(DataContext);

  const [startChapter, setStartChapter] = useState<string>(
    rangeStartVerse ? getChapterNumberFromKey(rangeStartVerse).toString() : undefined,
  );

  const [endChapter, setEndChapter] = useState<string>(
    rangeEndVerse ? getChapterNumberFromKey(rangeEndVerse).toString() : undefined,
  );

  const chapterOptions = useMemo(
    () => generateChapterOptions(chaptersData, lang),
    [chaptersData, lang],
  );

  const startingVerseOptions = useMemo(
    () => generateVerseOptions(chaptersData, t, lang, startChapter),
    [t, lang, chaptersData, startChapter],
  );

  const endingVerseOptions = useMemo(
    () => generateVerseOptions(chaptersData, t, lang, endChapter),
    [t, lang, chaptersData, endChapter],
  );

  // useEffect(() => {
  //   if (!rangeStartVerse) {
  //     setStartChapter(undefined);
  //   }
  // }, [rangeStartVerse]);

  // useEffect(() => {
  //   if (!rangeEndVerse) {
  //     setEndChapter(undefined);
  //   }
  // }, [rangeEndVerse]);

  const endingVerse = useMemo(() => {
    if (!rangeEndVerse) return undefined;
    return getVerseNumberFromKey(rangeEndVerse).toString();
  }, [rangeEndVerse]);

  const startingVerse = useMemo(() => {
    if (!rangeStartVerse) return undefined;
    return getVerseNumberFromKey(rangeStartVerse).toString();
  }, [rangeStartVerse]);

  // eslint-disable-next-line react-func/max-lines-per-function
  const onChapterChange = (chapterPosition: RangeItemPosition) => (chapterId: string) => {
    const isStartChapter = chapterPosition === RangeItemPosition.Start;
    const oldChapterId = isStartChapter ? startChapter : endChapter;
    const setChapter = isStartChapter ? setStartChapter : setEndChapter;

    if (!chapterId || chapterId !== oldChapterId) {
      onRangeChange(
        isStartChapter
          ? { startVerse: null, endVerse: rangeEndVerse }
          : {
              startVerse: rangeStartVerse,
              endVerse: null,
            },
      );
    }

    // if the current value is null, we don't need to log it
    const currentVerse = isStartChapter ? rangeStartVerse : rangeEndVerse;
    if (currentVerse && logChange) {
      logChange(
        isStartChapter ? 'start_verse' : 'end_verse',
        {
          currentValue: currentVerse,
          newValue: null,
        },
        {
          chapter: chapterId || null,
          verse: (isStartChapter ? startingVerse : endingVerse) || null,
        },
      );
    }

    if (!chapterId) {
      setChapter(undefined);
    } else {
      setChapter(chapterId);
    }
  };

  const startChapterOptions = useMemo(() => {
    if (!endChapter) return chapterOptions;

    const endChapterIdx = Number(endChapter) - 1;

    return chapterOptions.slice(0, endChapterIdx + 1);
  }, [chapterOptions, endChapter]);

  const endChapterOptions = useMemo(() => {
    if (!startChapter) return chapterOptions;

    const startChapterIdx = Number(startChapter) - 1;

    return chapterOptions.slice(startChapterIdx);
  }, [chapterOptions, startChapter]);

  const onVerseChange = (versePosition: RangeItemPosition) => (verseId: string) => {
    const isStartVerse = versePosition === RangeItemPosition.Start;

    const newVerseKey = verseId
      ? makeVerseKey(isStartVerse ? startChapter : endChapter, verseId)
      : null;

    onRangeChange(
      isStartVerse
        ? { startVerse: newVerseKey, endVerse: rangeEndVerse }
        : {
            startVerse: rangeStartVerse,
            endVerse: newVerseKey,
          },
    );

    if (logChange) {
      logChange(
        isStartVerse ? 'start_verse' : 'end_verse',
        {
          currentValue: isStartVerse ? rangeStartVerse : rangeEndVerse,
          newValue: newVerseKey,
        },
        {
          chapter: (isStartVerse ? startChapter : endChapter) || null,
          verse: verseId || null,
        },
      );
    }
  };

  const getInitialInputValue = (inputType: RangeItem) => {
    if (inputType === RangeItem.StartingChapter || inputType === RangeItem.EndingChapter) {
      const chapterId = inputType === RangeItem.StartingChapter ? startChapter : endChapter;
      if (!chapterId) return undefined;

      return chapterOptions[Number(chapterId) - 1]?.label;
    }

    const verseId = inputType === RangeItem.StartingVerse ? startingVerse : endingVerse;
    if (!verseId) return '';

    const verseOptions =
      inputType === RangeItem.StartingVerse ? startingVerseOptions : endingVerseOptions;
    return verseOptions[Number(verseId) - 1]?.label;
  };

  return (
    <>
      <div className={styles.rangeInputContainer}>
        <div>
          <Combobox
            id="start-chapter"
            size={ComboboxSize.Large}
            fixedWidth={false}
            label={<p className={styles.label}>{t('starting-chapter')}</p>}
            items={startChapterOptions}
            value={startChapter}
            initialInputValue={getInitialInputValue(RangeItem.StartingChapter)}
            onChange={onChapterChange(RangeItemPosition.Start)}
          />
        </div>

        <div>
          <Combobox
            id="starting-verse"
            size={ComboboxSize.Large}
            fixedWidth={false}
            disabled={!startChapter}
            label={<p className={styles.label}>{t('starting-verse')}</p>}
            items={startingVerseOptions}
            value={startingVerse}
            initialInputValue={getInitialInputValue(RangeItem.StartingVerse)}
            onChange={onVerseChange(RangeItemPosition.Start)}
          />
        </div>
      </div>
      <div className={styles.rangeInputContainer}>
        <div>
          <Combobox
            id="end-chapter"
            size={ComboboxSize.Large}
            fixedWidth={false}
            label={<p className={styles.label}>{t('ending-chapter')}</p>}
            items={endChapterOptions}
            value={endChapter}
            initialInputValue={getInitialInputValue(RangeItem.EndingChapter)}
            onChange={onChapterChange(RangeItemPosition.End)}
          />
        </div>

        <div>
          <Combobox
            id="end-verse"
            size={ComboboxSize.Large}
            fixedWidth={false}
            label={<p className={styles.label}>{t('ending-verse')}</p>}
            items={endingVerseOptions}
            value={endingVerse}
            disabled={!endChapter}
            initialInputValue={getInitialInputValue(RangeItem.EndingVerse)}
            onChange={onVerseChange(RangeItemPosition.End)}
          />
        </div>
      </div>
    </>
  );
};

export default VerseRangeInput;
