import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import modalStyles from '@/components/Notes/modal/Modal.module.scss';
import VerseAdvancedCopy from '@/components/Verse/AdvancedCopy/VerseAdvancedCopy';
import advancedCopyStyles from '@/components/Verse/VerseActionAdvancedCopy/VerseActionAdvancedCopy.module.scss';
import ContentModal from '@/dls/ContentModal/ContentModal';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Action from '@/dls/Modal/Action';
import Footer from '@/dls/Modal/Footer';
import Spinner from '@/dls/Spinner/Spinner';
import ArrowIcon from '@/icons/arrow.svg';
import Verse from '@/types/Verse';

interface AdvancedCopyModalProps {
  verse: Verse;
  wasOpenedFromStudyMode: boolean;
  onClose: () => void;
  onBack: () => void;
}

const AdvancedCopyModal: React.FC<AdvancedCopyModalProps> = ({
  verse,
  wasOpenedFromStudyMode,
  onClose,
  onBack,
}) => {
  const { t } = useTranslation();

  const header = wasOpenedFromStudyMode ? (
    <button
      type="button"
      className={classNames(modalStyles.headerButton, modalStyles.title)}
      onClick={onBack}
    >
      <IconContainer
        icon={<ArrowIcon />}
        shouldForceSetColors={false}
        size={IconSize.Custom}
        className={modalStyles.arrowIcon}
      />
      {t('quran-reader:advanced-copy')}
    </button>
  ) : (
    <p className={advancedCopyStyles.header}>{t('quran-reader:advanced-copy')}</p>
  );

  return (
    <ContentModal
      isOpen
      header={header}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      contentClassName={advancedCopyStyles.contentWrapper}
    >
      <VerseAdvancedCopy verse={verse}>
        {({ ayahSelectionComponent, actionText, onCopy, loading }) => (
          <>
            {ayahSelectionComponent}
            <div className={advancedCopyStyles.footerContainer}>
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
  );
};

export default AdvancedCopyModal;
