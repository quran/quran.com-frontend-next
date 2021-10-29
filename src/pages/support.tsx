/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Trans from 'next-translate/Trans';

import styles from './contentPage.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';

const SupportPage = () => (
  <div className={styles.contentPage}>
    <h1>
      <Trans i18nKey="support:header" />
    </h1>
    <p>
      <Trans
        i18nKey="support:main-desc"
        components={[<a target="_blank" href="https://feedback.quran.com/" rel="noreferrer" />]}
      />
    </p>
    <h2>
      <Trans i18nKey="support:download-q" />
    </h2>
    <p>
      <Trans i18nKey="support:download-a" />
    </p>
    <h2>
      <Trans i18nKey="support:other-languages-q" />
    </h2>
    <p>
      <Trans i18nKey="support:other-languages-a" />
    </p>
    <h2>
      <Trans i18nKey="support:bug-q" />
    </h2>
    <p>
      <Trans
        i18nKey="support:bug-a"
        components={[<a target="_blank" href="https://feedback.quran.com/" rel="noreferrer" />]}
      />
    </p>
    <h2>
      <Trans i18nKey="support:site-down-q" />
    </h2>
    <p>
      <Trans
        i18nKey="support:site-down-a"
        components={[<a target="_blank" href="https://feedback.quran.com/" rel="noreferrer" />]}
      />
    </p>
    <h2>
      <Trans i18nKey="support:developer-q" />
    </h2>
    <p>
      <Trans
        i18nKey="support:developer-a"
        components={[<Link href="/developers" variant={LinkVariant.Blend} />]}
      />
    </p>
    <h2>
      <Trans i18nKey="support:fiqh-q" />
    </h2>
    <p>
      <Trans i18nKey="support:fiqh-a" />
    </p>
    <h2>
      <Trans i18nKey="support:tafsir-q" />
    </h2>
    <p>
      <Trans i18nKey="support:tafsir-a" />
    </p>

    <h2>
      <Trans i18nKey="support:translations-q" />
    </h2>
    <p>
      <Trans
        i18nKey="support:translations-a"
        components={[<a href="https://feedback.quran.com/" target="_blank" rel="noreferrer" />]}
      />
    </p>
    <h2>
      <Trans i18nKey="support:reciters-q" />
    </h2>
    <p>
      <Trans
        i18nKey="support:reciters-a"
        components={[<a target="_blank" href="https://feedback.quran.com/" rel="noreferrer" />]}
      />
    </p>
    <h2>
      <Trans i18nKey="support:mobile-q" />
    </h2>
    <p>
      <Trans
        i18nKey="support:mobile-a"
        components={[
          <a
            target="_blank"
            href="https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&utm_source=quran-com&utm_campaign=download"
            rel="noreferrer"
          />,
          <a
            target="_blank"
            href="https://apps.apple.com/us/app/quran-by-quran-com-qran/id1118663303"
            rel="noreferrer"
          />,
        ]}
      />
    </p>
    {/* <h2>
      <Trans i18nKey="support:donate-q" />
    </h2>
    <p>
      <Trans
        i18nKey="support:donate-a"
        components={[<Link href="/donations" variant={LinkVariant.Blend} />]}
      />
    </p> */}
  </div>
);

export default SupportPage;
