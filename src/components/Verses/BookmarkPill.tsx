import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './BookmarkPill.module.scss';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import CloseIcon from '@/icons/close.svg';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getVerseNavigationUrlByVerseKey } from '@/utils/navigation';
import { getChapterNumberFromKey } from '@/utils/verse';

interface Props {
  verseKey: string;
  onDeleted: (verseKey: string) => void;
  isDeleting?: boolean;
}

const BookmarkPill: React.FC<Props> = ({ verseKey, onDeleted, isDeleting = false }) => {
  const { t, lang } = useTranslation('home');
  const chaptersData = useContext(DataContext);

  const chapterNumber = getChapterNumberFromKey(verseKey);
  const chapterData = getChapterData(chaptersData, chapterNumber.toString());

  const bookmarkText = `${chapterData.transliteratedName} ${toLocalizedVerseKey(verseKey, lang)}`;

  const onLinkClicked = () => {
    logButtonClick('bookmarked_verses_list_link');
  };

  return (
    <div className={styles.bookmarkItem}>
      <Button
        onClick={onLinkClicked}
        href={getVerseNavigationUrlByVerseKey(verseKey)}
        type={ButtonType.Primary}
        variant={ButtonVariant.Compact}
        className={styles.linkButtonContainer}
        size={ButtonSize.Small}
      >
        {bookmarkText}
      </Button>
      <button
        onClick={() => onDeleted(verseKey)}
        type="button"
        className={styles.closeIconContainer}
        aria-label={t('common:remove')}
        disabled={isDeleting}
      >
        <span className={isDeleting ? styles.deleting : undefined}>
          <CloseIcon />
        </span>
      </button>
    </div>
  );
};

export default BookmarkPill;
