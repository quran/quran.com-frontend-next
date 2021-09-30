import { useMemo, useState, useEffect } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './RepeatAudioModal.module.scss';
import RepeatSetting from './RepeatSetting';
import SelectRepetitionMode, { RepetitionMode } from './SelectRepetitionMode';

import Modal from 'src/components/dls/Modal/Modal';
import Separator from 'src/components/dls/Separator/Separator';
import { RangeVerseItem } from 'src/components/Verse/AdvancedCopy/SelectorContainer';
import {
  defaultRepeatSettings,
  playFrom,
  selectReciter,
  setRepeatSettings,
} from 'src/redux/slices/AudioPlayer/state';
import { getChapterData } from 'src/utils/chapter';
import { generateChapterVersesKeys, getChapterFirstAndLastVerseKey } from 'src/utils/verse';

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
  const dispatch = useDispatch();
  const reciter = useSelector(selectReciter, shallowEqual);
  const [repetitionMode, setRepetitionMode] = useState(defaultRepetitionMode);

  const chapterName = useMemo(() => {
    const chapterData = getChapterData(chapterId);
    return chapterData?.nameSimple;
  }, [chapterId]);

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
    repeatRange: defaultRepeatSettings.repeatRange,
    repeatEachVerse: defaultRepeatSettings.repeatEachVerse,
    from: selectedVerseKey || firstVerseKeyInThisChapter,
    to: selectedVerseKey || lastVerseKeyInThisChapter,
    delayMultiplier: defaultRepeatSettings.delayMultiplier,
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
    dispatch(setRepeatSettings(verseRepetition));
    dispatch(
      playFrom({
        chapterId: Number(chapterId),
        reciterId: reciter.id,
        verseKey: verseRepetition.from,
      }),
    );
    onClose();
  };
  const onCancelClick = () => {
    onClose();
  };

  const onRepetitionModeChange = (mode) => {
    if (mode === RepetitionMode.Single) {
      setVerseRepetition((prevVerseRepetition) => ({
        ...prevVerseRepetition,
        from: selectedVerseKey,
        to: selectedVerseKey,
      }));
    } else {
      setVerseRepetition((prevVerseRepetition) => ({
        ...prevVerseRepetition,
        from: firstVerseKeyInThisChapter,
        to: lastVerseKeyInThisChapter,
      }));
    }
    setRepetitionMode(mode);
  };

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose}>
      <Modal.Body>
        <Modal.Header>
          <Modal.Title>Repeat Settings</Modal.Title>
          <Modal.Subtitle>Surah {chapterName}</Modal.Subtitle>
        </Modal.Header>
        <div>
          <SelectRepetitionMode
            repetitionMode={repetitionMode}
            rangeEndVerse={verseRepetition.to}
            rangeStartVerse={verseRepetition.from}
            comboboxVerseItems={comboboxVerseItems}
            onRepetitionModeChange={onRepetitionModeChange}
            onSingleVerseChange={(verseKey) =>
              setVerseRepetition({ ...verseRepetition, from: verseKey, to: verseKey })
            }
            onRangeChange={(range) => setVerseRepetition({ ...verseRepetition, ...range })}
            verseKey={verseRepetition.from}
          />
          <div className={styles.separator}>
            <Separator />
          </div>
          <RepeatSetting
            label="Play range"
            value={verseRepetition.repeatRange}
            minValue={1}
            onChange={(val) => setVerseRepetition({ ...verseRepetition, repeatRange: val })}
            suffix="times"
          />
          <RepeatSetting
            label="Repeat each verse"
            value={verseRepetition.repeatEachVerse}
            minValue={1}
            onChange={(val) => setVerseRepetition({ ...verseRepetition, repeatEachVerse: val })}
            suffix="times"
          />
          <RepeatSetting
            label="Delay between verse"
            value={verseRepetition.delayMultiplier}
            minValue={0}
            onChange={(val) => setVerseRepetition({ ...verseRepetition, delayMultiplier: val })}
            suffix="times"
            step={0.5}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Modal.Action onClick={onCancelClick}>Cancel</Modal.Action>
        <Modal.Action onClick={onPlayClick}>Start Playing</Modal.Action>
      </Modal.Footer>
    </Modal>
  );
};

export default RepeatAudioModal;
