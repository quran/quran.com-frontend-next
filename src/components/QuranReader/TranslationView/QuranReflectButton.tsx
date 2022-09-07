import { useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import styles from './TranslationViewCell.module.scss';

import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import ChatIcon from '@/icons/chat.svg';
// import { logButtonClick } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getQuranReflectVerseUrl,
  // getVerseReflectionNavigationUrl,
} from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

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

  // const onButtonClicked = () => {
  //   // eslint-disable-next-line i18next/no-literal-string
  //   logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_reflect`);
  //   setIsContentModalOpen(true);
  //   fakeNavigate(getVerseReflectionNavigationUrl(verseKey), lang);
  // };

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
        isNewTab
        // onClick={onButtonClicked}
        href={getQuranReflectVerseUrl(verseKey)}
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
