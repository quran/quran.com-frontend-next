/* eslint-disable max-lines */
import { useMemo, useState, useEffect, useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { useSelector as useReduxSelector } from 'react-redux';

import {
  fromPersistedValue,
  isVerseInChapter,
  normalizeVerseRange,
  toPersistedValue,
} from './RepeatAudioModal.helpers';
import styles from './RepeatAudioModal.module.scss';
import RepeatSetting from './RepeatSetting';
import SelectRepetitionMode, { RepetitionMode } from './SelectRepetitionMode';

import { RangeVerseItem } from '@/components/Verse/AdvancedCopy/SelectorContainer';
import Modal from '@/dls/Modal/Modal';
import Separator from '@/dls/Separator/Separator';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import useGetChaptersData from '@/hooks/useGetChaptersData';
import { selectRepeatSettings, setRepeatSettings } from '@/redux/slices/AudioPlayer/state';
import { RepeatSettings } from '@/redux/types/AudioState';
import { TestId } from '@/tests/test-ids';
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

  // State from XState (audio player machine)
  const audioService = useContext(AudioPlayerMachineContext);
  const repeatActor = useXstateSelector(audioService, (state) => state.context.repeatActor);
  const repeatActorContext = repeatActor?.getSnapshot()?.context;
  const isInRepeatMode = useXstateSelector(audioService, (state) => !!state.context.repeatActor);

  // State from Redux (persisted settings)
  const persistedSettings = useReduxSelector(selectRepeatSettings);

  // Hooks
  const [repetitionMode, setRepetitionMode] = useState(defaultRepetitionMode);
  const chaptersData = useGetChaptersData(lang);
  const {
    actions: { onSettingsChange },
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

  const chapterNumber = Number(chapterId);

  // Initial state
  // Priority: repeatActor (currently playing) > persistedSettings > defaults
  const getInitialVerseRepetition = () => {
    // For numeric settings: actor > persisted > defaults
    const repeatRange = fromPersistedValue(
      repeatActorContext?.repeatSettings?.totalRangeCycle ?? persistedSettings?.repeatRange,
      2,
    );
    const repeatEachVerse = fromPersistedValue(
      repeatActorContext?.repeatSettings?.totalVerseCycle ?? persistedSettings?.repeatEachVerse,
      2,
    );
    const delayMultiplier = fromPersistedValue(
      repeatActorContext?.delayMultiplier ?? persistedSettings?.delayMultiplier,
      1,
    );

    // For verse keys: only use persisted if they're in the current chapter
    const persistedFrom = isVerseInChapter(persistedSettings?.from, chapterNumber)
      ? persistedSettings?.from
      : undefined;
    const persistedTo = isVerseInChapter(persistedSettings?.to, chapterNumber)
      ? persistedSettings?.to
      : undefined;

    return {
      repeatRange,
      repeatEachVerse,
      delayMultiplier,
      from: selectedVerseKey ?? persistedFrom ?? firstVerseKeyInThisChapter,
      to: selectedVerseKey ?? persistedTo ?? lastVerseKeyInThisChapter,
    };
  };

  const [verseRepetition, setVerseRepetition] = useState(getInitialVerseRepetition);

  // Reset from/to when chapter changes, but respect persisted values if they exist for this chapter
  useEffect(() => {
    // Check if we have persisted values for this chapter
    const persistedFrom = isVerseInChapter(persistedSettings?.from, chapterNumber)
      ? persistedSettings?.from
      : undefined;
    const persistedTo = isVerseInChapter(persistedSettings?.to, chapterNumber)
      ? persistedSettings?.to
      : undefined;

    setVerseRepetition((prev) => ({
      ...prev,
      // Priority: selectedVerseKey (explicit selection) > persisted > chapter defaults
      from: selectedVerseKey ?? persistedFrom ?? firstVerseKeyInThisChapter,
      to: selectedVerseKey ?? persistedTo ?? lastVerseKeyInThisChapter,
    }));
  }, [
    chapterId,
    chapterNumber,
    firstVerseKeyInThisChapter,
    lastVerseKeyInThisChapter,
    selectedVerseKey,
    persistedSettings?.from,
    persistedSettings?.to,
  ]);

  // --------------------------------------------------------------------------
  // PLAY HANDLER
  // Normalize range, persist to Redux/backend, then start playback
  // --------------------------------------------------------------------------
  const play = () => {
    // Normalize: ensure from <= to
    const normalized = normalizeVerseRange(verseRepetition.from, verseRepetition.to);

    audioService.send({
      type: 'SET_REPEAT_SETTING',
      delayMultiplier: Number(verseRepetition.delayMultiplier),
      repeatEachVerse: Number(verseRepetition.repeatEachVerse),
      from: Number(getVerseNumberFromKey(normalized.from)),
      to: Number(getVerseNumberFromKey(normalized.to)),
      repeatRange: Number(verseRepetition.repeatRange),
      surah: Number(getChapterNumberFromKey(normalized.from)),
    });
    onClose();
  };

  const onPlayClick = () => {
    logButtonClick('start_repeat_play');

    // Normalize the range before saving
    const normalized = normalizeVerseRange(verseRepetition.from, verseRepetition.to);

    // Prepare settings for persistence (convert Infinity to -1)
    const settingsToSave: RepeatSettings = {
      from: normalized.from,
      to: normalized.to,
      repeatRange: toPersistedValue(verseRepetition.repeatRange),
      repeatEachVerse: toPersistedValue(verseRepetition.repeatEachVerse),
      delayMultiplier: verseRepetition.delayMultiplier,
    };

    // onSettingsChange:
    // 1. Dispatches setRepeatSettings to Redux (local persistence via redux-persist)
    // 2. Calls backend API for logged-in users
    // 3. Calls play() as success callback
    onSettingsChange(
      'repeatSettings',
      settingsToSave,
      setRepeatSettings(settingsToSave),
      setRepeatSettings(persistedSettings), // undo action
      PreferenceGroup.AUDIO,
      play,
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
    <Modal
      isOpen={isOpen}
      onClickOutside={onClose}
      onEscapeKeyDown={onClose}
      testId={TestId.REPEAT_AUDIO_MODAL}
    >
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
