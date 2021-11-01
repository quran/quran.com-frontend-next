/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Trans from 'next-translate/Trans';
import Image from 'next/image';

import styles from './contentPage.module.scss';

import { getBlurDataUrl } from 'src/utils/image';

const AboutUsPage = () => (
  <div className={styles.contentPage}>
    <h1>
      <Trans i18nKey="common:quran-com" />
    </h1>
    <p>
      <Trans i18nKey="about:main-desc" />
    </p>
    <h1>
      <Trans i18nKey="about:meccan.surahs" />
    </h1>
    <p>
      <Trans i18nKey="about:meccan.desc" />
    </p>
    <h1>
      <Trans i18nKey="about:median.surahs" />
    </h1>
    <p>
      <Trans i18nKey="about:median.desc" />
    </p>
    <p>
      <Trans
        i18nKey="about:redesign"
        components={[<a target="_blank" href="https://feedback.quran.com" rel="noreferrer" />]}
      />
    </p>
    <h1>
      <Trans i18nKey="about:credits.title" />
    </h1>
    <p>
      <Trans
        i18nKey="about:credits.desc"
        components={[
          <a target="_blank" href="https://tanzil.net/" rel="noreferrer" />,
          <a target="_blank" href="https://qurancomplex.gov.sa/" rel="noreferrer" />,
          <a target="_blank" href="https://github.com/cpfair/quran-align" rel="noreferrer" />,
          <a target="_blank" href="https://quranenc.com/en/home" rel="noreferrer" />,
          <a target="_blank" href="https://zekr.org" rel="noreferrer" />,
        ]}
      />
    </p>
    <div>
      <Trans
        i18nKey="about:credits.lokalize"
        components={[<a target="_blank" href="https://lokalise.com/" rel="noreferrer" />]}
      />
      <div className={styles.lokalizeImage}>
        <Image
          src="/images/lokalize.png"
          layout="fixed"
          width={300}
          height={70}
          placeholder="blur"
          blurDataURL={getBlurDataUrl(300, 70)}
        />
      </div>
    </div>
    <p>
      <Trans
        i18nKey="about:questions"
        components={[<a target="_blank" href="https://feedback.quran.com" rel="noreferrer" />]}
      />
    </p>
  </div>
);

export default AboutUsPage;
