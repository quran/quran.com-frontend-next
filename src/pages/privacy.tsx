/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Trans from 'next-translate/Trans';

import styles from './contentPage.module.scss';

const PrivacyPage = () => (
  <div className={styles.contentPage}>
    <h1>
      <Trans i18nKey="privacy:header" />
    </h1>
    <p>
      <Trans i18nKey="privacy:main-desc" components={[<a href="salah.com" target="_blank" />]} />
    </p>
    <p>
      <Trans
        i18nKey="privacy:ga"
        components={[
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="nofollow noreferrer noopener"
          />,
        ]}
      />
    </p>
    <p>
      <Trans i18nKey="privacy:footer" />
    </p>
  </div>
);

export default PrivacyPage;
