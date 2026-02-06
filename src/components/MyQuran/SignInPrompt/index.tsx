import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './SignInPrompt.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import CheckmarkIcon from '@/icons/checkmark-icon.svg';
import { getLoginNavigationUrl, getMyQuranNavigationUrl } from '@/utils/navigation';

interface SignInPromptProps {
  title?: string;
  features: string[];
  redirectUrl?: string;
}

const SignInPrompt: React.FC<SignInPromptProps> = ({ title, features, redirectUrl }) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const handleSignInClick = () => {
    const redirect = redirectUrl ?? getMyQuranNavigationUrl();
    router.push(getLoginNavigationUrl(redirect));
  };

  return (
    <div className={styles.container}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <ul className={styles.featuresList}>
        {features.map((feature) => (
          <li key={`feature-${feature}`} className={styles.featureItem}>
            <IconContainer
              className={styles.checkIcon}
              icon={<CheckmarkIcon />}
              shouldForceSetColors={false}
              size={IconSize.Custom}
            />

            <span className={styles.featureText}>{feature}</span>
          </li>
        ))}
      </ul>
      <div className={styles.separator} />
      <Button
        variant={ButtonVariant.Accent}
        size={ButtonSize.Small}
        onClick={handleSignInClick}
        className={styles.signInButton}
      >
        {t('sign-in')}
      </Button>
    </div>
  );
};

export default SignInPrompt;
