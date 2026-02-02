import React, { useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './SidebarNavigation.module.scss';

import Link from '@/dls/Link/Link';
import { SCROLL_TO_NEAREST_ELEMENT, useScrollToElement } from '@/hooks/useScrollToElement';
import { selectIsVerseKeySelected } from '@/redux/slices/QuranReader/readingTracker';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { getVerseNumberFromKey } from '@/utils/verse';

interface VerseListItemProps {
  verseKey: string;
  onVerseClick?: (e: React.MouseEvent) => void;
  isSelectedOverride?: boolean; // Optional override for selection state
}

const VerseListItem: React.FC<VerseListItemProps> = ({
  verseKey,
  onVerseClick,
  isSelectedOverride,
}) => {
  const { lang } = useTranslation();
  const isSelectedFromRedux = useSelector(selectIsVerseKeySelected(verseKey));

  // Allow a temporary selection while navigation settles. true = selected, false = not selected, undefined = use redux state
  const isVerseKeySelected =
    typeof isSelectedOverride === 'boolean' ? isSelectedOverride : isSelectedFromRedux;

  const verseNumber = getVerseNumberFromKey(verseKey);
  const localizedVerseNumber = toLocalizedNumber(verseNumber, lang);

  const [scrollTo, verseRef] = useScrollToElement<HTMLDivElement>(SCROLL_TO_NEAREST_ELEMENT);

  useEffect(() => {
    if (isVerseKeySelected) scrollTo();
  }, [scrollTo, isVerseKeySelected]);

  return (
    <Link
      href={getChapterWithStartingVerseUrl(verseKey)}
      key={verseKey}
      isShallow
      shouldPrefetch={false}
      onClick={onVerseClick}
    >
      <div
        ref={verseRef}
        className={classNames(styles.listItem, {
          [styles.selectedItem]: isVerseKeySelected,
        })}
      >
        {localizedVerseNumber}
      </div>
    </Link>
  );
};

export default VerseListItem;
