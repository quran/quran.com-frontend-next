/* eslint-disable max-lines */
import { useMemo, useState, useEffect, useContext, useCallback } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import styles from './RepeatAudioModal.module.scss';
import RepeatSetting from './RepeatSetting';
import SelectRepetitionMode, { RepetitionMode } from './SelectRepetitionMode';

import { RangeVerseItem } from '@/components/Verse/AdvancedCopy/SelectorContainer';
import Modal from '@/dls/Modal/Modal';
import Separator from '@/dls/Separator/Separator';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import useGetChaptersData from '@/hooks/useGetChaptersData';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import {
  generateChapterVersesKeys,
  getChapterFirstAndLastVerseKey,
  getChapterNumberFromKey,
  getVerseNumberFromKey,
} from '@/utils/verse';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import PreferenceGroup from 'types/auth/PreferenceGroup';

type VerseRepetitionSettings = {
  repeatRange: number;
  repeatEachVerse: number;
  from: string;
  to: string;
  delayMultiplier: number;
};

type CachedRepeatState = {
  verseRepetition: VerseRepetitionSettings;
  repetitionMode: RepetitionMode;
};

const verseRepetitionStateCache: Record<string, CachedRepeatState> = {};

const getCachedState = (chapter: string, verseKey?: string): CachedRepeatState | undefined => {
  if (verseKey) {
    return undefined;
  }

  const cached = verseRepetitionStateCache[chapter];
  if (!cached) {
    return undefined;
  }

  const { from, to } = cached.verseRepetition;
  if (!from || !to) {
    return undefined;
  }

  return cached;
};

type RepeatAudioModalProps = {
  chapterId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultRepetitionMode: RepetitionMode;
  selectedVerseKey?: string;
};

const RepeatAudioModal = ({
  chapterId,
  isOpen,
  onClose,
  defaultRepetitionMode,
  selectedVerseKey,
}: RepeatAudioModalProps) => {
  const { t, lang } = useTranslation('common');

  const audioService = useContext(AudioPlayerMachineContext);
  const repeatActor = useSelector(audioService, (state) => state.context.repeatActor);
  const repeatState = repeatActor?.getSnapshot();
  const repeatSettings = repeatState?.context;
  const isInRepeatMode = useSelector(audioService, (state) => !!state.context.repeatActor);
  const chaptersData = useGetChaptersData(lang);
  const {
    actions: { onSettingsChangeWithoutDispatch },
  } = usePersistPreferenceGroup();
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

  /**
   * Build the default verse repetition settings
   * If there's no selectedVerseKey, it means the user opened the modal for the first time
   * In this case, we should use the first and last verse of the chapter as the default from/to values
   */
  const buildDefaultVerseRepetition = useCallback(
    (): VerseRepetitionSettings => ({
      repeatRange: repeatSettings?.repeatSettings?.totalRangeCycle ?? 2,
      repeatEachVerse: repeatSettings?.repeatSettings?.totalVerseCycle ?? 2,
      from: selectedVerseKey ?? firstVerseKeyInThisChapter,
      to: selectedVerseKey ?? lastVerseKeyInThisChapter,
      delayMultiplier: repeatSettings?.delayMultiplier ?? 1,
    }),
    [
      repeatSettings?.repeatSettings?.totalRangeCycle,
      repeatSettings?.repeatSettings?.totalVerseCycle,
      repeatSettings?.delayMultiplier,
      selectedVerseKey,
      firstVerseKeyInThisChapter,
      lastVerseKeyInThisChapter,
    ],
  );
  const cachedState = getCachedState(chapterId, selectedVerseKey);

  const [repetitionMode, setRepetitionMode] = useState(
    () => cachedState?.repetitionMode ?? defaultRepetitionMode,
  );

  const [verseRepetition, setVerseRepetition] = useState<VerseRepetitionSettings>(() => {
    const base = cachedState?.verseRepetition;
    return base ?? buildDefaultVerseRepetition();
  });

  useEffect(() => {
    if (!selectedVerseKey && verseRepetition.from && verseRepetition.to) {
      verseRepetitionStateCache[chapterId] = {
        verseRepetition,
        repetitionMode,
      };
    }
  }, [chapterId, repetitionMode, selectedVerseKey, verseRepetition]);

  useEffect(() => {
    // init the state from cache if available or default values otherwise
    const cached = getCachedState(chapterId, selectedVerseKey);
    const nextMode = cached?.repetitionMode ?? defaultRepetitionMode;
    if (nextMode !== repetitionMode) {
      setRepetitionMode(nextMode);
    }
    const defaultState = cached?.verseRepetition ?? buildDefaultVerseRepetition();

    // only update the state if there's a change to avoid re-renders
    setVerseRepetition((prevVerseRepetition) => {
      if (
        prevVerseRepetition.repeatRange === defaultState.repeatRange &&
        prevVerseRepetition.repeatEachVerse === defaultState.repeatEachVerse &&
        prevVerseRepetition.from === defaultState.from &&
        prevVerseRepetition.to === defaultState.to &&
        prevVerseRepetition.delayMultiplier === defaultState.delayMultiplier
      ) {
        return prevVerseRepetition;
      }
      return defaultState;
    });
  }, [
    chapterId,
    defaultRepetitionMode,
    firstVerseKeyInThisChapter,
    lastVerseKeyInThisChapter,
    repetitionMode,
    repeatSettings?.delayMultiplier,
    repeatSettings?.repeatSettings?.totalRangeCycle,
    repeatSettings?.repeatSettings?.totalVerseCycle,
    selectedVerseKey,
    buildDefaultVerseRepetition,
  ]);

  const play = () => {
    audioService.send({
      type: 'SET_REPEAT_SETTING',
      delayMultiplier: Number(verseRepetition.delayMultiplier),
      repeatEachVerse: Number(verseRepetition.repeatEachVerse),
      from: Number(getVerseNumberFromKey(verseRepetition.from)),
      to: Number(getVerseNumberFromKey(verseRepetition.to)),
      repeatRange: Number(verseRepetition.repeatRange),
      surah: Number(getChapterNumberFromKey(verseRepetition.from)),
    });
    onClose();
  };

  const onPlayClick = () => {
    logButtonClick('start_repeat_play');
    onSettingsChangeWithoutDispatch('repeatSettings', verseRepetition, PreferenceGroup.AUDIO, play);
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

    // if the mode is single, and there's a selectedVerseKey, use it
    // otherwise, use the first verse of the chapter
    const singleVerseKey = selectedVerseKey ?? firstVerseKeyInThisChapter;
    setVerseRepetition((prevVerseRepetition) => ({
      ...prevVerseRepetition,
      from: mode === RepetitionMode.Single ? singleVerseKey : firstVerseKeyInThisChapter,
      to: mode === RepetitionMode.Single ? singleVerseKey : lastVerseKeyInThisChapter,
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
    setVerseRepetition({ ...verseRepetition, ...range });
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
        <div data-testid="repeat-audio-modal">
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
