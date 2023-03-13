import useTranslation from 'next-translate/useTranslation';

import OptionButton from './OptionButton';
import styles from './ReadingGoalPage.module.scss';
import { ReadingGoalTabProps } from './useReadingGoalReducer';

import BookIcon from '@/icons/book.svg';
import ClockIcon from '@/icons/clock.svg';
import SettingsIcon from '@/icons/settings-stroke.svg';
import { ReadingGoalType } from '@/types/auth/ReadingGoal';

const options = [
  {
    type: ReadingGoalType.TIME,
    key: 'time',
    icon: ClockIcon,
  },
  {
    type: ReadingGoalType.PAGES,
    key: 'pages',
    icon: BookIcon,
  },
  {
    type: ReadingGoalType.RANGE,
    key: 'range',
    icon: SettingsIcon,
  },
];

const ReadingGoalTypeTab: React.FC<ReadingGoalTabProps> = ({ state, dispatch, nav }) => {
  const { t } = useTranslation('reading-goal');

  return (
    <>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{t('goal-type.title')}</h1>
        <p className={styles.subtitle}>{t('goal-type.description')}</p>
      </div>
      <div className={styles.optionsContainer}>
        {options.map((option) => (
          <OptionButton
            key={option.key}
            onSelect={() => dispatch({ type: 'SET_TYPE', payload: { type: option.type } })}
            selected={state.type === option.type}
            option={t(`goal-types.${option.key}.title`)}
            description={t(`goal-types.${option.key}.description`)}
            icon={option.icon}
          />
        ))}
        {nav}
      </div>
    </>
  );
};

export default ReadingGoalTypeTab;
