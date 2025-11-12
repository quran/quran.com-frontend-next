import { useState } from 'react';

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

type TranslationFeedbackActionProps = {
  verse: WordVerse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
};

const CLOSE_POPOVER_AFTER_MS = 150;

const TranslationFeedbackAction = ({
  verse,
  isTranslationView,
  onActionTriggered,
}: TranslationFeedbackActionProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onModalClose = () => {
    logEvent(
      `${isTranslationView ? 'translation_view' : 'reading_view'}_translation_feedback_modal_close`,
    );

    setIsModalOpen(false);

    if (onActionTriggered) {
      setTimeout(() => {
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
  };

  const onModalOpen = () => {
    logEvent(
      `${isTranslationView ? 'translation_view' : 'reading_view'}_translation_feedback_modal_open`,
    );

    setIsModalOpen(true);
  };

  const handleGuestUserClick = () => {
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verse.verseKey)));
      return;
    }

    onModalOpen();
  };

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
      >
        {t('translation-feedback.title')}
      </PopoverMenu.Item>

      <ContentModal
        isOpen={isModalOpen}
        header={<p className={styles.title}>{t('translation-feedback.title')}</p>}
        hasCloseButton
        onClose={onModalClose}
        onEscapeKeyDown={onModalClose}
      >
        <TranslationFeedbackModal verse={verse} onClose={onModalClose} />
      </ContentModal>
    </>
  );
};

export default TranslationFeedbackAction;
