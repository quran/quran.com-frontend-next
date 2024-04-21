import { useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import DaysCalendar from './DaysCalendar';
import styles from './ReadingHistory.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import ArrowLeft from '@/icons/west.svg';
import { ActivityDay, QuranActivityDay } from '@/types/auth/ActivityDay';
import Pagination from '@/types/auth/Pagination';
import { getFilterActivityDaysParams } from '@/utils/activity-day';
import { privateFetcher } from '@/utils/auth/api';
import { makeFilterActivityDaysUrl } from '@/utils/auth/apiPaths';
import { dateToReadableFormat } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';

interface MonthModalProps {
  month: { id: number; name: string; daysCount: number };
  year: number;
  onClose: () => void;
}

const MonthModal = ({ month, year, onClose }: MonthModalProps) => {
  const contentModalRef = useRef<ContentModalHandles>();
  const { t, lang } = useTranslation('reading-progress');

  // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string | null>();

  const params = getFilterActivityDaysParams(month.id, year);

  const localizedYear = toLocalizedNumber(year, lang, undefined, {
    useGrouping: false,
  });

  const readableDate = selectedDate
    ? dateToReadableFormat(selectedDate, lang, {
        year: 'numeric',
      })
    : `${month.name} ${localizedYear}`;

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
        <DataFetcher
          queryKey={makeFilterActivityDaysUrl(params)}
          loading={() => (
            <DaysCalendar
              isLoading
              month={month}
              year={year}
              days={[]}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}
          fetcher={privateFetcher}
          render={(response) => {
            const data = response as {
              data: ActivityDay<QuranActivityDay>[];
              pagination: Pagination;
            };
            const isEmpty = data.data.length === 0;

            return (
              <>
                {isEmpty && (
                  <p className={styles.emptyMessage}>
                    {t('no-reading-history-for', { date: readableDate })}
                  </p>
                )}

                <DaysCalendar
                  month={month}
                  year={year}
                  days={data.data}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </>
            );
          }}
        />
      </div>
    </ContentModal>
  );
};

export default MonthModal;
