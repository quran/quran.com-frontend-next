import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '../dls/Button/Button';
import Modal from '../dls/Modal/Modal';

import styles from './DonatePopup.module.scss';

import { selectSessionCount } from 'src/redux/slices/session';
import openGivingLoopPopup from 'src/utils/givingloop';

const POPUP_VISIBILITY_FREQUENCY_BY_SESSION_COUNT = 10;
const DonatePopup = () => {
  const { t } = useTranslation('common');
  const sessionCount = useSelector(selectSessionCount);
  const [isDonateButtonLoading, setIsDonateButtonLoading] = useState(false);

  const [isPopupVisible, setIsPopupVisible] = useState(
    () => sessionCount % POPUP_VISIBILITY_FREQUENCY_BY_SESSION_COUNT === 0 && sessionCount > 0,
  );

  const onDonateButtonClicked = (monthly: boolean, amount?: number) => {
    openGivingLoopPopup(monthly, amount);
    setIsDonateButtonLoading(true);
    setTimeout(() => {
      setIsDonateButtonLoading(false);

      // Unfortunately, we need to close this popup. Otherwise the giving loop popup won't be clickable
      setIsPopupVisible(false);
    }, 5000);
  };

  if (!isPopupVisible) return null;

  const onCloseButtonClicked = () => {
    setIsPopupVisible(false);
  };

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
            <FiX />
          </Button>
          <h1 className={styles.title}>{t('popup.title')}</h1>
          <div className={styles.textsContainer}>
            <p className={styles.text}>{t('popup.text-1')}</p>
            <p className={styles.text}>{t('popup.text-2')}</p>
          </div>
          <div className={styles.actionsContainer}>
            <Button
              className={styles.action}
              type={ButtonType.Success}
              onClick={() => onDonateButtonClicked(true)}
              isLoading={isDonateButtonLoading}
            >
              {t('popup.cta-1')}
            </Button>

            <Button
              className={styles.action}
              type={ButtonType.Success}
              onClick={() => onDonateButtonClicked(false, 100)}
              isLoading={isDonateButtonLoading}
              variant={ButtonVariant.Outlined}
            >
              {t('popup.cta-2')}
            </Button>

            <Button
              href="https://donate.quran.com"
              isNewTab
              className={styles.action}
              type={ButtonType.Success}
              variant={ButtonVariant.Outlined}
            >
              {t('popup.cta-3')}
            </Button>
          </div>
          <div className={styles.text}>{t('popup.footnote')}</div>
        </div>
      </div>
    </Modal>
  );
};

export default DonatePopup;
