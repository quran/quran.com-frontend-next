import { FC } from 'react';

import Feature from './Feature';
import styles from './login.module.scss';

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
  isQuranReflect?: boolean;
  benefits: Benefit[];
  isEmailLogin?: boolean;
  onEmailLoginSubmit?: (data: { email: string }) => SubmissionResult<EmailLoginData>;
  onOtherOptionsClicked?: () => void;
}

const ServiceCard: FC<Props> = ({
  isQuranReflect,
  benefits,
  isEmailLogin,
  onEmailLoginSubmit,
  onOtherOptionsClicked,
}) => {
  return (
    <div className={styles.serviceCard}>
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
      {isEmailLogin ? (
        <EmailLogin back={onOtherOptionsClicked} onSubmit={onEmailLoginSubmit} />
      ) : (
        <div className={styles.benefits}>
          {benefits.map(({ id, label }) => (
            <Feature key={id} label={label} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
