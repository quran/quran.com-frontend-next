import { FC } from 'react';

import Image from 'next/image';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import BackButton from './BackButton';
import BenefitsSection from './BenefitsSection';
import styles from './login.module.scss';
import SocialButtons from './SocialButtons';

import { SubmissionResult } from '@/components/FormBuilder/FormBuilder';
import EmailLogin, { EmailLoginData } from '@/components/Login/EmailLogin';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { ROUTES } from '@/utils/navigation';

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
        <Image
          src="/icons/logo_main.svg"
          alt="Quran Logo"
          width={140}
          height={26}
          className={styles.logos}
        />
        <BenefitsSection benefits={benefits.quran} />
        <hr className={styles.serviceDivider} />
        <Image
          src="/icons/qr-registration-logo.svg"
          alt="QR Logo"
          width={174}
          height={30}
          className={styles.logos}
        />
        <BenefitsSection benefits={benefits.reflect} />
      </div>
      <p className={styles.loginCta}>{t('login-cta')}</p>
      <SocialButtons redirect={redirect} onEmailLoginClick={onOtherOptionsClicked} />

      {onBackClick && <BackButton onClick={onBackClick} />}

      <p className={styles.privacyText}>
        <Trans
          i18nKey="login:privacy-policy"
          components={{
            link: <Link href={ROUTES.PRIVACY} isNewTab variant={LinkVariant.Blend} />,
            link1: <Link href={ROUTES.TERMS} isNewTab variant={LinkVariant.Blend} />,
          }}
        />
      </p>
    </>
  );

  return (
    <div className={styles.serviceCard}>
      {isEmailLogin ? renderEmailLogin() : renderWelcomeContent()}
    </div>
  );
};

export default ServiceCard;
