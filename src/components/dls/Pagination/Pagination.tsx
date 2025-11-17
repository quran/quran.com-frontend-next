/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';

import classNames from 'classnames';
import range from 'lodash/range';
import useTranslation from 'next-translate/useTranslation';

import styles from './Pagination.module.scss';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import PreviousIcon from '@/icons/caret-back.svg';
import NextIcon from '@/icons/caret-forward.svg';
import { toLocalizedNumber } from '@/utils/locale';

interface Props {
  currentPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  pageSize?: number;
  siblingsCount?: number;
  showSummary?: boolean;
}

const DOTS = '...';
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SIBLINGS_COUNT = 1;

/**
 * @param {number} start
 * @param {number} end
 * @returns {number[]}
 */
const generateRange = (start: number, end: number): number[] => range(start, end + 1);
const Pagination: React.FC<Props> = ({
  onPageChange,
  totalCount,
  currentPage,
  pageSize = DEFAULT_PAGE_SIZE,
  siblingsCount = DEFAULT_SIBLINGS_COUNT,
  showSummary = true,
}) => {
  const { t, lang } = useTranslation('common');
  const paginationRange = useMemo(() => {
    // Math.ceil is used to round the number to the next higher integer value e.g. 0.7 gets rounded to 1, 1.1 gets rounded to 2. This ensures that we are reserving an extra page for the remaining data.
    const totalPageCount = Math.ceil(totalCount / pageSize);
    // Pages count is the sum of siblingsCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingsCount + 5;
    // if the page numbers we want to show is >= the actual number of pages we have (e.g. only pages 1, 2), we just return the range [1..totalPageCount] without any addition like the dots before and after and first and last page since the range is too small.
    if (totalPageNumbers >= totalPageCount) {
      return generateRange(1, totalPageCount);
    }
    // Calculate left and right siblings index and make sure they are within the range 1 => totalPageCount
    const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPageCount);
    // We do not want to show dots if there is only one position left after/before the left/right page count.
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;
    // No left dots to be shown, but the right dots should be shown
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingsCount;
      const leftRange = generateRange(1, leftItemCount);
      return [...leftRange, DOTS, totalPageCount];
    }
    // No right dots to be shown, but the left dots should be shown
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingsCount;
      const rightRange = generateRange(totalPageCount - rightItemCount + 1, totalPageCount);
      return [firstPageIndex, DOTS, ...rightRange];
    }
    // the right and left dots should be shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = generateRange(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
    return [];
  }, [totalCount, pageSize, siblingsCount, currentPage]);

  if (currentPage === 0 || paginationRange.length < 1) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  const showingUntilItem = currentPage * pageSize;
  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <Button
          tooltip={t('prev')}
          variant={ButtonVariant.Ghost}
          isDisabled={currentPage === 1}
          onClick={onPrevious}
        >
          <PreviousIcon />
        </Button>
      </div>
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return <div key={`${pageNumber}-${index}`}>{DOTS}</div>;
        }

        return (
          <div
            className={classNames(styles.buttonContainer, {
              [styles.selectedButton]: pageNumber === currentPage,
            })}
            key={`${pageNumber}-${index}`}
          >
            <Button
              variant={ButtonVariant.Ghost}
              onClick={() => onPageChange(pageNumber as number)}
            >
              {toLocalizedNumber(Number(pageNumber), lang)}
            </Button>
          </div>
        );
      })}
      <div className={styles.buttonContainer}>
        <Button
          tooltip={t('next')}
          variant={ButtonVariant.Ghost}
          isDisabled={currentPage === paginationRange[paginationRange.length - 1]}
          onClick={onNext}
        >
          <NextIcon />
        </Button>
      </div>
      {showSummary && (
        <p className={styles.uppercase}>
          {t('pagination-summary', {
            currentResultNumber: toLocalizedNumber(showingUntilItem - (pageSize - 1), lang),
            endOfResultNumber: toLocalizedNumber(
              totalCount < showingUntilItem ? totalCount : showingUntilItem,
              lang,
            ),
            totalNumberOfResults: toLocalizedNumber(totalCount, lang),
          })}
        </p>
      )}
    </div>
  );
};

export default Pagination;
