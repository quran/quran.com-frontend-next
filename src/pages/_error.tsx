/* eslint-disable jsx-a11y/anchor-is-valid */
import * as Sentry from '@sentry/nextjs';
import classNames from 'classnames';
import type { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './_error.module.scss';

import Button from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';

// reference: https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing
type ErrorProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  statusCode?: number;
  hasFullWidth?: boolean;
};

const Error = ({ statusCode, hasFullWidth = true }: ErrorProps) => {
  const { t } = useTranslation('error');
  const router = useRouter();
  const isNotFound = statusCode === 404;

  // If a previous page exists, go back; otherwise, go to home.
  const onBackButtonClicked = () => {
    if (typeof document !== 'undefined' && document.referrer) {
      router.back();
      return;
    }
    router.push('/');
  };

  return (
    <div
      className={classNames(styles.container, {
        [styles.withFullWidth]: hasFullWidth,
      })}
    >
      <h1 className={styles.title}>{isNotFound ? t('not-found-title') : t('title')}</h1>
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

// Capture errors with Sentry, then fall back to Next.js’ default error handling
Error.getInitialProps = async (contextData: NextPageContext) => {
  await Sentry.captureUnderscoreErrorException(contextData);
  return NextErrorComponent.getInitialProps(contextData);
};

export default Error;
