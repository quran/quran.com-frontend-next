import useTranslation from 'next-translate/useTranslation';

import { ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import OptionButton from './OptionButton';
import styles from './ReadingGoalPage.module.scss';

import BookIcon from '@/icons/book.svg';
import ClockIcon from '@/icons/clock.svg';
import SettingsIcon from '@/icons/settings-stroke.svg';
import { GoalType } from '@/types/auth/Goal';

const options = [
  {
    type: GoalType.TIME,
    key: 'time',
    icon: ClockIcon,
  },
  {
    type: GoalType.PAGES,
    key: 'pages',
    icon: BookIcon,
  },
  {
    type: GoalType.RANGE,
    key: 'range',
    icon: SettingsIcon,
  },
];

const ReadingGoalTypeTab: React.FC<ReadingGoalTabProps> = ({ state, dispatch, nav, logClick }) => {
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
            onSelect={() => {
              dispatch({ type: 'SET_TYPE', payload: { type: option.type } });
              logClick(option.key);
            }}
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
