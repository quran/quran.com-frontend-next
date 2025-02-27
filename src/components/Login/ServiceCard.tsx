import { FC } from 'react';

import classNames from 'classnames';
import Link from 'next/link';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import Feature from './Feature';
import styles from './login.module.scss';
import SocialButtons from './SocialButtons';

import { SubmissionResult } from '@/components/FormBuilder/FormBuilder';
import EmailLogin, { EmailLoginData } from '@/components/Login/EmailLogin';
import QuranLogo from '@/icons/logo_main.svg';
import QRColoredLogo from '@/icons/qr-colored.svg';
import QRLogo from '@/icons/qr-logo.svg';
import ArrowLeft from '@/icons/west.svg';

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

  const renderServiceSection = (isQuranReflect: boolean) => (
    <div className={styles.serviceSection}>
      <div className={styles.serviceLogo}>
        {isQuranReflect ? (
          <div className={styles.reflectLogos}>
            <QRColoredLogo className={styles.reflectLogo} />
            <QRLogo className={styles.reflectLogo} />
          </div>
        ) : (
          <QuranLogo />
        )}
      </div>
      <div className={classNames(styles.benefits, { [styles.quranBenefits]: !isQuranReflect })}>
        {(isQuranReflect ? benefits.reflect : benefits.quran).map(({ id, label }) => (
          <Feature key={id} label={label} />
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.serviceCard}>
      {!isEmailLogin && (
        <>
          <h1 className={styles.title}>{t('welcome-title')}</h1>
          <p className={styles.subtitle}>
            {t('welcome-description-1')} <span className={styles.boldText}>{t('quran-text')}</span>
            {t('welcome-description-2')}
            <br />
            {t('welcome-description-3')}
          </p>
        </>
      )}
      {isEmailLogin ? (
        <EmailLogin back={onOtherOptionsClicked} onSubmit={onEmailLoginSubmit} />
      ) : (
        <>
          <div className={styles.servicesContainer}>
            {renderServiceSection(false)}
            <hr className={styles.serviceDivider} />
            {renderServiceSection(true)}
          </div>
          <p className={styles.loginCta}>{t('login-cta')}</p>
          <SocialButtons redirect={redirect} onEmailLoginClick={onOtherOptionsClicked} />
          <p className={styles.privacyText}>
            <Trans
              i18nKey="login:privacy-policy"
              components={{
                link: <Link href="/privacy" />,
                link1: <Link href="/terms-and-conditions" />,
              }}
            />
          </p>
          {onBackClick && (
            <button type="button" onClick={onBackClick} className={styles.backButton}>
              <ArrowLeft /> {t('back')}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ServiceCard;
