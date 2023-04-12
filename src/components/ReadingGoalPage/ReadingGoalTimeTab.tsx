import useTranslation from 'next-translate/useTranslation';

import { ReadingGoalPeriod, ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import OptionButton from './OptionButton';
import styles from './ReadingGoalPage.module.scss';

import CalendarIcon from '@/icons/calendar.svg';
import RepeatIcon from '@/icons/repeat.svg';

const options = [
  {
    key: ReadingGoalPeriod.Daily,
    icon: RepeatIcon,
  },
  {
    key: ReadingGoalPeriod.Continuous,
    icon: CalendarIcon,
  },
] as const;

const ReadingGoalTimeTab: React.FC<ReadingGoalTabProps> = ({
  state,
  dispatch,
  nav,
  logTabEvent,
}) => {
  const { t } = useTranslation('reading-goal');

  return (
    <>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{t('frequency-tab.title')}</h1>
        <p className={styles.subtitle}>{t('frequency-tab.description')}</p>
      </div>

      <div className={styles.optionsContainer}>
        {options.map((option) => (
          <OptionButton
            key={option.key}
            icon={option.icon}
            onSelect={() => {
              dispatch({ type: 'SET_PERIOD', payload: { period: option.key } });
              logTabEvent(option.key);
            }}
            selected={state.period === option.key}
            option={t(`${option.key}.title`)}
            description={t(`${option.key}.description`)}
          />
        ))}
        {nav}
      </div>
    </>
  );
};

export default ReadingGoalTimeTab;
