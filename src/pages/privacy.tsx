import styles from './contentPage.module.scss';

const PrivacyPage = () => (
  <div className={styles.contentPage}>
    <h1>Privacy policy</h1>
    <p>
      This project is run by a set of Muslims who do this work for the sake of Allah. We do not
      serve you ads, so we do not need to track you or use your personal data to provide you with
      better ads to increase our revenues. We don’t gather any information (there is no login, there
      is no request for location permissions (except optionally on{' '}
      <a href="salah.com" target="_blank">
        salah.com
      </a>{' '}
      for the purposes of computing more accurate Salah timings), and so on).
    </p>

    <p>
      If you open a support ticket, that account information goes to Zendesk, the support provider
      we use. We do not have any access to this account information and any support ticket accounts
      or requests are subject to their{' '}
      <a
        href="https://www.zendesk.com/company/customers-partners/privacy-policy/"
        target="_blank"
        rel="nofollow noreferrer noopener"
      >
        privacy policy
      </a>
      .
    </p>

    <p>
      We do use{' '}
      <a
        href="https://policies.google.com/technologies/partner-sites"
        target="_blank"
        rel="nofollow noreferrer noopener"
      >
        Google Analytics
      </a>{' '}
      for ensuring that the site continues to work as expected and for knowing which features to
      prioritize work on. This information is anonymous and we can’t trace it back to any particular
      individual.
    </p>

    <p>
      Our code is open source, so the community can easily ensure that this stance on privacy is
      actually the case on the code level and not just a stated goal.
    </p>
  </div>
);

export default PrivacyPage;
