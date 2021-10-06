/* eslint-disable jsx-a11y/anchor-is-valid */
import { useRouter } from 'next/router';

import styles from './_error.module.scss';

import Button from 'src/components/dls/Button/Button';
import Link, { LinkVariant } from 'src/components/dls/Link/Link';

// reference: https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing
const Error = () => {
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
      <h1 className={styles.title}>Sorry, something went wrong</h1>
      <div className={styles.goBack}>
        <Button onClick={onBackButtonClicked}>Go Back</Button>
      </div>
      <p className={styles.reportBug}>
        If the issue persists, please{' '}
        <Link href="https://feedback.quran.com/" variant={LinkVariant.Highlight}>
          report a bug
        </Link>
      </p>
    </div>
  );
};

export default Error;
