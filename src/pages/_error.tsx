import styles from './_error.module.scss';

import Button, { ButtonType } from 'src/components/dls/Button/Button';

// reference: https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing
const Error = ({ statusCode }) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on your browser'}
      </h1>
      <div className={styles.actions}>
        <div className={styles.actionItem}>
          <Button href="https://feedback.quran.com">Report the bug</Button>
        </div>
        <div className={styles.actionItem}>
          <Button href="https://discord.gg/ZHcFfEHs" type={ButtonType.Secondary}>
            Join Discord Server
          </Button>
        </div>
      </div>
    </div>
  );
};

const DEFAULT_STATUS_CODE = 404;
Error.getInitialProps = ({ res, err }) => {
  let statusCode;
  if (res) {
    const responseStatusCode = res.statusCode;
    statusCode = responseStatusCode;
  } else if (err) {
    const errorStatusCode = err.statusCode;
    statusCode = errorStatusCode;
  } else {
    statusCode = DEFAULT_STATUS_CODE;
  }

  return { statusCode };
};

export default Error;
