import { useMemo, useState } from 'react';

import RepeatIcon from '../../../public/icons/ic_repeat_24px 1.svg';
import { RangeVerseItem } from '../Verse/AdvancedCopy/SelectorContainer';

import styles from './RepeatButton.module.scss';

import Button, { ButtonVariant, ButtonShape } from 'src/components/dls/Button/Button';
import Counter from 'src/components/dls/Counter/Counter';
import Modal from 'src/components/dls/Modal/Modal';
import VerseRangeSelector from 'src/components/Verse/AdvancedCopy/VersesRangeSelector';
import { getChapterData } from 'src/utils/chapter';
import { generateChapterVersesKeys } from 'src/utils/verse';

type RepeatButtonProps = {
  chapterId: string;
};

const RepeatButton = ({ chapterId }: RepeatButtonProps) => {
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

  // TODO: connect to redux when the data flow is ready
  const [repeatVerse, setRepeatVerse] = useState({ total: 1, progress: 0 });
  const [repeatVerseRange, setRepeatVerseRange] = useState({
    total: 1,
    progress: 0,
    from: rangeVersesItems[0].value, // first verseKey in the current chapter
    to: rangeVersesItems[rangeVersesItems.length - 1].value, // last verseKey in the current chapter
  });

  return (
    <Modal
      // isOpen={false} // un comment when merging this PR
      trigger={
        <Button
          // disabled // uncomment when merging this PR
          // tooltip="Feature coming soon" // uncomment when merging this PR
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
        >
          <RepeatIcon />
        </Button>
      }
    >
      <Modal.Body>
        <Modal.Header>
          <Modal.Title>Repeat Settings</Modal.Title>
          <Modal.Subtitle>Surah {chapterName}</Modal.Subtitle>
        </Modal.Header>
        <div>
          <div className={styles.inputContainer}>
            <VerseRangeSelector
              onChange={(value, dropdownId) => {
                if (dropdownId === 'end') {
                  setRepeatVerseRange({ ...repeatVerseRange, to: value });
                } else {
                  setRepeatVerseRange({ ...repeatVerseRange, from: value });
                }
              }}
              dropdownItems={rangeVersesItems}
              isVisible
              rangeStartVerse={repeatVerseRange.from}
              rangeEndVerse={repeatVerseRange.to}
            />
          </div>
          <div className={styles.inputContainer}>
            Play each verse{' '}
            <Counter
              onIncrement={() => {
                setRepeatVerse({ ...repeatVerse, total: repeatVerse.total + 1 });
              }}
              onDecrement={() => {
                if (repeatVerse.total >= 0)
                  setRepeatVerse({ ...repeatVerse, total: repeatVerse.total - 1 });
              }}
              count={repeatVerse.total}
            />{' '}
            times
          </div>
          <div className={styles.inputContainer}>
            Play verse range{' '}
            <Counter
              onIncrement={() => {
                setRepeatVerseRange({ ...repeatVerseRange, total: repeatVerseRange.total + 1 });
              }}
              onDecrement={() => {
                if (repeatVerseRange.total >= 0)
                  setRepeatVerseRange({ ...repeatVerseRange, total: repeatVerseRange.total - 1 });
              }}
              count={repeatVerseRange.total}
            />{' '}
            times
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RepeatButton;
