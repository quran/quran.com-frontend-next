import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './DonatePopup.module.scss';

import DonateButton from '@/components/Fundraising/DonateButton';
import LearnMoreButton from '@/components/Fundraising/DonateButton/LearnMoreButton';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Modal from '@/dls/ContentModal/ContentModal';
import CloseIcon from '@/icons/close.svg';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { selectIsDonationPopupVisible, setIsDonationPopupVisible } from '@/redux/slices/session';
import DonateButtonClickSource from '@/types/DonateButtonClickSource';
import DonateButtonType from '@/types/DonateButtonType';
import LearnMoreClickSource from '@/types/LearnMoreClickSource';
import { logButtonClick } from '@/utils/eventLogger';

const DonatePopup = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const isPopupVisible = useSelector(selectIsDonationPopupVisible);

  const onCloseButtonClicked = () => {
    logButtonClick('donate_popup_close');
    dispatch({ type: setIsDonationPopupVisible.type, payload: false });
  };

  if (!isPopupVisible) return null;

  return (
    <Modal hasHeader={false} isOpen contentClassName={styles.modalSize}>
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
            <DonateButton
              type={DonateButtonType.MONTHLY}
              source={DonateButtonClickSource.DONATE_POPOVER}
              shouldUseProviderUrl
            />
            <DonateButton
              type={DonateButtonType.ONCE}
              isOutlined
              source={DonateButtonClickSource.DONATE_POPOVER}
              shouldUseProviderUrl
            />
            <LearnMoreButton source={LearnMoreClickSource.DONATE_POPOVER} />
          </div>
          <div className={styles.text}>{t('popup.footnote')}.</div>
        </div>
      </div>
    </Modal>
  );
};

export default DonatePopup;
