import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionsList.module.scss';

import CheckMarkIcon from '@/icons/checkmark-icon.svg';
import { ROUTES } from '@/utils/navigation';

const CollectionsGuestPromo = () => {
  const { t } = useTranslation('my-quran');
  const router = useRouter();

  const handleSignInClick = () => {
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('collections.title')}</h3>
      </div>
      <div className={styles.guestPromo}>
        <div className={styles.guestPromoFeatures}>
          <div className={styles.guestPromoFeature}>
            <CheckMarkIcon className={styles.checkIcon} />
            <span>{t('collections.guest-promo.title')}</span>
          </div>
          <div className={styles.guestPromoFeature}>
            <CheckMarkIcon className={styles.checkIcon} />
            <span>{t('collections.guest-promo.subtitle')}</span>
          </div>
        </div>
        <div className={styles.guestPromoSeparator} />
        <button type="button" className={styles.guestSignInButton} onClick={handleSignInClick}>
          {t('collections.guest-promo.sign-in')}
        </button>
      </div>
    </div>
  );
};
export default CollectionsGuestPromo;
