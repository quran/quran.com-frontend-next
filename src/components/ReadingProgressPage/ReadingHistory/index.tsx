import { useMemo, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import pageStyles from '../ReadingProgressPage.module.scss';

import AddReading from './AddReading';
import MonthModal from './MonthModal';
import styles from './ReadingHistory.module.scss';

import Select from '@/dls/Forms/Select';
import SelectionCard from '@/dls/SelectionCard/SelectionCard';
import { getMonthsInYear } from '@/utils/datetime';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';

const ReadingHistory = () => {
  const { t, lang } = useTranslation('reading-progress');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const availableYears = useMemo(() => {
    const startYear = 2023;
    const currentYear = new Date().getFullYear();

    // eslint-disable-next-line @typescript-eslint/naming-convention
    return Array.from({ length: currentYear - (startYear - 1) }, (_, i) => i + startYear).map(
      (year) => ({
        label: toLocalizedNumber(year, lang, undefined, { useGrouping: false }),
        value: year.toString(),
      }),
    );
  }, [lang]);

  const months = useMemo(() => getMonthsInYear(selectedYear, lang), [selectedYear, lang]);

  const selectedMonthObj = useMemo(() => {
    if (!selectedMonth) return null;
    return months.find((month) => month.id === selectedMonth);
  }, [selectedMonth, months]);

  const localizedSelectedYear = toLocalizedNumber(selectedYear, lang, undefined, {
    useGrouping: false,
  });

  const onMonthClick = (month: number) => {
    logButtonClick('reading_history_month', {
      month,
      year: selectedYear,
    });
    setSelectedMonth(month);
  };

  const onYearChange = (newValue: string) => {
    const newYear = Number(newValue);
    logValueChange('reading_history_year', selectedYear, newYear);

    setSelectedYear(newYear);
  };

  return (
    <div className={pageStyles.historySection}>
      {!!selectedMonth && (
        <MonthModal
          month={selectedMonthObj}
          year={selectedYear}
          onClose={() => setSelectedMonth(null)}
        />
      )}

      <div className={styles.titleContainer}>
        <div className={styles.title}>
          <h1>{t('history')}</h1>
          <Select
            id="reading-history-year-select"
            name="reading-history-year-select"
            options={availableYears}
            value={selectedYear.toString()}
            onChange={onYearChange}
          />
        </div>
        <AddReading />
      </div>

      <div className={classNames(pageStyles.historyContainer, styles.monthsContainer)}>
        {months.map((month) => (
          <SelectionCard
            key={month.id}
            label={localizedSelectedYear}
            value={month.name}
            onClick={() => onMonthClick(month.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ReadingHistory;
