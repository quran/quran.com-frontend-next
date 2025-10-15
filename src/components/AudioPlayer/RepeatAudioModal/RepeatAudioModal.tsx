/* eslint-disable max-lines */
import { useContext, useEffect, useMemo, useState } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector as useReduxSelector } from 'react-redux';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import PreferenceGroup from 'types/auth/PreferenceGroup';

import styles from './RepeatAudioModal.module.scss';
import RepeatSetting from './RepeatSetting';
import SelectRepetitionMode, { RepetitionMode } from './SelectRepetitionMode';

import { RangeVerseItem } from '@/components/Verse/AdvancedCopy/SelectorContainer';
import Modal from '@/dls/Modal/Modal';
import Separator from '@/dls/Separator/Separator';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import useGetChaptersData from '@/hooks/useGetChaptersData';
import {
  RepeatSettingsState,
  resetRepeatSettings,
  selectRepeatSettings,
  updateRepeatSettings,
} from '@/redux/slices/repeatSettings';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import {
  generateChapterVersesKeys,
  getChapterFirstAndLastVerseKey,
  getChapterNumberFromKey,
  getVerseNumberFromKey,
} from '@/utils/verse';

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

  const dispatch = useDispatch();
  const reduxRepeatSettings = useReduxSelector(selectRepeatSettings);

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

  useEffect(() => {
    if ([RepetitionMode.Single].includes(reduxRepeatSettings.repetitionMode)) {
      dispatch(
        resetRepeatSettings({
          chapterId,
          firstVerseKey: selectedVerseKey || firstVerseKeyInThisChapter,
          lastVerseKey: selectedVerseKey || lastVerseKeyInThisChapter,
        }),
      );
    }

    if (reduxRepeatSettings.chapterId !== chapterId) {
      dispatch(
        resetRepeatSettings({
          chapterId,
          firstVerseKey: firstVerseKeyInThisChapter,
          lastVerseKey: lastVerseKeyInThisChapter,
          repetitionMode: RepetitionMode.Single,
        }),
      );
    }
  }, [
    chapterId,
    firstVerseKeyInThisChapter,
    reduxRepeatSettings.repetitionMode,
    selectedVerseKey,
    lastVerseKeyInThisChapter,
    reduxRepeatSettings.chapterId,
    dispatch,
  ]);

  const verseRepetition = {
    repeatRange:
      reduxRepeatSettings.repeatRange || repeatSettings?.repeatSettings?.totalRangeCycle || 2,
    repeatEachVerse:
      reduxRepeatSettings.repeatEachVerse || repeatSettings?.repeatSettings?.totalVerseCycle || 2,
    from: reduxRepeatSettings.from || selectedVerseKey || firstVerseKeyInThisChapter,
    to: reduxRepeatSettings.to || selectedVerseKey || lastVerseKeyInThisChapter,
    delayMultiplier: reduxRepeatSettings.delayMultiplier || repeatSettings?.delayMultiplier || 1,
  };

  const repetitionMode = reduxRepeatSettings.repetitionMode || defaultRepetitionMode;

  const setVerseRepetition = (newSettings: Partial<RepeatSettingsState>) => {
    dispatch(
      updateRepeatSettings({
        ...newSettings,
        chapterId,
      }),
    );
  };

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

    dispatch(updateRepeatSettings({ ...verseRepetition, chapterId, repetitionMode }));
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

  const [localRange, setLocalRange] = useState({
    from: null,
    to: null,
  });

  const onRepetitionModeChange = (mode: RepetitionMode) => {
    logValueChange('repitition_mode', repetitionMode, mode);

    if (repetitionMode === RepetitionMode.Range) {
      setLocalRange({ from: verseRepetition.from, to: verseRepetition.to });
    }

    if (mode === RepetitionMode.Range) {
      setVerseRepetition({
        from: localRange.from ?? selectedVerseKey ?? firstVerseKeyInThisChapter,
        to: localRange.to ?? lastVerseKeyInThisChapter,
        repetitionMode: mode,
      });
    }

    if (mode === RepetitionMode.Single && selectedVerseKey) {
      setVerseRepetition({ from: selectedVerseKey, to: selectedVerseKey, repetitionMode: mode });
    }

    if (mode === RepetitionMode.Chapter) {
      setVerseRepetition({
        from: firstVerseKeyInThisChapter,
        to: lastVerseKeyInThisChapter,
        repetitionMode: mode,
      });
    }
  };

  const onSingleVerseChange = (verseKey) => {
    logValueChange('repeat_single_verse', verseRepetition.repeatRange, verseKey);
    setVerseRepetition({ from: verseKey, to: verseKey });
  };

  const onRangeChange = (range) => {
    const isFrom = !!range.from;
    const logKey = isFrom ? 'repeat_verse_range_from' : 'repeat_verse_range_to';
    const oldValue = isFrom ? verseRepetition.from : verseRepetition.to;
    const newValue = isFrom ? range.from : range.to;
    logValueChange(logKey, oldValue, newValue);
    setVerseRepetition(range);
  };

  const onRepeatRangeChange = (val) => {
    logValueChange('repeat_play_range', verseRepetition.repeatRange, val);
    setVerseRepetition({ repeatRange: val });
  };

  const onRepeatEachVerseChange = (val) => {
    logValueChange('repeat_verse', verseRepetition.repeatEachVerse, val);
    setVerseRepetition({ repeatEachVerse: val });
  };

  const onDelayMultiplierChange = (val) => {
    logValueChange('repeat_delay_multiplier', verseRepetition.delayMultiplier, val);
    setVerseRepetition({ delayMultiplier: val });
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
