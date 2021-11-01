/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Trans from 'next-translate/Trans';

import styles from './contentPage.module.scss';

const DevelopersPage = () => (
  <div className={styles.contentPage}>
    <h1>
      <Trans i18nKey="developers:header" />
    </h1>
    <p>
      <Trans i18nKey="developers:main-desc" />
    </p>
    <p>
      <Trans i18nKey="developers:sub-main-desc" />
    </p>
    <p>
      <Trans
        i18nKey="developers:projects.all"
        components={[<a href="http://github.com/quran" target="_blank" rel="noreferrer" />]}
      />
    </p>
    <div>
      <p>
        <Trans
          i18nKey="developers:projects.q-v2"
          components={[
            <a
              href="https://github.com/quran/quran.com-frontend-v2"
              target="_blank"
              rel="noreferrer"
            />,
          ]}
        />
      </p>
      <p>
        <Trans
          i18nKey="developers:projects.q-api"
          components={[
            <a href="https://github.com/quran/quran.com-api" target="_blank" rel="noreferrer" />,
          ]}
        />
      </p>
      <p>
        <Trans
          i18nKey="developers:projects.q-android"
          components={[
            <a href="https://github.com/quran/quran_android" target="_blank" rel="noreferrer" />,
          ]}
        />
      </p>
      <p>
        <Trans
          i18nKey="developers:projects.q-ios"
          components={[
            <a href="https://github.com/quran/quran-ios" target="_blank" rel="noreferrer" />,
          ]}
        />
      </p>
      <p>
        <Trans
          i18nKey="developers:projects.q-audio"
          components={[
            <a href="https://github.com/quran/audio.quran.com" target="_blank" rel="noreferrer" />,
            <a href="https://github.com/quran/quranicaudio-app" target="_blank" rel="noreferrer" />,
          ]}
        />
      </p>
    </div>
    <p>
      <Trans
        i18nKey="developers:projects.q-audio-segments"
        components={[
          <a href="https://github.com/cpfair/quran-align" target="_blank" rel="noreferrer" />,
        ]}
      />
    </p>
    <p>
      <Trans
        i18nKey="developers:issues-guide"
        components={[
          <a
            href="https://github.com/quran/quran.com-frontend-v2/issues"
            target="_blank"
            rel="noreferrer"
          />,
        ]}
      />
    </p>
    <p>
      <Trans i18nKey="developers:issues-cta" />
    </p>
    <p>
      <Trans i18nKey="developers:thanks" />
    </p>
    <p>
      <Trans i18nKey="developers:footer" />
    </p>
  </div>
);

export default DevelopersPage;
