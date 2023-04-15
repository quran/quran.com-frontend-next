import { useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import DaysCalendar from './DaysCalendar';
import styles from './ReadingHistory.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import ArrowLeft from '@/icons/west.svg';
import { Pagination } from '@/types/auth/GetBookmarksByCollectionId';
import { FilterReadingDaysParams, ReadingDay } from '@/types/auth/ReadingDay';
import { privateFetcher } from '@/utils/auth/api';
import { makeFilterReadingDaysUrl } from '@/utils/auth/apiPaths';
import { toLocalizedNumber } from '@/utils/locale';

interface MonthModalProps {
  month: { id: number; name: string; daysCount: number };
  year: number;
  onClose: () => void;
}

const makeDateRangeFromMonth = (month: number, year: number) => {
  const from = `${year}-${month.toString().padStart(2, '0')}-01`;
  const to = `${year}-${month}-${new Date(year, month, 0).getDate()}`;

  return { from, to };
};

const MonthModal = ({ month, year, onClose }: MonthModalProps) => {
  const contentModalRef = useRef<ContentModalHandles>();
  const { t, lang } = useTranslation('reading-progress');
  const { from, to } = makeDateRangeFromMonth(month.id, year);

  // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string | null>();

  const params: FilterReadingDaysParams = {
    from,
    to,
    limit: 31,
  };

  const { data, isValidating } = useSWR<{
    data: ReadingDay[];
    pagination: Pagination;
  }>(makeFilterReadingDaysUrl(params), (url) => privateFetcher(url), {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const isLoading = !data && isValidating;
  const allData = data?.data ?? [];
  const isEmpty = !isLoading && allData.length === 0;

  const localizedYear = toLocalizedNumber(year, lang, undefined, {
    useGrouping: false,
  });

  const readableDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString(lang, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : `${month.name}, ${localizedYear}`;

  return (
    <ContentModal
      isOpen={!!month}
      innerRef={contentModalRef}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      header={
        <div className={styles.modalHeader}>
          {selectedDate && (
            <Button
              size={ButtonSize.Medium}
              variant={ButtonVariant.Ghost}
              onClick={() => setSelectedDate(null)}
              className={styles.backButton}
            >
              <ArrowLeft />
            </Button>
          )}
          <p>{t('history-for', { date: readableDate })}</p>
        </div>
      }
    >
      <div className={styles.modalContentContainer}>
        {isEmpty && (
          <p className={styles.emptyMessage}>
            {t('no-reading-history-for', { date: readableDate })}
          </p>
        )}
        <DaysCalendar
          month={month}
          year={year}
          days={allData}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>
    </ContentModal>
  );
};

export default MonthModal;
