import useTranslation from 'next-translate/useTranslation';

import styles from './CreateReadingGoalModal.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { ReadingGoalType } from '@/types/auth/ReadingGoal';

const examples = [
  {
    i18nKey: 'time',
    values: {
      type: ReadingGoalType.TIME,
      seconds: 10 * 60,
    },
  },
  {
    i18nKey: 'khatm',
    values: {
      type: ReadingGoalType.RANGE,
      rangeStartVerse: '1:1',
      rangeEndVerse: '114:6',
      duration: 30,
    },
  },
  {
    i18nKey: 'juz',
    values: {
      type: ReadingGoalType.PAGES,
      pages: 20,
    },
  },
  {
    i18nKey: 'surah',
    values: {
      type: ReadingGoalType.RANGE,
      rangeStartVerse: '67:1',
      rangeEndVerse: '67:30',
    },
  },
  {
    i18nKey: 'custom',
  },
] as const;

interface Props {
  onExampleClick: (example: typeof examples[number]) => void;
}

const ExamplesTab: React.FC<Props> = ({ onExampleClick }) => {
  const { t } = useTranslation('reading-goal');

  return (
    <>
      {examples.map((example) => (
        <Button
          key={example.i18nKey}
          className={styles.exampleButton}
          variant={ButtonVariant.Ghost}
          size={ButtonSize.Large}
          onClick={() => onExampleClick(example)}
          suffix={<ChevronRightIcon />}
        >
          {t(`create-goal-modal.examples.${example.i18nKey}`)}
        </Button>
      ))}
    </>
  );
};

export default ExamplesTab;
