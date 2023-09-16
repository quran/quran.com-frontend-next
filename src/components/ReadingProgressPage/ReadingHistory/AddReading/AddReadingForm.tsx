import { useContext, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './AddReading.module.scss';

import VerseRangesList from '@/components/ReadingGoal/ReadingGoalAmount/VerseRangesList';
import VerseRangeInput from '@/components/ReadingGoal/ReadingGoalInput/VerseRangeInput';
import { isValidVerseRange } from '@/components/ReadingGoalPage/utils/validator';
import DataContext from '@/contexts/DataContext';
import Button from '@/dls/Button/Button';
import DurationInput from '@/dls/DurationInput';
import HelperTooltip from '@/dls/HelperTooltip/HelperTooltip';
import { logButtonClick } from '@/utils/eventLogger';

interface AddReadingFormProps {
  ranges: string[];
  setRanges: (ranges: string[]) => void;

  totalSeconds: number;
  setTotalSeconds: (totalSeconds: number) => void;

  isFetchingSeconds: boolean;
  totalSecondsError?: string;
}

const AddReadingForm = ({
  ranges,
  setRanges,
  totalSeconds,
  setTotalSeconds,
  isFetchingSeconds,
  totalSecondsError,
}: AddReadingFormProps) => {
  const chaptersData = useContext(DataContext);
  const { t } = useTranslation('reading-progress');

  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  const onAddClick = () => {
    if (!rangeStart || !rangeEnd) return;
    const newRanges = [...ranges, `${rangeStart}-${rangeEnd}`];
    logButtonClick('add_reading', {
      range: `${rangeStart}-${rangeEnd}`,
    });
    setRanges(newRanges);
    setRangeStart(undefined);
    setRangeEnd(undefined);
  };

  const onRangeChange = ({ startVerse, endVerse }) => {
    setRangeStart(startVerse);
    setRangeEnd(endVerse);
  };

  const getIsAddButtonDisabled = () => {
    return !isValidVerseRange(chaptersData, {
      startVerse: rangeStart,
      endVerse: rangeEnd,
    });
  };

  return (
    <>
      <VerseRangeInput
        rangeStartVerse={rangeStart}
        rangeEndVerse={rangeEnd}
        onRangeChange={onRangeChange}
      />
      <Button isDisabled={getIsAddButtonDisabled()} onClick={onAddClick}>
        {t('add')}
      </Button>

      <div className={styles.durationInputWrapper}>
        <DurationInput
          totalSeconds={totalSeconds}
          onTotalSecondsChange={setTotalSeconds}
          isLoading={isFetchingSeconds}
          label={
            <div className={styles.inputLabelContainer}>
              {t('reading-time')}
              <HelperTooltip>{t('seconds-read-tooltip')}</HelperTooltip>
            </div>
          }
          error={totalSecondsError}
        />
      </div>

      <div className={styles.verseRangesListContainer}>
        <VerseRangesList allowClearingRanges ranges={ranges} setRanges={setRanges} />
      </div>
    </>
  );
};

export default AddReadingForm;
