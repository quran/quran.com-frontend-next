/* eslint-disable max-lines */
import { useContext, useMemo, useState } from 'react';

import { Translate } from 'next-translate';
import useTranslation from 'next-translate/useTranslation';

import { ReadingGoalPeriod, ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import styles from './ReadingGoalPage.module.scss';

import DataContext from '@/contexts/DataContext';
import Combobox from '@/dls/Forms/Combobox';
import { DropdownItem } from '@/dls/Forms/Combobox/ComboboxItem';
import ComboboxSize from '@/dls/Forms/Combobox/types/ComboboxSize';
import Input, { InputSize } from '@/dls/Forms/Input';
import Select, { SelectOption, SelectSize } from '@/dls/Forms/Select';
import { ReadingGoalType } from '@/types/auth/ReadingGoal';
import { getChapterData } from '@/utils/chapter';
import { secondsToReadableFormat } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';

const generateDaysOptions = (t: Translate, locale: string) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const options: SelectOption[] = new Array(90).fill(null).map((_, i) => {
    const day = i + 1;
    return {
      value: day.toString(),
      label: t('x-days', { count: day, days: toLocalizedNumber(day, locale) }),
    };
  });

  return options;
};

const generateTimeOptions = (t: Translate, locale: string) => {
  // for the first 10 minutes, we want to show 1 until 10
  // but after that, we want to increment by 5 minutes
  // and our limit is 4 hours
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const options: SelectOption[] = new Array(56).fill(null).map((_, i) => {
    let minutes: number;

    if (i < 10) {
      minutes = i + 1;
    } else {
      minutes = (i - 9) * 5 + 10;
    }

    const seconds = minutes * 60;

    return {
      value: seconds,
      label: secondsToReadableFormat(seconds, t, locale),
    };
  });

  return options;
};

const ReadingGoalTargetAmountTab: React.FC<ReadingGoalTabProps> = ({ state, dispatch, nav }) => {
  const { t, lang } = useTranslation('reading-goal');
  const chaptersData = useContext(DataContext);
  const { type, period, pages, seconds, rangeStartVerse, rangeEndVerse, duration } = state;
  const [startChapter, setStartChapter] = useState<string>(
    rangeStartVerse ? rangeStartVerse.split(':')[0] : undefined,
  );
  const [endChapter, setEndChapter] = useState<string>(
    rangeEndVerse ? rangeEndVerse.split(':')[0] : undefined,
  );

  const dayOptions = useMemo(() => generateDaysOptions(t, lang), [t, lang]);
  const timeOptions = useMemo(() => generateTimeOptions(t, lang), [t, lang]);

  const chapterOptions = useMemo(() => {
    const data: DropdownItem[] = Object.keys(chaptersData).map((chapterId) => {
      const chapter = getChapterData(chaptersData, chapterId);
      const localizedChapterId = toLocalizedNumber(parseInt(chapterId, 10), lang);

      return {
        id: chapterId,
        name: chapterId,
        value: chapterId,
        label: `${localizedChapterId} - ${chapter.transliteratedName}`,
      };
    });

    return data;
  }, [chaptersData, lang]);

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

  const startingVerseOptions = useMemo(() => {
    if (!startChapter) return [];

    const chapter = getChapterData(chaptersData, startChapter);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const options: DropdownItem[] = new Array(chapter.versesCount).fill(null).map((_, index) => {
      const localizedVerseId = toLocalizedNumber(index + 1, lang);
      const verseId = String(index + 1);

      return {
        id: verseId,
        name: verseId,
        value: verseId,
        label: `${t('common:verse')} ${localizedVerseId}`,
      };
    });

    return options;
  }, [t, lang, chaptersData, startChapter]);

  const endingVerseOptions = useMemo(() => {
    if (!endChapter) return [];

    const chapter = getChapterData(chaptersData, endChapter);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const options: DropdownItem[] = new Array(chapter.versesCount).fill(null).map((_, index) => {
      const localizedVerseId = toLocalizedNumber(index + 1, lang);
      const verseId = String(index + 1);

      return {
        id: verseId,
        name: verseId,
        value: verseId,
        label: `${t('common:verse')} ${localizedVerseId}`,
      };
    });

    return options;
  }, [t, lang, chaptersData, endChapter]);

  const endingVerse = useMemo(() => {
    if (!rangeEndVerse) return undefined;
    return rangeEndVerse.split(':')[1];
  }, [rangeEndVerse]);

  const startingVerse = useMemo(() => {
    if (!rangeStartVerse) return undefined;
    return rangeStartVerse.split(':')[1];
  }, [rangeStartVerse]);

  const onChapterChange = (chapterType: 'start' | 'end') => (chapterId: string) => {
    const oldChapterId = chapterType === 'start' ? startChapter : endChapter;
    const setChapter = chapterType === 'start' ? setStartChapter : setEndChapter;

    if (!chapterId || chapterId !== oldChapterId) {
      dispatch({
        type: 'SET_RANGE',
        payload: {
          ...(chapterType === 'start'
            ? { startVerse: null, endVerse: rangeEndVerse }
            : {
                startVerse: rangeStartVerse,
                endVerse: null,
              }),
        },
      });
    }

    if (!chapterId) {
      setChapter(undefined);
    } else {
      setChapter(chapterId);
    }
  };

  const onVerseChange = (verseType: 'start' | 'end') => (verseId: string) => {
    const newRange =
      verseType === 'start' ? `${startChapter}:${verseId}` : `${endChapter}:${verseId}`;

    dispatch({
      type: 'SET_RANGE',
      payload: {
        ...(verseType === 'start'
          ? { startVerse: newRange, endVerse: rangeEndVerse }
          : {
              startVerse: rangeStartVerse,
              endVerse: newRange,
            }),
      },
    });
  };

  const getInitialInputValue = (
    inputType: 'start-chapter' | 'start-verse' | 'end-chapter' | 'end-verse',
  ) => {
    if (inputType === 'start-chapter' || inputType === 'end-chapter') {
      const chapterId = inputType === 'start-chapter' ? startChapter : endChapter;
      if (!chapterId) return undefined;

      return chapterOptions[Number(chapterId) - 1]?.label;
    }

    // inputType === 'start-verse' || inputType === 'end-verse'
    const verseId = inputType === 'start-verse' ? startingVerse : endingVerse;
    if (!verseId) return '';

    const verseOptions = inputType === 'start-verse' ? startingVerseOptions : endingVerseOptions;
    return verseOptions[Number(verseId) - 1]?.label;
  };

  const getInput = () => {
    if (type === ReadingGoalType.RANGE) {
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
                initialInputValue={getInitialInputValue('start-chapter')}
                onChange={onChapterChange('start')}
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
                initialInputValue={getInitialInputValue('start-verse')}
                onChange={onVerseChange('start')}
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
                initialInputValue={getInitialInputValue('end-chapter')}
                onChange={onChapterChange('end')}
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
                initialInputValue={getInitialInputValue('end-verse')}
                onChange={onVerseChange('end')}
              />
            </div>
          </div>
        </>
      );
    }

    if (type === ReadingGoalType.PAGES) {
      return (
        <div className={styles.inputContainer}>
          <label htmlFor="pages" className={styles.label}>
            {t('goal-types.pages.title')}
          </label>
          <Input
            id="pages"
            containerClassName={styles.input}
            size={InputSize.Large}
            value={pages.toString()}
            fixedWidth={false}
            htmlType="number"
            onChange={(p) => {
              const parsedPages = Number(p);
              dispatch({ type: 'SET_PAGES', payload: { pages: parsedPages } });
            }}
          />
        </div>
      );
    }

    return (
      <div className={styles.inputContainer}>
        <label htmlFor="seconds" className={styles.label}>
          {t('goal-types.time.title')}
        </label>
        <Select
          id="seconds"
          name="seconds"
          size={SelectSize.Large}
          className={styles.input}
          options={timeOptions}
          value={seconds.toString()}
          onChange={(s) => dispatch({ type: 'SET_SECONDS', payload: { seconds: Number(s) } })}
        />
      </div>
    );
  };

  return (
    <>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{t('goal-target.title')}</h1>
        <p className={styles.subtitle}>{t('goal-target.description')}</p>
      </div>
      <div className={styles.optionsContainer}>
        {getInput()}
        {period === ReadingGoalPeriod.Continuous && (
          <div className={styles.inputContainer}>
            <label htmlFor="duration" className={styles.label}>
              {t('duration')}
            </label>
            <Select
              id="duration"
              name="duration"
              size={SelectSize.Large}
              className={styles.input}
              options={dayOptions}
              value={duration.toString()}
              onChange={(d) => dispatch({ type: 'SET_DURATION', payload: { duration: Number(d) } })}
            />
          </div>
        )}
        {nav}
      </div>
    </>
  );
};

export default ReadingGoalTargetAmountTab;
