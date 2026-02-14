import React from 'react';

import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import { parseHadithNumbers } from '../utility';

import HadithContent from './HadithContent';
import styles from './HadithList.module.scss';

import Error from '@/components/Error';
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
  const { lang } = useTranslation();
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
      <div className={styles.notice}>
        <Trans
          i18nKey="quran-reader:hadith.notice"
          components={{
            0: (
              <a
                key={0}
                target="_blank"
                rel="noopener noreferrer"
                href="https://sunnah.com/bukhari/about"
                aria-label="Sahih al-Bukhari"
              />
            ),
            1: (
              <a
                key={1}
                target="_blank"
                rel="noopener noreferrer"
                href="https://sunnah.com/muslim/about"
                aria-label="Sahih Muslim"
              />
            ),
          }}
        />
      </div>
      {hadiths.map((hadith, index) => {
        const hadithNumbers = parseHadithNumbers(hadith.hadithNumber, lang as Language);
        const [firstHadithNumber, ...restHadithNumbers] = hadithNumbers;

        return (
          <React.Fragment key={`${hadith.collection}-${hadith.hadithNumber}`}>
            <div className={styles.hadithCard}>
              <div className={styles.hadithSource}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={getSunnahUrl(hadith.collection, firstHadithNumber?.link ?? '')}
                  className={styles.link}
                >
                  {hadith.name}{' '}
                  <span className={styles.number}>{firstHadithNumber?.localized ?? ''}</span>
                </a>

                {restHadithNumbers.map((hadithNumber) => (
                  <a
                    key={hadithNumber.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={getSunnahUrl(hadith.collection, hadithNumber.link)}
                    className={classNames(styles.link, styles.number)}
                  >
                    {hadithNumber.localized}
                  </a>
                ))}
              </div>

              <HadithContent enBody={hadith.en?.body} arBody={hadith.ar?.body} />
            </div>

            {index < hadiths.length - (isLoadingMore ? 0 : 1) && <div className={styles.divider} />}
          </React.Fragment>
        );
      })}

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
