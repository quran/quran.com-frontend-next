import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SaveBookmarkModal.module.scss';

import CheckMarkIcon from '@/icons/checkmark-icon.svg';

interface GuestSignInSectionProps {
  onSignIn: () => void;
}

/**
 * Guest sign-in prompt section
 * Encourages guest users to sign in to access collections
 * @returns {React.FC<GuestSignInSectionProps>} The GuestSignInSection component
 */
const GuestSignInSection: React.FC<GuestSignInSectionProps> = ({ onSignIn }) => {
  const commonT = useTranslation('common').t;
  const { t } = useTranslation('quran-reader');

  const handleSignInClick = useCallback((): void => {
    onSignIn();
  }, [onSignIn]);

  return (
    <div className={styles.guestSignInSection}>
      <h3 className={styles.guestSectionTitle}>{commonT('collections')}</h3>

      <div className={styles.guestMessageBox}>
        <p className={styles.guestSignInMessage}>{t('guest-prompt.sign-in-message')}</p>

        <div className={styles.guestFeaturesList}>
          <GuestFeatureItem text={t('guest-prompt.create-collections')} />
          <GuestFeatureItem text={t('guest-prompt.attach-notes')} />
        </div>

        <button type="button" className={styles.guestSignInButton} onClick={handleSignInClick}>
          {t('guest-prompt.sign-in')}
        </button>
      </div>
    </div>
  );
};

interface GuestFeatureItemProps {
  text: string;
}

/**
 * Individual feature item for guest sign-in section
 * @returns {React.FC<GuestFeatureItemProps>} The GuestFeatureItem component
 */
// eslint-disable-next-line react/no-multi-comp
const GuestFeatureItem: React.FC<GuestFeatureItemProps> = ({ text }) => (
  <div className={styles.guestFeatureItem}>
    <CheckMarkIcon className={styles.guestCheckmark} />
    <span className={styles.guestFeatureText}>{text}</span>
  </div>
);

export default GuestSignInSection;
