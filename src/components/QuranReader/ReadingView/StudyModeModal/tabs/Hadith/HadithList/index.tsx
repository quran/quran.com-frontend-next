import useTranslation from 'next-translate/useTranslation';

import styles from './HadithList.module.scss';

import replaceBreaksWithSpans from '@/components/QuranReader/ReadingView/StudyModeModal/tabs/Hadith/utility';
import LoadingSpinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { HadithReference } from '@/types/Hadith';
import Language from '@/types/Language';

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
  const { lang } = useTranslation('common');

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

            <div className={styles.hadithContentContainer}>
              {Language.AR !== lang && hadith.enBody && (
                <div
                  className={styles.hadithBody}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: replaceBreaksWithSpans(hadith.enBody.toString()),
                  }}
                />
              )}

              {hadith.arBody && (
                <div
                  data-lang="ar"
                  dir="rtl"
                  className={styles.hadithBody}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: replaceBreaksWithSpans(hadith.arBody.toString()),
                  }}
                />
              )}
            </div>
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
