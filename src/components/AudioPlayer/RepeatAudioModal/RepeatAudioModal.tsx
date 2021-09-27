import { useMemo, useState, useEffect } from 'react';

import styles from './RepeatAudioModal.module.scss';
import RepeatSetting from './RepeatSetting';
import SelectRepetitionMode, { RepetitionMode } from './SelectRepetitionMode';

import Modal from 'src/components/dls/Modal/Modal';
import Separator from 'src/components/dls/Separator/Separator';
import { RangeVerseItem } from 'src/components/Verse/AdvancedCopy/SelectorContainer';
import { getChapterData } from 'src/utils/chapter';
import { generateChapterVersesKeys } from 'src/utils/verse';

type RepeatAudioModalProps = {
  chapterId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultRepetitionMode: RepetitionMode;
  defaultSelectedVerse?: string;
};

const RepeatAudioModal = ({
  chapterId,
  isOpen,
  onClose,
  defaultRepetitionMode,
  defaultSelectedVerse,
}: RepeatAudioModalProps) => {
  const chapterName = useMemo(() => {
    const chapterData = getChapterData(chapterId);
    return chapterData?.nameSimple;
  }, [chapterId]);

  const comboboxVerseItems = useMemo<RangeVerseItem[]>(() => {
    const keys = generateChapterVersesKeys(chapterId);

    const initialState = keys.map((chapterVersesKey) => ({
      id: chapterVersesKey,
      name: chapterVersesKey,
      value: chapterVersesKey,
      label: chapterVersesKey,
    }));

    return initialState;
  }, [chapterId]);

  const firstVerseKeyInThisChapter = comboboxVerseItems[0].value;
  const lastVerseKeyInThisChapter = comboboxVerseItems[comboboxVerseItems.length - 1].value;

  const [verseRepetition, setVerseRepetition] = useState({
    repeatRange: 1,
    repeatEachVerse: 1,
    from: defaultSelectedVerse || firstVerseKeyInThisChapter,
    to: lastVerseKeyInThisChapter,
  });
  const [delayMultiplierBetweenVerse, setDelayMultiplierBetweenVerse] = useState(0);

  // reset verseRepetition's `to` and `from`, when chapter changed
  useEffect(() => {
    setVerseRepetition((prevVerseRepetition) => ({
      ...prevVerseRepetition,
      from: defaultSelectedVerse || firstVerseKeyInThisChapter,
      to: lastVerseKeyInThisChapter,
    }));
  }, [chapterId, firstVerseKeyInThisChapter, lastVerseKeyInThisChapter, defaultSelectedVerse]);

  const onPlayClick = () => {
    onClose();
  };
  const onCancelClick = () => {
    onClose();
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
            defaultRepetitionMode={defaultRepetitionMode}
            rangeEndVerse={verseRepetition.to}
            rangeStartVerse={verseRepetition.from}
            comboboxVerseItems={comboboxVerseItems}
            onSingleVerseChange={(val) =>
              setVerseRepetition({ ...verseRepetition, from: val, to: val })
            }
            onRangeChange={(val) => setVerseRepetition({ ...verseRepetition, ...val })}
            verseKey={verseRepetition.from}
          />
          <div className={styles.separator}>
            <Separator />
          </div>
          <RepeatSetting
            label="Repeat each verse"
            value={verseRepetition.repeatEachVerse}
            minValue={1}
            onChange={(val) => setVerseRepetition({ ...verseRepetition, repeatEachVerse: val })}
            suffix="times"
          />
          <RepeatSetting
            label="Repeat each range"
            value={verseRepetition.repeatRange}
            minValue={1}
            onChange={(val) => setVerseRepetition({ ...verseRepetition, repeatRange: val })}
            suffix="times"
          />
          <RepeatSetting
            label="Delay between verse"
            value={delayMultiplierBetweenVerse}
            minValue={0}
            onChange={(val) => setDelayMultiplierBetweenVerse(val)}
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
