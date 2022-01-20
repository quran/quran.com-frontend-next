/* eslint-disable max-lines */
import { useMemo, useState, useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import { triggerPauseAudio } from '../EventTriggers';

import styles from './RepeatAudioModal.module.scss';
import RepeatSetting from './RepeatSetting';
import SelectRepetitionMode, { RepetitionMode } from './SelectRepetitionMode';

import Modal from 'src/components/dls/Modal/Modal';
import Separator from 'src/components/dls/Separator/Separator';
import { RangeVerseItem } from 'src/components/Verse/AdvancedCopy/SelectorContainer';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import {
  exitRepeatMode,
  playFrom,
  selectIsInRepeatMode,
  selectRepeatSettings,
  setRepeatSettings,
} from 'src/redux/slices/AudioPlayer/state';
import { getChapterData } from 'src/utils/chapter';
import { logButtonClick, logValueChange } from 'src/utils/eventLogger';
import { generateChapterVersesKeys, getChapterFirstAndLastVerseKey } from 'src/utils/verse';
import QueryParam from 'types/QueryParam';

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
  const dispatch = useDispatch();
  const reciterId = useGetQueryParamOrReduxValue(QueryParam.Reciter) as number;

  const repeatSettings = useSelector(selectRepeatSettings);
  const [repetitionMode, setRepetitionMode] = useState(defaultRepetitionMode);
  const isInRepeatMode = useSelector(selectIsInRepeatMode);

  const chapterName = useMemo(() => {
    const chapterData = getChapterData(chapterId, lang);
    return chapterData?.transliteratedName;
  }, [chapterId, lang]);

  const comboboxVerseItems = useMemo<RangeVerseItem[]>(() => {
    const keys = generateChapterVersesKeys(chapterId);

    const initialState = keys.map((chapterVerseKeys) => ({
      id: chapterVerseKeys,
      name: chapterVerseKeys,
      value: chapterVerseKeys,
      label: chapterVerseKeys,
    }));

    return initialState;
  }, [chapterId]);

  const [firstVerseKeyInThisChapter, lastVerseKeyInThisChapter] =
    getChapterFirstAndLastVerseKey(chapterId);

  const [verseRepetition, setVerseRepetition] = useState({
    repeatRange: repeatSettings.repeatRange,
    repeatEachVerse: repeatSettings.repeatEachVerse,
    from: selectedVerseKey || firstVerseKeyInThisChapter,
    to: selectedVerseKey || lastVerseKeyInThisChapter,
    delayMultiplier: repeatSettings.delayMultiplier,
  });

  // reset verseRepetition's `to` and `from`, when chapter changed
  useEffect(() => {
    setVerseRepetition((prevVerseRepetition) => ({
      ...prevVerseRepetition,
      from: selectedVerseKey || firstVerseKeyInThisChapter,
      to: selectedVerseKey || lastVerseKeyInThisChapter,
    }));
  }, [chapterId, firstVerseKeyInThisChapter, lastVerseKeyInThisChapter, selectedVerseKey]);

  const onPlayClick = () => {
    logButtonClick('start_repeat_play');
    dispatch(setRepeatSettings({ verseRepetition, locale: lang }));
    dispatch(
      playFrom({
        chapterId: Number(chapterId),
        reciterId,
        verseKey: verseRepetition.from,
      }),
    );
    onClose();
  };
  const onCancelClick = () => {
    logButtonClick('repeat_cancel');
    onClose();
  };
  const onStopRepeating = () => {
    logButtonClick('stop_repeating');
    dispatch(exitRepeatMode());
    triggerPauseAudio();
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

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose}>
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
            onSingleVerseChange={(verseKey) => {
              logValueChange('repeat_single_verse', verseRepetition.repeatRange, verseKey);
              setVerseRepetition({ ...verseRepetition, from: verseKey, to: verseKey });
            }}
            onRangeChange={(range) => {
              logValueChange('repeat_verse_range', verseRepetition.repeatRange, range);
              setVerseRepetition({ ...verseRepetition, ...range });
            }}
            verseKey={verseRepetition.from}
          />
          <div className={styles.separator}>
            <Separator />
          </div>
          <RepeatSetting
            label={t('audio.player.play-range')}
            value={verseRepetition.repeatRange}
            minValue={1}
            infinityThreshold={3}
            onChange={(val) => {
              logValueChange('repeat_play_range', verseRepetition.repeatRange, val);
              setVerseRepetition({ ...verseRepetition, repeatRange: val });
            }}
            suffix={t('audio.player.times')}
          />
          <RepeatSetting
            label={t('audio.player.repeat-verse')}
            value={verseRepetition.repeatEachVerse}
            minValue={1}
            infinityThreshold={3}
            onChange={(val) => {
              logValueChange('repeat_verse', verseRepetition.repeatEachVerse, val);
              setVerseRepetition({ ...verseRepetition, repeatEachVerse: val });
            }}
            suffix={t('audio.player.times')}
          />
          <RepeatSetting
            label={t('audio.player.delay-verse')}
            value={verseRepetition.delayMultiplier}
            minValue={0}
            onChange={(val) => {
              logValueChange('repeat_delay_multiplier', verseRepetition.delayMultiplier, val);
              setVerseRepetition({ ...verseRepetition, delayMultiplier: val });
            }}
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
