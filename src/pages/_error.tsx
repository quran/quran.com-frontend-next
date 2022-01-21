/* eslint-disable jsx-a11y/anchor-is-valid */
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import styles from './_error.module.scss';

import Button from 'src/components/dls/Button/Button';
import Link, { LinkVariant } from 'src/components/dls/Link/Link';

// reference: https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing
type ErrorProps = {
  statusCode?: number;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Error = ({ statusCode }: ErrorProps) => {
  const { t } = useTranslation('error');
  const router = useRouter();

  // if previous page url exist, go back, otherwise go to home
  const onBackButtonClicked = () => {
    if (document && document.referrer) {
      router.back();
      return;
    }
    router.push('/'); // go to home
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('title')}</h1>
      <div className={styles.goBack}>
        <Button onClick={onBackButtonClicked}>{t('go-back')}</Button>
      </div>
      <p className={styles.reportBug}>
        {t('if-persist')}{' '}
        <Link href="https://feedback.quran.com/" variant={LinkVariant.Highlight}>
          {t('report-cta')}
        </Link>
      </p>
    </div>
  );
};

export default Error;
