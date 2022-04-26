import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import CloseIcon from '../../../public/icons/close.svg';
import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '../dls/Button/Button';
import Modal from '../dls/Modal/Modal';

import styles from './OneTimePopup.module.scss';

import { selectIsPopupVisible, setIsPopupVisible } from 'src/redux/slices/popup';
import openGivingLoopPopup from 'src/utils/givingloop';

const OneTimePopup = () => {
  const { t } = useTranslation('common');
  const isPopupVisible = useSelector(selectIsPopupVisible);
  const [isDonateButtonLoading, setIsDonateButtonLoading] = useState(false);
  const dispatch = useDispatch();

  const onDonateButtonClicked = () => {
    openGivingLoopPopup();
    setIsDonateButtonLoading(true);
    setTimeout(() => {
      setIsDonateButtonLoading(false);

      // Unfortunately, we need to close this popup. Otherwise the giving loop popup won't be clickable
      dispatch(setIsPopupVisible(false));
    }, 5000);
  };

  if (!isPopupVisible) return null;

  const onCloseButtonClicked = () => {
    dispatch(setIsPopupVisible(false));
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
            <CloseIcon />
          </Button>
          <h1 className={styles.title}>{t('popup.title')}</h1>
          <div className={styles.textsContainer}>
            <p className={styles.text}>{t('popup.text-1')}</p>
            <p className={styles.text}>{t('popup.text-2')}</p>
          </div>
          <div className={styles.actionsContainer}>
            <Button
              gl-donate-button
              data-gl-monthly="true"
              data-gl-amount="100"
              className={styles.action}
              type={ButtonType.Success}
              onClick={onDonateButtonClicked}
              isLoading={isDonateButtonLoading}
            >
              {t('popup.cta-1')}
            </Button>

            <Button
              href="https://donate.quran.com"
              isNewTab
              className={styles.action}
              type={ButtonType.Success}
              variant={ButtonVariant.Outlined}
            >
              {t('popup.cta-2')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OneTimePopup;
