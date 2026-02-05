import React, { useEffect } from 'react';

import { useRouter } from 'next/router';

import styles from './HadithList.module.scss';

import LoadingSpinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { HadithReference } from '@/types/Hadith';
import { fakeNavigate, getVerseHadithsNavigationUrl } from '@/utils/navigation';

type HadithListProps = {
  hadiths: HadithReference[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  verseKey: string;
};

const HadithList: React.FC<HadithListProps> = ({
  hadiths,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  verseKey,
}) => {
  const router = useRouter();
  const baseUrl = getVerseHadithsNavigationUrl(verseKey);

  const loadMoreTriggerRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore,
  });

  // Update URL when hadiths are loaded
  useEffect(() => {
    if (hadiths.length > 0) {
      fakeNavigate(baseUrl, router.locale);
    }
  }, [hadiths.length, baseUrl, router.locale]);

  return (
    <div className={styles.container}>
      {hadiths.map((hadith) => (
        <div key={`${hadith.collection}-${hadith.hadithNumber}`} className={styles.hadithCard}>
          <div className={styles.hadithHeader}>
            <h3 className={styles.hadithSource}>
              {hadith.name} {hadith.hadithNumber}
            </h3>
          </div>
          <div
            className={styles.hadithBody}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: router.locale === 'ar' ? hadith.arBody || '' : hadith.enBody || '',
            }}
          />
        </div>
      ))}

      {hasMore &&
        onLoadMore &&
        (isLoadingMore ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size={SpinnerSize.Large} />
          </div>
        ) : (
          <div ref={loadMoreTriggerRef} className={styles.infiniteScrollTrigger} />
        ))}
    </div>
  );
};

export default HadithList;
