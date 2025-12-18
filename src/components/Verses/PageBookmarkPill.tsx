import useTranslation from 'next-translate/useTranslation';

import styles from './BookmarkPill.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import CloseIcon from '@/icons/close.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getPageNavigationUrl } from '@/utils/navigation';

interface Props {
  pageNumber: number;
  onDeleted: (pageNumber: number) => void;
  isDeleting?: boolean;
}

const PageBookmarkPill: React.FC<Props> = ({ pageNumber, onDeleted, isDeleting = false }) => {
  const { t, lang } = useTranslation('home');

  const bookmarkText = `${t('common:page')} ${toLocalizedNumber(pageNumber, lang)}`;

  const onLinkClicked = () => {
    logButtonClick('bookmarked_pages_list_link');
  };

  return (
    <div className={styles.bookmarkItem}>
      <Button
        onClick={onLinkClicked}
        href={getPageNavigationUrl(pageNumber)}
        type={ButtonType.Primary}
        variant={ButtonVariant.Compact}
        className={styles.linkButtonContainer}
        size={ButtonSize.Small}
      >
        {bookmarkText}
      </Button>
      <button
        onClick={() => onDeleted(pageNumber)}
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

export default PageBookmarkPill;
