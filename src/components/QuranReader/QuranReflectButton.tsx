/**
 * @deprecated This component is being replaced by BottomActions component which now handles
 * the rendering of reflection modals directly. This component is kept for backward compatibility
 * and will be removed in a future release.
 *
 * QuranReflectButton renders a button that opens a reflection modal when clicked.
 * It updates the URL via fakeNavigate to reflect the reflection state without triggering
 * a full page navigation.
 */
import { useRef, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ContentModal from '@/components/dls/ContentModal/ContentModal';
import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import styles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ChatIcon from '@/icons/chat.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { fakeNavigate, getVerseReflectionNavigationUrl } from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

/**
 * Props for the QuranReflectButton component
 * @typedef {object} QuranReflectButtonProps
 * @property {string} verseKey - The verse key to show reflections for
 * @property {boolean} [isTranslationView=true] - Whether this is in translation view
 * @property {Function} [onActionTriggered] - Callback for when the action is triggered
 */
type QuranReflectButtonProps = {
  verseKey: string;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;
};

/**
 * @deprecated Use BottomActions component instead which now handles reflection modals directly
 *
 * Button component that opens a reflection modal when clicked
 * @param {QuranReflectButtonProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const QuranReflectButton = ({
  verseKey,
  isTranslationView = true,
  onActionTriggered,
}: QuranReflectButtonProps) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  /**
   * Handles button click event
   * Opens the reflection modal and updates the URL via fakeNavigate
   */
  const onButtonClicked = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_reflect`);
    setIsContentModalOpen(true);
    fakeNavigate(getVerseReflectionNavigationUrl(verseKey), lang);
  };

  const contentModalRef = useRef(null);

  /**
   * Handles modal close event
   * Logs the event, closes the modal, resets the URL, and calls the onActionTriggered callback
   */
  const onModalClose = () => {
    setIsContentModalOpen(false);
    fakeNavigate(router.asPath, lang);
    onActionTriggered?.();
  };

  const [initialChapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);

  return (
    <>
      <Button
        variant={ButtonVariant.Ghost}
        onClick={onButtonClicked}
        size={ButtonSize.Small}
        tooltip={t('reflections-and-lessons')}
        shouldFlipOnRTL={false}
        shape={ButtonShape.Circle}
        className={classNames(
          styles.iconContainer,
          styles.verseAction,
          {
            [styles.fadedVerseAction]: isTranslationView,
          },
          'reflection-verse-button', // for onboarding
        )}
        ariaLabel={t('quran-reader:aria.read-ayah-refls')}
      >
        <span className={styles.icon}>
          <ChatIcon />
        </span>
      </Button>
      <ReflectionBodyContainer
        initialChapterId={initialChapterId}
        initialVerseNumber={verseNumber}
        scrollToTop={() => {
          contentModalRef.current.scrollToTop();
        }}
        render={({ surahAndAyahSelection, body }) => (
          <ContentModal
            innerRef={contentModalRef}
            isOpen={isContentModalOpen}
            hasCloseButton
            onClose={onModalClose}
            onEscapeKeyDown={onModalClose}
            header={surahAndAyahSelection}
          >
            {body}
          </ContentModal>
        )}
      />
    </>
  );
};

export default QuranReflectButton;
