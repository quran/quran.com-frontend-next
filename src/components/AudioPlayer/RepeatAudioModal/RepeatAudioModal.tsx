/* eslint-disable max-lines */
import { useMemo, useState, useEffect, useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { useSelector as useReduxSelector } from 'react-redux';

import styles from './RepeatAudioModal.module.scss';
import RepeatSetting from './RepeatSetting';
import SelectRepetitionMode, { RepetitionMode } from './SelectRepetitionMode';

import { RangeVerseItem } from '@/components/Verse/AdvancedCopy/SelectorContainer';
import Modal from '@/dls/Modal/Modal';
import Separator from '@/dls/Separator/Separator';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import useGetChaptersData from '@/hooks/useGetChaptersData';
import { selectAudioPlayerState } from '@/redux/slices/AudioPlayer/state';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import {
  generateChapterVersesKeys,
  getChapterFirstAndLastVerseKey,
  getChapterNumberFromKey,
  getVerseNumberFromKey,
  makeVerseKey,
} from '@/utils/verse';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import PreferenceGroup from 'types/auth/PreferenceGroup';

type RepeatAudioModalProps = {
  chapterId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultRepetitionMode: RepetitionMode;
  selectedVerseKey?: string;
};

type VerseRepetitionState = {
  repeatRange: number;
  repeatEachVerse: number;
  from: string;
  to: string;
  delayMultiplier: number;
};

/**
 * Safely parse repeat counter values coming from persisted storage
 * @returns {number} A normalized number value.
 */
const normalizeRepeatValue = (
  value: number | string | null | undefined,
  fallback: number,
): number => {
  if (value === null || value === undefined) return fallback;
  if (value === Infinity || value === 'Infinity') return Infinity;
  if (typeof value === 'string') {
    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? fallback : parsedValue;
  }
  return value;
};

/**
 * Validate that a verse key belongs to a specific chapter
 * @returns {boolean} True if the verse key belongs to the chapter, false otherwise.
 */
const isVerseKeyInChapter = (verseKey: string | undefined, chapterNumber: number) => {
  if (!verseKey) return false;
  return getChapterNumberFromKey(verseKey) === chapterNumber;
};

interface VerseRepetitionDefaultsInput {
  chapterNumber: number;
  firstVerseKeyInChapter: string;
  lastVerseKeyInChapter: string;
  selectedVerseKey?: string;
  audioSurah?: number;
  fromVerseNumberFromActor?: number;
  toVerseNumberFromActor?: number;
  persistedFromVerseKey?: string;
  persistedToVerseKey?: string;
  repeatRangeFromActor?: number;
  repeatEachVerseFromActor?: number;
  delayMultiplierFromActor?: number | string | null;
  persistedRepeatRange?: number | string | null;
  persistedRepeatEachVerse?: number | string | null;
  persistedDelayMultiplier?: number | string | null;
}

interface VerseKeyCalculationInput {
  chapterNumber: number;
  firstVerseKeyInChapter: string;
  lastVerseKeyInChapter: string;
  selectedVerseKey?: string;
  audioSurah?: number;
  fromVerseNumberFromActor?: number;
  toVerseNumberFromActor?: number;
  persistedFromVerseKey?: string;
  persistedToVerseKey?: string;
}

interface RepeatCycleInput {
  repeatRangeFromActor?: number;
  repeatEachVerseFromActor?: number;
  delayMultiplierFromActor?: number | string | null;
  persistedRepeatRange?: number | string | null;
  persistedRepeatEachVerse?: number | string | null;
  persistedDelayMultiplier?: number | string | null;
}

/**
 * Build a verse key for the repeat actor entries if a verse number exists.
 * @returns {string | undefined} The constructed verse key or undefined.
 */
const getActorVerseKey = (
  verseNumber: number | undefined,
  surahNumber: number,
): string | undefined => {
  if (verseNumber === undefined) return undefined;
  return makeVerseKey(surahNumber, verseNumber);
};

interface VerseKeySelectionInput {
  selectedVerseKey?: string;
  actorVerseKey?: string;
  persistedVerseKey?: string;
  fallbackVerseKey: string;
  chapterNumber: number;
}

/**
 * Pick the best verse key from the available sources.
 * @returns {string} The selected verse key.
 */
const pickVerseKey = ({
  selectedVerseKey,
  actorVerseKey,
  persistedVerseKey,
  fallbackVerseKey,
  chapterNumber,
}: VerseKeySelectionInput): string => {
  // Priority 1: Selected verse key
  if (selectedVerseKey) return selectedVerseKey;
  // Priority 2: Actor verse key if it belongs to the chapter
  if (isVerseKeyInChapter(actorVerseKey, chapterNumber)) return actorVerseKey as string;
  // Priority 3: Persisted verse key if it belongs to the chapter
  if (isVerseKeyInChapter(persistedVerseKey, chapterNumber)) return persistedVerseKey as string;
  return fallbackVerseKey;
};

/**
 * Ensure the start verse is always before the end verse. Swap when needed.
 * @returns {{ from: string; to: string }} The new from and to values
 */
const normalizeVerseRange = (fromKey: string, toKey: string) => {
  if (!fromKey || !toKey) {
    return { from: fromKey, to: toKey };
  }
  const fromVerseNumber = getVerseNumberFromKey(fromKey);
  const toVerseNumber = getVerseNumberFromKey(toKey);
  if (
    Number.isNaN(fromVerseNumber) ||
    Number.isNaN(toVerseNumber) ||
    fromVerseNumber <= toVerseNumber
  ) {
    return { from: fromKey, to: toKey };
  }
  return { from: toKey, to: fromKey };
};

/**
 * Determine the effective `from` and `to` verse keys to display in the modal.
 * @returns {{ from: string; to: string }} The effective from and to verse keys.
 */
const getRepeatKeys = ({
  chapterNumber,
  firstVerseKeyInChapter,
  lastVerseKeyInChapter,
  selectedVerseKey,
  audioSurah,
  fromVerseNumberFromActor,
  toVerseNumberFromActor,
  persistedFromVerseKey,
  persistedToVerseKey,
}: VerseKeyCalculationInput) => {
  const fallbackFromKey =
    selectedVerseKey || firstVerseKeyInChapter || makeVerseKey(chapterNumber, 1);
  const fallbackToKey = selectedVerseKey || lastVerseKeyInChapter || makeVerseKey(chapterNumber, 1);
  const repeatSurahNumber = audioSurah ?? chapterNumber;
  const actorFromKey = getActorVerseKey(fromVerseNumberFromActor, repeatSurahNumber);
  const actorToKey = getActorVerseKey(toVerseNumberFromActor, repeatSurahNumber);

  const selectedFromKey = pickVerseKey({
    selectedVerseKey,
    actorVerseKey: actorFromKey,
    persistedVerseKey: persistedFromVerseKey,
    fallbackVerseKey: fallbackFromKey,
    chapterNumber,
  });
  const selectedToKey = pickVerseKey({
    selectedVerseKey,
    actorVerseKey: actorToKey,
    persistedVerseKey: persistedToVerseKey,
    fallbackVerseKey: fallbackToKey,
    chapterNumber,
  });
  return normalizeVerseRange(selectedFromKey, selectedToKey);
};

const getRepeatCycles = ({
  repeatRangeFromActor,
  repeatEachVerseFromActor,
  delayMultiplierFromActor,
  persistedRepeatRange,
  persistedRepeatEachVerse,
  persistedDelayMultiplier,
}: RepeatCycleInput) => ({
  repeatRange: normalizeRepeatValue(
    repeatRangeFromActor,
    normalizeRepeatValue(persistedRepeatRange, 2),
  ),
  repeatEachVerse: normalizeRepeatValue(
    repeatEachVerseFromActor,
    normalizeRepeatValue(persistedRepeatEachVerse, 2),
  ),
  delayMultiplier: normalizeRepeatValue(
    delayMultiplierFromActor,
    normalizeRepeatValue(persistedDelayMultiplier, 1),
  ),
});

/**
 * Build the initial modal state using the available sources (selection,
 * repeat actor context and persisted preferences).
 * @returns {VerseRepetitionState}
 */
function buildDefaultVerseRepetition({
  chapterNumber,
  firstVerseKeyInChapter,
  lastVerseKeyInChapter,
  selectedVerseKey,
  audioSurah,
  fromVerseNumberFromActor,
  toVerseNumberFromActor,
  persistedFromVerseKey,
  persistedToVerseKey,
  repeatRangeFromActor,
  repeatEachVerseFromActor,
  delayMultiplierFromActor,
  persistedRepeatRange,
  persistedRepeatEachVerse,
  persistedDelayMultiplier,
}: VerseRepetitionDefaultsInput): VerseRepetitionState {
  const { from, to } = getRepeatKeys({
    chapterNumber,
    firstVerseKeyInChapter,
    lastVerseKeyInChapter,
    selectedVerseKey,
    audioSurah,
    fromVerseNumberFromActor,
    toVerseNumberFromActor,
    persistedFromVerseKey,
    persistedToVerseKey,
  });
  const { repeatRange, repeatEachVerse, delayMultiplier } = getRepeatCycles({
    repeatRangeFromActor,
    repeatEachVerseFromActor,
    delayMultiplierFromActor,
    persistedRepeatRange,
    persistedRepeatEachVerse,
    persistedDelayMultiplier,
  });

  return {
    repeatRange,
    repeatEachVerse,
    from,
    to,
    delayMultiplier,
  };
}

const RepeatAudioModal = ({
  chapterId,
  isOpen,
  onClose,
  defaultRepetitionMode,
  selectedVerseKey,
}: RepeatAudioModalProps) => {
  const { t, lang } = useTranslation('common');

  const audioService = useContext(AudioPlayerMachineContext);
  const repeatActor = useXstateSelector(audioService, (state) => state.context.repeatActor);
  const audioSurah = useXstateSelector(audioService, (state) => state.context.surah);
  const repeatActorContext = repeatActor?.getSnapshot()?.context;
  const [repetitionMode, setRepetitionMode] = useState(defaultRepetitionMode);
  const isInRepeatMode = !!repeatActor;
  const chaptersData = useGetChaptersData(lang);
  const {
    actions: { onSettingsChangeWithoutDispatch },
  } = usePersistPreferenceGroup();
  const audioPlayerState = useReduxSelector(selectAudioPlayerState);
  const persistedRepeatSettings = audioPlayerState?.repeatSettings;
  const repeatRangeFromActor = repeatActorContext?.repeatSettings?.totalRangeCycle;
  const repeatEachVerseFromActor = repeatActorContext?.repeatSettings?.totalVerseCycle;
  const delayMultiplierFromActor = repeatActorContext?.delayMultiplier;
  const fromVerseNumberFromActor = repeatActorContext?.fromVerseNumber;
  const toVerseNumberFromActor = repeatActorContext?.toVerseNumber;
  const persistedRepeatRange = persistedRepeatSettings?.repeatRange;
  const persistedRepeatEachVerse = persistedRepeatSettings?.repeatEachVerse;
  const persistedDelayMultiplier = persistedRepeatSettings?.delayMultiplier;
  const persistedFromVerseKey = persistedRepeatSettings?.from;
  const persistedToVerseKey = persistedRepeatSettings?.to;
  const chapterName = useMemo(() => {
    if (!chaptersData) {
      return null;
    }
    const chapterData = getChapterData(chaptersData, chapterId);
    return chapterData?.transliteratedName;
  }, [chapterId, chaptersData]);

  const comboboxVerseItems = useMemo<RangeVerseItem[]>(() => {
    if (!chaptersData) {
      return [];
    }
    const keys = generateChapterVersesKeys(chaptersData, chapterId);

    const initialState = keys.map((chapterVerseKey) => ({
      id: chapterVerseKey,
      name: chapterVerseKey,
      value: chapterVerseKey,
      label: toLocalizedVerseKey(chapterVerseKey, lang),
    }));

    return initialState;
  }, [chapterId, chaptersData, lang]);

  const [firstVerseKeyInThisChapter, lastVerseKeyInThisChapter] = getChapterFirstAndLastVerseKey(
    chaptersData,
    chapterId,
  );

  const parsedChapterNumber = Number.parseInt(chapterId, 10);
  const chapterNumber = Number.isNaN(parsedChapterNumber) ? 1 : parsedChapterNumber;

  const defaultVerseRepetition = useMemo<VerseRepetitionState>(
    () =>
      buildDefaultVerseRepetition({
        chapterNumber,
        firstVerseKeyInChapter: firstVerseKeyInThisChapter,
        lastVerseKeyInChapter: lastVerseKeyInThisChapter,
        selectedVerseKey,
        audioSurah,
        fromVerseNumberFromActor,
        toVerseNumberFromActor,
        persistedFromVerseKey,
        persistedToVerseKey,
        repeatRangeFromActor,
        repeatEachVerseFromActor,
        delayMultiplierFromActor,
        persistedRepeatRange,
        persistedRepeatEachVerse,
        persistedDelayMultiplier,
      }),
    [
      audioSurah,
      chapterNumber,
      firstVerseKeyInThisChapter,
      fromVerseNumberFromActor,
      delayMultiplierFromActor,
      lastVerseKeyInThisChapter,
      persistedDelayMultiplier,
      persistedFromVerseKey,
      persistedRepeatEachVerse,
      persistedRepeatRange,
      persistedToVerseKey,
      repeatEachVerseFromActor,
      repeatRangeFromActor,
      selectedVerseKey,
      toVerseNumberFromActor,
    ],
  );

  const [verseRepetition, setVerseRepetition] =
    useState<VerseRepetitionState>(defaultVerseRepetition);

  useEffect(() => {
    if (!isOpen) return;
    setVerseRepetition(defaultVerseRepetition);
  }, [defaultVerseRepetition, isOpen]);

  const play = (settings: VerseRepetitionState) => {
    const normalizedRange = normalizeVerseRange(settings.from, settings.to);
    const normalizedSettings = { ...settings, ...normalizedRange };
    audioService.send({
      type: 'SET_REPEAT_SETTING',
      delayMultiplier: Number(normalizedSettings.delayMultiplier),
      repeatEachVerse: Number(normalizedSettings.repeatEachVerse),
      from: Number(getVerseNumberFromKey(normalizedSettings.from)),
      to: Number(getVerseNumberFromKey(normalizedSettings.to)),
      repeatRange: Number(normalizedSettings.repeatRange),
      surah: Number(getChapterNumberFromKey(normalizedSettings.from)),
    });
    onClose();
  };

  const onPlayClick = () => {
    logButtonClick('start_repeat_play');
    const normalizedRange = normalizeVerseRange(verseRepetition.from, verseRepetition.to);
    const normalizedSettings = {
      ...verseRepetition,
      ...normalizedRange,
    };
    setVerseRepetition(normalizedSettings);
    onSettingsChangeWithoutDispatch(
      'repeatSettings',
      normalizedSettings,
      PreferenceGroup.AUDIO,
      () => play(normalizedSettings),
    );
  };

  const onCancelClick = () => {
    logButtonClick('repeat_cancel');
    onClose();
  };
  const onStopRepeating = () => {
    logButtonClick('stop_repeating');
    audioService.send({ type: 'REPEAT_FINISHED' });
    onClose();
  };

  const onRepetitionModeChange = (mode: RepetitionMode) => {
    logValueChange('repitition_mode', repetitionMode, mode);
    setVerseRepetition((prevVerseRepetition) => ({
      ...prevVerseRepetition,
      from: mode === RepetitionMode.Single ? selectedVerseKey : firstVerseKeyInThisChapter,
      to: mode === RepetitionMode.Single ? selectedVerseKey : lastVerseKeyInThisChapter,
    }));
    setRepetitionMode(mode);
  };

  const onSingleVerseChange = (verseKey) => {
    logValueChange('repeat_single_verse', verseRepetition.repeatRange, verseKey);
    setVerseRepetition({ ...verseRepetition, from: verseKey, to: verseKey });
  };

  const onRangeChange = (range) => {
    const isFrom = !!range.from;
    const logKey = isFrom ? 'repeat_verse_range_from' : 'repeat_verse_range_to';
    const oldValue = isFrom ? verseRepetition.from : verseRepetition.to;
    const newValue = isFrom ? range.from : range.to;
    logValueChange(logKey, oldValue, newValue);
    const candidateFrom = range.from ?? verseRepetition.from;
    const candidateTo = range.to ?? verseRepetition.to;
    const normalizedRange = normalizeVerseRange(candidateFrom, candidateTo);
    setVerseRepetition({
      ...verseRepetition,
      ...range,
      ...normalizedRange,
    });
  };

  const onRepeatRangeChange = (val) => {
    logValueChange('repeat_play_range', verseRepetition.repeatRange, val);
    setVerseRepetition({ ...verseRepetition, repeatRange: val });
  };

  const onRepeatEachVerseChange = (val) => {
    logValueChange('repeat_verse', verseRepetition.repeatEachVerse, val);
    setVerseRepetition({ ...verseRepetition, repeatEachVerse: val });
  };

  const onDelayMultiplierChange = (val) => {
    logValueChange('repeat_delay_multiplier', verseRepetition.delayMultiplier, val);
    setVerseRepetition({ ...verseRepetition, delayMultiplier: val });
  };

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose} onEscapeKeyDown={onClose}>
      <Modal.Body>
        <Modal.Header>
          <Modal.Title>{t('audio.player.repeat-settings')}</Modal.Title>
          <Modal.Subtitle>{`${t('surah')} ${chapterName}`}</Modal.Subtitle>
        </Modal.Header>
        <div>
          <SelectRepetitionMode
            repetitionMode={repetitionMode}
            rangeEndVerse={verseRepetition.to}
            rangeStartVerse={verseRepetition.from}
            comboboxVerseItems={comboboxVerseItems}
            onRepetitionModeChange={onRepetitionModeChange}
            onSingleVerseChange={onSingleVerseChange}
            onRangeChange={onRangeChange}
            verseKey={verseRepetition.from}
          />
          <div className={styles.separator}>
            <Separator />
          </div>
          <RepeatSetting
            label={t('audio.player.play-range')}
            value={verseRepetition.repeatRange}
            minValue={1}
            infinityThreshold={8}
            onChange={onRepeatRangeChange}
            suffix={t('audio.player.times')}
          />
          <RepeatSetting
            label={t('audio.player.repeat-verse')}
            value={verseRepetition.repeatEachVerse}
            minValue={1}
            infinityThreshold={8}
            onChange={onRepeatEachVerseChange}
            suffix={t('audio.player.times')}
          />
          <RepeatSetting
            label={t('audio.player.delay-verse')}
            value={verseRepetition.delayMultiplier}
            minValue={0}
            onChange={onDelayMultiplierChange}
            suffix={t('audio.player.times')}
            step={0.5}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Modal.Action onClick={isInRepeatMode ? onStopRepeating : onCancelClick}>
          {isInRepeatMode ? t('audio.player.stop-repeating') : t('cancel')}
        </Modal.Action>
        <Modal.Action onClick={onPlayClick}>{t('audio.player.start-playing')}</Modal.Action>
      </Modal.Footer>
    </Modal>
  );
};

export default RepeatAudioModal;
