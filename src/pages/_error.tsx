/* eslint-disable jsx-a11y/anchor-is-valid */
import { useRouter } from 'next/router';

import styles from './_error.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';

// reference: https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing
const Error = () => {
  const router = useRouter();

  // if previous page url exist, go back, otherwise go to home
  const onGoBack = () => {
    if (document.referrer) {
      router.back();
      return;
    }
    router.push('/'); // go to home
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sorry, something went wrong</h1>
      <p>
        If the issue persists, please{' '}
        <Link href="https://feedback.quran.com/" variant={LinkVariant.Highlight}>
          report a bug
        </Link>
      </p>
      <div className={styles.goBack}>
        <Link variant={LinkVariant.Highlight} href="#">
          <span role="link" tabIndex={0} onKeyPress={onGoBack} onClick={onGoBack}>
            Go Back
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Error;
