import { useRef, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ContentModal from '@/components/dls/ContentModal/ContentModal';
import TafsirBody from '@/components/QuranReader/TafsirView/TafsirBody';
import styles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import TafsirIcon from '@/icons/book-open.svg';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { fakeNavigate, getVerseSelectedTafsirNavigationUrl } from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

type Props = {
  verseKey: string;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;
};

const TafsirButton: React.FC<Props> = ({
  verseKey,
  isTranslationView = true,
  onActionTriggered,
}) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const tafsirs = useSelector(selectSelectedTafsirs);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);

  const onButtonClicked = () => {
    logButtonClick(
      `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_tafsir`,
    );
    setIsContentModalOpen(true);
    fakeNavigate(
      getVerseSelectedTafsirNavigationUrl(chapterId, Number(verseNumber), tafsirs[0]),
      lang,
    );
  };

  const contentModalRef = useRef(null);

  const onModalClose = () => {
    if (isTranslationView) {
      logEvent('translation_view_tafsir_modal_close');
    } else {
      logEvent('reading_view_tafsir_modal_close');
    }
    setIsContentModalOpen(false);
    fakeNavigate(router.asPath, router.locale);
    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  return (
    <>
      <Button
        variant={ButtonVariant.Ghost}
        onClick={onButtonClicked}
        size={ButtonSize.Small}
        tooltip={t('quran-reader:tafsirs')}
        shouldFlipOnRTL={false}
        shape={ButtonShape.Circle}
        className={classNames(
          styles.iconContainer,
          styles.verseAction,
          {
            [styles.fadedVerseAction]: isTranslationView,
          },
          'tafsir-verse-button', // for onboarding
        )}
        ariaLabel={t('quran-reader:aria.read-tafsirs')}
      >
        <span className={styles.icon}>
          <TafsirIcon />
        </span>
      </Button>
      <TafsirBody
        shouldRender={isContentModalOpen}
        initialChapterId={chapterId.toString()}
        initialVerseNumber={verseNumber.toString()}
        scrollToTop={() => {
          contentModalRef.current.scrollToTop();
        }}
        render={({ body, languageAndTafsirSelection, surahAndAyahSelection }) => {
          return (
            <ContentModal
              innerRef={contentModalRef}
              isOpen={isContentModalOpen}
              hasCloseButton
              onClose={onModalClose}
              onEscapeKeyDown={onModalClose}
              header={surahAndAyahSelection}
            >
              {languageAndTafsirSelection}
              {body}
            </ContentModal>
          );
        }}
      />
    </>
  );
};

export default TafsirButton;
