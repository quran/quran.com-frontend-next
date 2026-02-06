import React from 'react';

import HadithContent from './HadithContent';
import styles from './HadithList.module.scss';

import Error from '@/components/Error';
import LoadingSpinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { HadithReference } from '@/types/Hadith';

const getSunnahUrl = (collection: string, hadithNumber: string) => {
  return `https://www.sunnah.com/${collection}:${hadithNumber}`;
};

type HadithListProps = {
  hadiths: HadithReference[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isValidating?: boolean;
  hasErrorInPages?: boolean;
  onLoadMore?: () => void;
  error?: unknown;
  onRetry?: () => void;
};

const HadithList: React.FC<HadithListProps> = ({
  hadiths,
  hasMore = false,
  isLoadingMore = false,
  isValidating = false,
  onLoadMore,
  hasErrorInPages = false,
  error,
  onRetry,
}) => {
  const loadMoreTriggerRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore,
  });

  const isLoadingUi = onLoadMore && (isLoadingMore || isValidating);
  const isErrorUi = (error || hasErrorInPages) && onRetry && !isLoadingUi;
  const isTriggerUi = hasMore && onLoadMore && !isLoadingUi && !isErrorUi;

  return (
    <div className={styles.container}>
      {hadiths.map((hadith, index) => (
        <React.Fragment key={`${hadith.collection}-${hadith.hadithNumber}`}>
          <div className={styles.hadithCard}>
            <a
              className={styles.hadithSource}
              target="_blank"
              rel="noopener noreferrer"
              href={getSunnahUrl(
                hadith.collection,
                hadith.hadithNumber.toString().replaceAll(' ', ''),
              )}
            >
              {hadith.name} <span className={styles.number}>{hadith.hadithNumber}</span>
            </a>

            <HadithContent enBody={hadith.enBody} arBody={hadith.arBody} />
          </div>

          {index < hadiths.length - (isLoadingMore ? 0 : 1) && <div className={styles.divider} />}
        </React.Fragment>
      ))}

      {isErrorUi && (
        <div className={styles.statusContainer} data-status="error">
          <Error error={(error ?? {}) as Error} onRetryClicked={onRetry} />
        </div>
      )}

      {isLoadingUi && (
        <div className={styles.statusContainer} data-status="loading">
          <LoadingSpinner size={SpinnerSize.Large} />
        </div>
      )}

      {isTriggerUi && <div ref={loadMoreTriggerRef} className={styles.infiniteScrollTrigger} />}
    </div>
  );
};

export default HadithList;
