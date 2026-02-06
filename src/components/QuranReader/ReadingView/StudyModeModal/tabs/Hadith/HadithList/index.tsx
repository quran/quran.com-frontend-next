import HadithContent from './HadithContent';
import styles from './HadithList.module.scss';

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
  onLoadMore?: () => void;
};

const HadithList: React.FC<HadithListProps> = ({
  hadiths,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}) => {
  const loadMoreTriggerRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore,
  });

  return (
    <div className={styles.container}>
      {hadiths.map((hadith, index) => (
        <>
          <div key={`${hadith.collection}-${hadith.hadithNumber}`} className={styles.hadithCard}>
            <a
              className={styles.hadithSource}
              href={getSunnahUrl(hadith.collection, hadith.hadithNumber)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {hadith.name} <span className={styles.number}>{hadith.hadithNumber}</span>
            </a>

            <HadithContent enBody={hadith.enBody} arBody={hadith.arBody} />
          </div>

          {index < hadiths.length - (isLoadingMore ? 0 : 1) && <div className={styles.divider} />}
        </>
      ))}

      {hasMore &&
        onLoadMore &&
        (isLoadingMore ? (
          <div className={styles.statusContainer} data-status="loading">
            <LoadingSpinner size={SpinnerSize.Large} />
          </div>
        ) : (
          <div ref={loadMoreTriggerRef} className={styles.infiniteScrollTrigger} />
        ))}
    </div>
  );
};

export default HadithList;
