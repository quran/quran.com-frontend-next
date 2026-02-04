import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './GuestBookmarksMigrationModal.module.scss';

import Button from '@/dls/Button/Button';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import CloseIcon from '@/icons/close.svg';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import { selectBookmarks } from '@/redux/slices/QuranReader/bookmarks';
import { getLoginNavigationUrl } from '@/utils/navigation';
import { isAuthPage } from '@/utils/routes';

const OPT_OUT_STORAGE_KEY = 'guest-bookmarks-migration:opt-out';
const NEXT_SHOW_STORAGE_KEY = 'guest-bookmarks-migration:next-show';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const GuestBookmarksMigrationModal = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isLoggedIn } = useIsLoggedIn();
  const isPersistGateHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);

  const [isOpen, setIsOpen] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const hasGuestBookmarks = useMemo(
    () => Object.keys(bookmarkedVerses).length > 0,
    [bookmarkedVerses],
  );

  const isOnAuthPage = isAuthPage(router);

  useEffect(() => {
    if (!isPersistGateHydrationComplete) return;

    if (isLoggedIn) {
      setIsOpen(false);
      return;
    }

    if (!hasGuestBookmarks) {
      setIsOpen(false);
      return;
    }

    if (isOnAuthPage) {
      setIsOpen(false);
      return;
    }

    if (typeof window === 'undefined') return;

    const isOptedOut = localStorage.getItem(OPT_OUT_STORAGE_KEY) === '1';
    if (isOptedOut) {
      setIsOpen(false);
      return;
    }

    const nextShowAtValue = localStorage.getItem(NEXT_SHOW_STORAGE_KEY);
    const nextShowAt = nextShowAtValue ? Number(nextShowAtValue) : 0;

    if (nextShowAt && Date.now() < nextShowAt) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
  }, [isPersistGateHydrationComplete, isLoggedIn, hasGuestBookmarks, isOnAuthPage, router.asPath]);

  useEffect(() => {
    if (isOpen) {
      setDoNotShowAgain(false);
    }
  }, [isOpen]);

  const persistOptOut = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(OPT_OUT_STORAGE_KEY, '1');
    localStorage.removeItem(NEXT_SHOW_STORAGE_KEY);
  }, []);

  const handleCancel = useCallback(() => {
    if (doNotShowAgain) {
      persistOptOut();
    } else if (typeof window !== 'undefined') {
      localStorage.setItem(NEXT_SHOW_STORAGE_KEY, String(Date.now() + ONE_DAY_MS));
    }

    setIsOpen(false);
  }, [doNotShowAgain, persistOptOut]);

  const handleSignIn = useCallback(() => {
    if (doNotShowAgain) {
      persistOptOut();
    }

    setIsOpen(false);
    const redirectUrl = router.asPath || '/';
    router.push(getLoginNavigationUrl(redirectUrl));
  }, [doNotShowAgain, persistOptOut, router]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClickOutside={handleCancel}
      onEscapeKeyDown={handleCancel}
      size={ModalSize.MEDIUM}
      contentClassName={styles.modal}
    >
      <Modal.Body>
        <div className={styles.container}>
          <div className={styles.header}>
            <Modal.Title>
              <span className={styles.title}>{t('bookmarks-migration.title')}</span>
            </Modal.Title>
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleCancel}
              aria-label={t('close')}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Divider */}
          <hr className={styles.divider} />

          <div className={styles.body}>
            <p className={styles.paragraph}>
              <Trans
                i18nKey="common:bookmarks-migration.body-1"
                components={{ strong: <strong className={styles.emphasis} /> }}
              />
            </p>
            <p className={styles.paragraph}>{t('bookmarks-migration.body-2')}</p>
          </div>

          <div className={styles.checkboxRow}>
            <Checkbox
              id="guest-bookmarks-migration-opt-out"
              checked={doNotShowAgain}
              onChange={(checked) => setDoNotShowAgain(Boolean(checked))}
              label={t('bookmarks-migration.checkbox')}
              checkboxClassName={styles.checkbox}
              containerClassName={styles.checkboxContainer}
              indicatorClassName={styles.checkboxIndicator}
            />
          </div>

          {/* Divider */}
          <hr className={styles.divider} />

          <div className={styles.actions}>
            <Button className={styles.primaryButton} onClick={handleSignIn}>
              {t('bookmarks-migration.sign-in')}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default GuestBookmarksMigrationModal;
