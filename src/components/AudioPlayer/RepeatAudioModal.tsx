/* eslint-disable max-lines */
import { useMemo, useState, useEffect } from 'react';

import { RangeSelectorType, RangeVerseItem } from '../Verse/AdvancedCopy/SelectorContainer';

import styles from './RepeatButton.module.scss';

import Counter from 'src/components/dls/Counter/Counter';
import Combobox from 'src/components/dls/Forms/Combobox';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import Modal from 'src/components/dls/Modal/Modal';
import VerseRangeSelector from 'src/components/Verse/AdvancedCopy/VersesRangeSelector';
import { getChapterData } from 'src/utils/chapter';
import { generateChapterVersesKeys } from 'src/utils/verse';

type RepeatAudioModalProps = {
  chapterId: string;
  isOpen: boolean;
  onClose: () => void;
};

enum RepeatType {
  Single = 'single',
  Range = 'range',
}
const repeatTypeRadioGroupItems = [
  {
    value: RepeatType.Single,
    id: RepeatType.Range,
    label: 'Single Verse',
  },
  {
    value: RepeatType.Range,
    id: RepeatType.Range,
    label: 'Range of verses',
  },
];

const RepeatAudioModal = ({ chapterId, isOpen, onClose }: RepeatAudioModalProps) => {
  const chapterName = useMemo(() => {
    const chapterData = getChapterData(chapterId);
    return chapterData?.nameSimple;
  }, [chapterId]);

  const rangeVersesItems = useMemo<RangeVerseItem[]>(() => {
    const keys = generateChapterVersesKeys(chapterId);

    const initialState = keys.map((chapterVersesKey) => ({
      id: chapterVersesKey,
      name: chapterVersesKey,
      value: chapterVersesKey,
      label: chapterVersesKey,
    }));

    return initialState;
  }, [chapterId]);

  // eslint-disable-next-line prefer-destructuring
  const firstVersesRangeItems = rangeVersesItems[0];
  const lastVersesRangeItems = rangeVersesItems[rangeVersesItems.length - 1];

  // TODO: connect to redux when the data flow is ready
  const [repeatVerse, setRepeatVerse] = useState({ total: 1, progress: 0, verse: null });
  const [repeatVerseRange, setRepeatVerseRange] = useState({
    total: 1,
    progress: 0,
    from: firstVersesRangeItems.value, // first verseKey in the current chapter
    to: lastVersesRangeItems.value, // last verseKey in the current chapter
  });
  const [delayBetweenVerse, setDelayBetweeVerse] = useState(0);
  const [repeatType, setRepeatType] = useState(RepeatType.Single);

  // reset repeatVerseRange's `to` and `from`, when chapter changed
  useEffect(() => {
    setRepeatVerseRange((prevRepeatVerseRange) => ({
      ...prevRepeatVerseRange,
      from: firstVersesRangeItems.value,
      to: lastVersesRangeItems.value,
    }));
  }, [chapterId, firstVersesRangeItems.value, lastVersesRangeItems.value]);

  const onClickPlay = () => {
    onClose();
  };
  const onClickCancel = () => {
    onClose();
  };

  const onRangeTypeChange = (val) => {
    setRepeatType(val);
  };

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose}>
      <Modal.Body>
        <Modal.Header>
          <Modal.Title>Repeat Settings</Modal.Title>
          <Modal.Subtitle>Surah {chapterName}</Modal.Subtitle>
        </Modal.Header>
        <div>
          <RadioGroup
            label="Select verses range"
            orientation={RadioGroupOrientation.Horizontal}
            onChange={onRangeTypeChange}
            value={repeatType}
            items={repeatTypeRadioGroupItems}
          />
          {repeatType === RepeatType.Single && (
            <Combobox
              id={RepeatType.Single}
              value={repeatVerse.verse}
              items={rangeVersesItems}
              onChange={(val) => setRepeatVerse({ ...repeatVerse, verse: val })}
              placeholder="Search for a verse"
              initialInputValue={repeatVerse.verse}
            />
          )}
          {repeatType === RepeatType.Range && (
            <div className={styles.inputContainer}>
              <VerseRangeSelector
                onChange={(value, dropdownId) => {
                  if (dropdownId === RangeSelectorType.END) {
                    setRepeatVerseRange({ ...repeatVerseRange, to: value });
                  } else {
                    setRepeatVerseRange({ ...repeatVerseRange, from: value });
                  }
                }}
                dropdownItems={rangeVersesItems}
                isVisible
                rangeStartVerse={firstVersesRangeItems.value}
                rangeEndVerse={lastVersesRangeItems.value}
              />
            </div>
          )}
          <div className={styles.inputContainer}>
            <span className={styles.label}>Play each verse:</span>{' '}
            <span className={styles.input}>
              <Counter
                onIncrement={() => {
                  setRepeatVerse({ ...repeatVerse, total: repeatVerse.total + 1 });
                }}
                onDecrement={
                  repeatVerse.total >= 0
                    ? () => setRepeatVerse({ ...repeatVerse, total: repeatVerse.total - 1 })
                    : null
                }
                count={repeatVerse.total}
              />{' '}
              times
            </span>
          </div>
          <div className={styles.inputContainer}>
            <span className={styles.label}>Play verse range:</span>{' '}
            <span className={styles.input}>
              <Counter
                onIncrement={() => {
                  setRepeatVerseRange({ ...repeatVerseRange, total: repeatVerseRange.total + 1 });
                }}
                onDecrement={
                  repeatVerseRange.total > 1
                    ? () =>
                        setRepeatVerseRange({
                          ...repeatVerseRange,
                          total: repeatVerseRange.total - 1,
                        })
                    : null
                }
                count={repeatVerseRange.total}
              />{' '}
              times
            </span>
          </div>
          <div className={styles.inputContainer}>
            <span className={styles.label}>Delay between verse:</span>{' '}
            <span className={styles.input}>
              <Counter
                onIncrement={() => {
                  setDelayBetweeVerse(delayBetweenVerse + 0.5);
                }}
                onDecrement={() => {
                  if (delayBetweenVerse >= 0) setDelayBetweeVerse(delayBetweenVerse - 0.5);
                }}
                count={delayBetweenVerse.toFixed(1)}
              />{' '}
              times
            </span>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Modal.Action onClick={onClickCancel}>Cancel</Modal.Action>
        <Modal.Action onClick={onClickPlay}>Start Playing</Modal.Action>
      </Modal.Footer>
    </Modal>
  );
};

export default RepeatAudioModal;
