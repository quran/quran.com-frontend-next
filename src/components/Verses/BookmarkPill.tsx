import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './BookmarkPill.module.scss';

import DataContext from '@/contexts/DataContext';
import Link from '@/dls/Link/Link';
import CloseIcon from '@/icons/close.svg';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getVerseNavigationUrlByVerseKey } from '@/utils/navigation';
import { getChapterNumberFromKey } from '@/utils/verse';

interface Props {
  verseKey: string;
  onDeleted: (verseKey: string) => void;
}

const BookmarkPill: React.FC<Props> = ({ verseKey, onDeleted }) => {
  const { lang } = useTranslation();
  const chaptersData = useContext(DataContext);

  const chapterNumber = getChapterNumberFromKey(verseKey);
  const chapterData = getChapterData(chaptersData, chapterNumber.toString());

  const bookmarkText = `${chapterData.transliteratedName} ${toLocalizedVerseKey(verseKey, lang)}`;

  const onLinkClicked = () => {
    logButtonClick('bookmarked_verses_list_link');
  };

  return (
    <div className={styles.bookmarkItem}>
      <Link
        href={getVerseNavigationUrlByVerseKey(verseKey)}
        onClick={onLinkClicked}
        className={styles.linkButtonContainer}
      >
        {bookmarkText}
      </Link>
      <button
        onClick={() => onDeleted(verseKey)}
        type="button"
        className={styles.closeIconContainer}
      >
        <span>
          <CloseIcon />
        </span>
      </button>
    </div>
  );
};

export default BookmarkPill;
