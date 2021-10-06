import styles from './_error.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';

// reference: https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing
const Error = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sorry, something went wrong</h1>
      <p>
        If the issue persists, please{' '}
        <Link href="https://feedback.quran.com/" variant={LinkVariant.Highlight}>
          report a bug
        </Link>
      </p>
    </div>
  );
};

export default Error;
