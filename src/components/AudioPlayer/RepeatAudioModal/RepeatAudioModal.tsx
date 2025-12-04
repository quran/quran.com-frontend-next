/* eslint-disable max-lines */
import { useMemo, useState, useEffect, useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { useSelector as useReduxSelector } from 'react-redux';

import {
  VerseRepetitionState,
  buildDefaultVerseRepetition,
  normalizeVerseRange,
  prepareRepeatSettingsForApi,
  serializeOptionalRepeatSettings,
  serializeRepeatSettings,
} from './RepeatAudioModal.helpers';
import styles from './RepeatAudioModal.module.scss';
import RepeatSetting from './RepeatSetting';
import SelectRepetitionMode, { RepetitionMode } from './SelectRepetitionMode';

import { RangeVerseItem } from '@/components/Verse/AdvancedCopy/SelectorContainer';
import Modal from '@/dls/Modal/Modal';
import Separator from '@/dls/Separator/Separator';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import useGetChaptersData from '@/hooks/useGetChaptersData';
import { selectAudioPlayerState, setRepeatSettings } from '@/redux/slices/AudioPlayer/state';
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

interface RepeatAudioModalProps {
  chapterId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultRepetitionMode: RepetitionMode;
  selectedVerseKey?: string;
}
const RepeatAudioModal = ({
  chapterId,
  isOpen,
  onClose,
  defaultRepetitionMode,
  selectedVerseKey,
}: RepeatAudioModalProps) => {
  const { t, lang } = useTranslation('common');
  const toast = useToast();

  const audioService = useContext(AudioPlayerMachineContext);
  const repeatActor = useXstateSelector(audioService, (state) => state.context.repeatActor);
  const audioSurah = useXstateSelector(audioService, (state) => state.context.surah);
  const repeatActorContext = repeatActor?.getSnapshot()?.context;
  const [repetitionMode, setRepetitionMode] = useState(defaultRepetitionMode);
  const isInRepeatMode = !!repeatActor;
  const chaptersData = useGetChaptersData(lang);
  const {
    actions: { onSettingsChange },
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
  const actorRepeatSources = useMemo(
    () => ({
      repeatRangeFromActor,
      repeatEachVerseFromActor,
      delayMultiplierFromActor,
      fromVerseNumberFromActor,
      toVerseNumberFromActor,
    }),
    [
      repeatRangeFromActor,
      repeatEachVerseFromActor,
      delayMultiplierFromActor,
      fromVerseNumberFromActor,
      toVerseNumberFromActor,
    ],
  );
  const persistedRepeatSources = useMemo(
    () => ({
      persistedRepeatRange,
      persistedRepeatEachVerse,
      persistedDelayMultiplier,
      persistedFromVerseKey,
      persistedToVerseKey,
    }),
    [
      persistedRepeatRange,
      persistedRepeatEachVerse,
      persistedDelayMultiplier,
      persistedFromVerseKey,
      persistedToVerseKey,
    ],
  );
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
        ...actorRepeatSources,
        ...persistedRepeatSources,
      }),
    [
      audioSurah,
      chapterNumber,
      firstVerseKeyInThisChapter,
      lastVerseKeyInThisChapter,
      actorRepeatSources,
      persistedRepeatSources,
      selectedVerseKey,
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
    const { from, to } = normalizedSettings;
    if (!from || !to) {
      toast(t('error.ranges-no-value'), { status: ToastStatus.Warning });
      return;
    }

    const fromVerseNumber = getVerseNumberFromKey(from);
    const toVerseNumber = getVerseNumberFromKey(to);
    const surahNumber = getChapterNumberFromKey(from);

    if (Number.isNaN(fromVerseNumber) || Number.isNaN(toVerseNumber) || Number.isNaN(surahNumber)) {
      toast(t('error.general'), { status: ToastStatus.Warning });
      return;
    }

    audioService.send({
      type: 'SET_REPEAT_SETTING',
      delayMultiplier: normalizedSettings.delayMultiplier,
      repeatEachVerse: normalizedSettings.repeatEachVerse,
      from: fromVerseNumber,
      to: toVerseNumber,
      repeatRange: normalizedSettings.repeatRange,
      surah: surahNumber,
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
    const serializableSettings = serializeRepeatSettings(normalizedSettings);
    const previousRepeatSettings = serializeOptionalRepeatSettings(persistedRepeatSettings);
    onSettingsChange(
      'repeatSettings',
      prepareRepeatSettingsForApi(serializableSettings),
      setRepeatSettings(serializableSettings),
      setRepeatSettings(previousRepeatSettings),
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

  const onSingleVerseChange = (verseKey: string) => {
    logValueChange('repeat_single_verse', verseRepetition.repeatRange, verseKey);
    const normalizedRange = normalizeVerseRange(verseKey, verseKey);
    setVerseRepetition({ ...verseRepetition, ...normalizedRange });
  };

  const onRangeChange = (range: Partial<{ from: string; to: string }>) => {
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
