import { FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import BackButton from './BackButton';
import BenefitsSection from './BenefitsSection';
import styles from './login.module.scss';
import PrivacyPolicyText from './PrivacyPolicyText';
import SocialButtons from './SocialButtons';

import { SubmissionResult } from '@/components/FormBuilder/FormBuilder';
import EmailLogin, { EmailLoginData } from '@/components/Login/EmailLogin';
import QuranLogo from '@/icons/logo_main.svg';
import QRColoredLogo from '@/icons/qr-colored.svg';
import QRLogo from '@/icons/qr-logo.svg';

interface Benefit {
  id: string;
  label: string;
}

interface Props {
  benefits: {
    quran: Benefit[];
    reflect: Benefit[];
  };
  isEmailLogin?: boolean;
  onEmailLoginSubmit?: (data: { email: string }) => SubmissionResult<EmailLoginData>;
  onOtherOptionsClicked?: () => void;
  onBackClick?: () => void;
  redirect?: string;
}

const ServiceCard: FC<Props> = ({
  benefits,
  isEmailLogin,
  onEmailLoginSubmit,
  onOtherOptionsClicked,
  onBackClick,
  redirect,
}) => {
  const { t } = useTranslation('login');

  const renderEmailLogin = () => (
    <EmailLogin back={onOtherOptionsClicked} onSubmit={onEmailLoginSubmit} />
  );

  const renderWelcomeContent = () => (
    <>
      <h1 className={styles.title}>{t('welcome-title')}</h1>
      <p className={styles.subtitle}>
        {t('welcome-description-1')} <span className={styles.boldText}>{t('quran-text')}</span>
        {t('welcome-description-2')}
        <br />
        {t('welcome-description-3')}
      </p>
      <div className={styles.servicesContainer}>
        <QuranLogo height={26} />
        <BenefitsSection benefits={benefits.quran} />
        <hr className={styles.serviceDivider} />
        <div className={styles.reflectLogos}>
          <QRColoredLogo className={styles.reflectLogo} />
          <QRLogo className={styles.reflectLogo} />
        </div>
        <BenefitsSection benefits={benefits.reflect} />
      </div>
      <p className={styles.loginCta}>{t('login-cta')}</p>
      <SocialButtons redirect={redirect} />

      {onBackClick && <BackButton onClick={onBackClick} />}

      <PrivacyPolicyText />
    </>
  );

  return (
    <div className={styles.serviceCard}>
      {isEmailLogin ? renderEmailLogin() : renderWelcomeContent()}
    </div>
  );
};

export default ServiceCard;
