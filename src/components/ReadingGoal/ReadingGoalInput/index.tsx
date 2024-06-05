/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingGoalInput.module.scss';
import VerseRangeInput from './VerseRangeInput';

import { ReadingGoalTabProps } from '@/components/ReadingGoalPage/hooks/useReadingGoalReducer';
import Input, { InputSize } from '@/dls/Forms/Input';
import Select, { SelectSize } from '@/dls/Forms/Select';
import { GoalType } from '@/types/auth/Goal';
import { generateTimeOptions } from '@/utils/generators';

export interface ReadingGoalInputProps {
  type: GoalType;

  rangeStartVerse?: string;
  rangeEndVerse?: string;
  pages?: number;
  seconds?: number;
  widthFull?: boolean;

  onRangeChange: (range: { startVerse: string | null; endVerse: string | null }) => void;
  onPagesChange: (pages: number) => void;
  onSecondsChange: (seconds: number) => void;

  logChange: ReadingGoalTabProps['logChange'];
}

const ReadingGoalInput: React.FC<ReadingGoalInputProps> = ({
  type,
  rangeStartVerse,
  rangeEndVerse,
  pages,
  seconds,
  onRangeChange,
  onPagesChange,
  onSecondsChange,
  widthFull = true,
  logChange,
}) => {
  const { t, lang } = useTranslation('reading-goal');
  const timeOptions = useMemo(() => generateTimeOptions(t, lang), [t, lang]);

  if (type === GoalType.RANGE) {
    return (
      <VerseRangeInput
        rangeStartVerse={rangeStartVerse}
        rangeEndVerse={rangeEndVerse}
        onRangeChange={onRangeChange}
        logChange={logChange}
      />
    );
  }

  if (type === GoalType.PAGES) {
    return (
      <div className={styles.inputContainer}>
        <label htmlFor="pages" className={styles.label}>
          {t('goal-types.pages.title')}
        </label>
        <Input
          id="pages"
          containerClassName={classNames(styles.input, widthFull && styles.fullWidth)}
          size={InputSize.Large}
          value={pages.toString()}
          fixedWidth={false}
          htmlType="number"
          // prevent users from entering decimal value
          onKeyDown={(e) => e.key === '.' && e.preventDefault()}
          inputMode="numeric"
          onChange={(p) => {
            const parsedPages = Number(p);
            onPagesChange(parsedPages);
            logChange('pages', { currentValue: pages, newValue: parsedPages });
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.inputContainer}>
      <label htmlFor="seconds" className={styles.label}>
        {t('goal-types.time.title')}
      </label>
      <Select
        id="seconds"
        name="seconds"
        size={SelectSize.Large}
        className={styles.input}
        options={timeOptions}
        value={seconds.toString()}
        onChange={(s) => {
          const parsedSeconds = Number(s);
          onSecondsChange(parsedSeconds);

          logChange('seconds', { currentValue: seconds, newValue: parsedSeconds });
        }}
      />
    </div>
  );
};

export default ReadingGoalInput;
