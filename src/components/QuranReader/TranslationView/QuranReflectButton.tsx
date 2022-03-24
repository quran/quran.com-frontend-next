import { useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import ChatIcon from '../../../../public/icons/chat.svg';

import styles from './TranslationViewCell.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import ContentModal from 'src/components/dls/ContentModal/ContentModal';
import ReflectionBodyContainer from 'src/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import { logButtonClick } from 'src/utils/eventLogger';
import { fakeNavigate, getVerseReflectionNavigationUrl } from 'src/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';

type QuranReflectButtonProps = {
  verseKey: string;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;
};

const QuranReflectButton = ({
  verseKey,
  isTranslationView = true,
  onActionTriggered,
}: QuranReflectButtonProps) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  const onButtonClicked = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_reflect`);
    setIsContentModalOpen(true);
    fakeNavigate(getVerseReflectionNavigationUrl(verseKey), lang);
  };

  const contentModalRef = useRef(null);

  const onModalClose = () => {
    setIsContentModalOpen(false);
    fakeNavigate(router.asPath, lang);
    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  const [initialChapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);

  return (
    <>
      <Button
        variant={ButtonVariant.Ghost}
        onClick={onButtonClicked}
        size={ButtonSize.Small}
        tooltip={t('reflect')}
        shouldFlipOnRTL={false}
        shape={ButtonShape.Circle}
        className={classNames(styles.iconContainer, styles.verseAction, {
          [styles.fadedVerseAction]: isTranslationView,
        })}
        ariaLabel={t('aria.read-ayah-refls')}
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
