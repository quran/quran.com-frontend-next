import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';

import styles from './DonatePopup.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Modal from '@/dls/Modal/Modal';
import CloseIcon from '@/icons/close.svg';
import { selectSessionCount } from '@/redux/slices/session';
import { makeDonateUrl } from '@/utils/apiPaths';
import { logEvent } from '@/utils/eventLogger';

const POPUP_VISIBILITY_FREQUENCY_BY_SESSION_COUNT = 10;
const DonatePopup = () => {
  const { t } = useTranslation('common');
  const sessionCount = useSelector(selectSessionCount);

  const [isPopupVisible, setIsPopupVisible] = useState(
    () => sessionCount % POPUP_VISIBILITY_FREQUENCY_BY_SESSION_COUNT === 0 && sessionCount > 0,
  );

  const onCloseButtonClicked = () => {
    setIsPopupVisible(false);
  };

  const onDonateButtonClicked = () => {
    logEvent('donate_button_clicked', {
      source: 'donate_popover',
    });
    onCloseButtonClicked();
  };

  const onLearnMoreClicked = () => {
    logEvent('learn_more_button_clicked', {
      source: 'donate_popover',
    });
    onCloseButtonClicked();
  };

  if (!isPopupVisible) return null;

  return (
    <Modal isOpen contentClassName={styles.modalSize}>
      <div className={styles.outerContainer}>
        <div className={styles.illustrationContainer}>
          <MoonIllustrationSVG />
        </div>
        <div className={styles.container}>
          <Button
            size={ButtonSize.Large}
            className={styles.closeIcon}
            variant={ButtonVariant.Ghost}
            shape={ButtonShape.Circle}
            onClick={onCloseButtonClicked}
          >
            <CloseIcon />
          </Button>
          <h1 className={styles.title}>{t('popup.title')}</h1>
          <div className={styles.textsContainer}>
            <p className={styles.text}>{t('popup.text-1')}</p>
            <p className={styles.text}>{t('popup.text-2')}</p>
          </div>
          <div className={styles.actionsContainer}>
            <Button
              href={makeDonateUrl(true)}
              onClick={onDonateButtonClicked}
              isNewTab
              className={styles.action}
              type={ButtonType.Success}
            >
              {t('donate')}
            </Button>
            <Button
              href={makeDonateUrl()}
              onClick={onLearnMoreClicked}
              isNewTab
              className={styles.action}
              type={ButtonType.Success}
              variant={ButtonVariant.Outlined}
            >
              {t('fundraising.learn-more')}
            </Button>
          </div>
          <div className={styles.text}>{t('popup.footnote')}</div>
        </div>
      </div>
    </Modal>
  );
};

export default DonatePopup;
