import { useMemo, useState, useEffect } from 'react';

import styles from './RepeatAudioModal.module.scss';
import RepeatSetting from './RepeatSetting';
import SelectType, { RepeatType } from './SelectType';

import Modal from 'src/components/dls/Modal/Modal';
import Separator from 'src/components/dls/Separator/Separator';
import { RangeVerseItem } from 'src/components/Verse/AdvancedCopy/SelectorContainer';
import { getChapterData } from 'src/utils/chapter';
import { generateChapterVersesKeys } from 'src/utils/verse';

type RepeatAudioModalProps = {
  chapterId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultRepeatType: RepeatType;
  defaultSelectedVerse?: string;
};

const RepeatAudioModal = ({
  chapterId,
  isOpen,
  onClose,
  defaultRepeatType,
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

  // TODO: connect to redux when the data flow is ready
  const [repeatVerse, setRepeatVerse] = useState(() => {
    return { total: 1, verseKey: defaultSelectedVerse || firstVerseKeyInThisChapter };
  });
  const [repeatVerseRange, setRepeatVerseRange] = useState({
    total: 1,
    from: firstVerseKeyInThisChapter,
    to: lastVerseKeyInThisChapter,
  });
  const [delayMultiplierBetweenVerse, setDelayMultiplierBetweenVerse] = useState(0);

  // reset repeatVerseRange's `to` and `from`, when chapter changed
  useEffect(() => {
    setRepeatVerseRange((prevRepeatVerseRange) => ({
      ...prevRepeatVerseRange,
      from: firstVerseKeyInThisChapter,
      to: lastVerseKeyInThisChapter,
    }));
  }, [chapterId, firstVerseKeyInThisChapter, lastVerseKeyInThisChapter]);

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
          <SelectType
            defaultRepeatType={defaultRepeatType}
            rangeEndVerse={firstVerseKeyInThisChapter}
            rangeStartVerse={lastVerseKeyInThisChapter}
            comboboxVerseItems={comboboxVerseItems}
            onSingleVerseChange={(val) =>
              setRepeatVerse({ ...repeatVerse, verseKey: val as string })
            }
            onRangeChange={(val) => setRepeatVerseRange({ ...repeatVerseRange, ...val })}
            verseKey={repeatVerse.verseKey}
          />
          <div className={styles.separator}>
            <Separator />
          </div>
          <RepeatSetting
            label="Repeat each verse"
            value={repeatVerse.total}
            minValue={1}
            onChange={(val) => setRepeatVerse({ ...repeatVerse, total: val })}
            suffix="times"
          />
          <RepeatSetting
            label="Repeat each range"
            value={repeatVerseRange.total}
            minValue={1}
            onChange={(val) => setRepeatVerseRange({ ...repeatVerseRange, total: val })}
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
