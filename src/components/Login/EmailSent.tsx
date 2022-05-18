import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';

type EmailSentProps = {
  verificationCode: string;
  email: string;
};

const EmailSent = ({ verificationCode, email }: EmailSentProps) => {
  const { t } = useTranslation('login');
  return (
    <div className={styles.emailSentContainer}>
      <div className={styles.title}>{t('awaiting-confirmation')}</div>
      <div className={styles.paragraphContainer}>
        <p>
          <Trans
            i18nKey="login:email-sent"
            values={{ email, verificationCode }}
            components={{
              strong: <strong className={styles.emailContainer} />,
            }}
          />
        </p>
        <p>{t('verify-code')}</p>
      </div>
      <p className={styles.verificationCode}>{verificationCode}</p>
    </div>
  );
};

export default EmailSent;
