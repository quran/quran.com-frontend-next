import useTranslation from 'next-translate/useTranslation';

import { ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import OptionButton from './OptionButton';
import styles from './ReadingGoalPage.module.scss';

import CalendarIcon from '@/icons/calendar.svg';
import RepeatIcon from '@/icons/repeat.svg';
import { QuranGoalPeriod } from '@/types/auth/Goal';

const options = [
  {
    key: QuranGoalPeriod.Daily,
    icon: RepeatIcon,
  },
  {
    key: QuranGoalPeriod.Continuous,
    icon: CalendarIcon,
  },
] as const;

type SetPeriodAction = {
  type: 'SET_PERIOD';
  payload: { period: QuranGoalPeriod };
};

const setPeriodAction = (period: QuranGoalPeriod): SetPeriodAction => ({
  type: 'SET_PERIOD',
  payload: { period },
});

const ReadingGoalTimeTab: React.FC<ReadingGoalTabProps> = ({ state, dispatch, nav, logClick }) => {
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
              dispatch(setPeriodAction(option.key));
              logClick(option.key);
            }}
            selected={state.period === option.key}
            option={t(`${option.key.toLowerCase()}.title`)}
            description={t(`${option.key.toLowerCase()}.description`)}
          />
        ))}
        {nav}
      </div>
    </>
  );
};

export default ReadingGoalTimeTab;
