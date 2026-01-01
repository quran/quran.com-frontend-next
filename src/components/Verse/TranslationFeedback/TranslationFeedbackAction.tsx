import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './TranslationFeedbackAction.module.scss';
import TranslationFeedbackModal from './TranslationFeedbackModal';

import ContentModal from '@/dls/ContentModal/ContentModal';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import FeedbackIcon from '@/icons/translation-feedback.svg';
import { WordVerse } from '@/types/Word';
import { isLoggedIn } from '@/utils/auth/login';
import { logEvent } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';

interface TranslationFeedbackActionProps {
  verse: WordVerse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
}

const CLOSE_POPOVER_AFTER_MS = 150;

const TranslationFeedbackAction: React.FC<TranslationFeedbackActionProps> = ({
  verse,
  isTranslationView,
  onActionTriggered,
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const getEventName = useCallback(
    (action: string) =>
      `${
        isTranslationView ? 'translation_view' : 'reading_view'
      }_translation_feedback_modal_${action}`,
    [isTranslationView],
  );

  const onModalClose = useCallback(() => {
    logEvent(getEventName('close'));

    setIsModalOpen(false);

    if (onActionTriggered) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      closeTimeoutRef.current = setTimeout(() => {
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
  }, [getEventName, onActionTriggered]);

  const onModalOpen = useCallback(() => {
    logEvent(getEventName('open'));
    setIsModalOpen(true);
  }, [getEventName]);

  /**
   * Handles click events for guest users, redirecting to login if not authenticated,
   * otherwise opens the translation feedback modal.
   */
  const handleGuestUserClick = useCallback(() => {
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verse.verseKey)));
      return;
    }

    onModalOpen();
  }, [router, verse.verseKey, onModalOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<FeedbackIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
          />
        }
        onClick={handleGuestUserClick}
        dataTestId="verse-actions-menu-translation-feedback"
      >
        {t('translation-feedback.title')}
      </PopoverMenu.Item>

      <ContentModal
        isOpen={isModalOpen}
        header={<p className={styles.title}>{t('translation-feedback.title')}</p>}
        hasCloseButton
        onClose={onModalClose}
        contentClassName={styles.content}
        overlayClassName={styles.overlay}
        headerClassName={styles.headerClassName}
        onEscapeKeyDown={onModalClose}
      >
        <TranslationFeedbackModal verse={verse} onClose={onModalClose} />
      </ContentModal>
    </>
  );
};

export default TranslationFeedbackAction;
