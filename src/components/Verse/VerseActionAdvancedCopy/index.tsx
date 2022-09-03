import { useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import VerseAdvancedCopy from '../AdvancedCopy/VerseAdvancedCopy';

import styles from './VerseActionAdvancedCopy.module.scss';

import ContentModal from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import Action from '@/dls/Modal/Action';
import Footer from '@/dls/Modal/Footer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Spinner from '@/dls/Spinner/Spinner';
import AdvancedCopyIcon from '@/icons/clipboard.svg';
import { logEvent } from '@/utils/eventLogger';
import Verse from 'types/Verse';

type VerseActionAdvancedCopyProps = {
  verse: Verse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
};

const CLOSE_POPOVER_AFTER_MS = 150;

const VerseActionAdvancedCopy = ({
  verse,
  isTranslationView,
  onActionTriggered,
}: VerseActionAdvancedCopyProps) => {
  const { t } = useTranslation('quran-reader');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const contentModalRef = useRef<ContentModalHandles>();

  const onModalClose = () => {
    logEvent(
      // eslint-disable-next-line i18next/no-literal-string
      `${isTranslationView ? 'translation_view' : 'reading_view'}_advanced_copy_modal_close`,
    );
    setIsModalOpen(false);
    if (onActionTriggered) {
      setTimeout(() => {
        // we set a really short timeout to close the popover after the modal has been closed to allow enough time for the fadeout css effect to apply.
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
  };

  const onModalOpen = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logEvent(`${isTranslationView ? 'translation_view' : 'reading_view'}_advanced_copy_modal_open`);
    setIsModalOpen(true);
  };

  return (
    <>
      <PopoverMenu.Item icon={<AdvancedCopyIcon />} onClick={onModalOpen}>
        {t('advanced-copy')}
      </PopoverMenu.Item>
      <ContentModal
        innerRef={contentModalRef}
        isOpen={isModalOpen}
        header={<p className={styles.header}>{t('advanced-copy')}</p>}
        hasCloseButton
        onClose={onModalClose}
        onEscapeKeyDown={onModalClose}
        contentClassName={styles.contentWrapper}
      >
        <VerseAdvancedCopy verse={verse}>
          {({ ayahSelectionComponent, actionText, onCopy, loading }) => (
            <>
              {ayahSelectionComponent}
              <div className={styles.footerContainer}>
                <Footer>
                  <Action isDisabled={loading} onClick={onCopy}>
                    {loading ? <Spinner /> : actionText}
                  </Action>
                </Footer>
              </div>
            </>
          )}
        </VerseAdvancedCopy>
      </ContentModal>
    </>
  );
};

export default VerseActionAdvancedCopy;
