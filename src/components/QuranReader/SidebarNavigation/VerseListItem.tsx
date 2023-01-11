import React, { useEffect } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import styles from './SidebarNavigation.module.scss';

import Link from '@/dls/Link/Link';
import { SCROLL_TO_NEAREST_ELEMENT, useScrollToElement } from '@/hooks/useScrollToElement';
import { selectIsVerseKeySelected } from '@/redux/slices/QuranReader/readingTracker';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { getVerseNumberFromKey } from '@/utils/verse';

type VerseListItemProps = {
  verseKey: string;
};
const VerseListItem = React.memo(({ verseKey }: VerseListItemProps) => {
  const { locale } = useRouter();
  const isVerseKeySelected = useSelector(selectIsVerseKeySelected(verseKey));

  const verseNumber = getVerseNumberFromKey(verseKey);
  const localizedVerseNumber = toLocalizedNumber(verseNumber, locale);

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
});

export default VerseListItem;
