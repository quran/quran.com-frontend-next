import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';

type EmailSentProps = {
  verificationCode: string;
  email: string;
};

const EmailSent = ({ verificationCode, email }: EmailSentProps) => {
  const { t } = useTranslation();
  return (
    <div className={styles.emailSentContainer}>
      <div className={styles.title}>{t('login:awaiting-confirmation')}</div>
      <div className={styles.paragraphContainer}>
        <p>
          <Trans
            i18nKey="common:email-verification.email-sent"
            values={{ email }}
            components={{
              strong: <strong className={styles.emailContainer} />,
            }}
          />
        </p>
        <p>{t('login:verify-code')}</p>
      </div>
      <p className={styles.verificationCode}>{verificationCode}</p>
    </div>
  );
};

export default EmailSent;
