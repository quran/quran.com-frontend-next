/* eslint-disable jsx-a11y/anchor-is-valid */
import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './_error.module.scss';

import Button from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';

// reference: https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing
type ErrorProps = {
  statusCode?: number;
  hasFullWidth?: boolean;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Error = ({ statusCode, hasFullWidth = true }: ErrorProps) => {
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
    <div
      className={classNames(styles.container, {
        [styles.withFullWidth]: hasFullWidth,
      })}
    >
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
