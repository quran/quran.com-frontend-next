import styles from './contentPage.module.scss';

const DevelopersPage = () => (
  <div className={styles.contentPage}>
    <h1>Development help</h1>
    <p>
      Asalamu Alykom, Firstly, thank you very much for your interest to help us develop Quran.com
      and its projects. We are excited to work with you!
    </p>

    <p>
      We are a team of developers, designers, product managers and thinkers working on Quran.com on
      a volunteer basis. Alhamdulilah we have been blessed to work for some great companies in
      Silicon Valley, Toronto and UAE - and we feel that this is the least we can do to help our
      Ummah move forward in learning and studying their religion. Working on Quran.com is very
      gratifying and may Allah reward us all (and reward you) for our efforts.
    </p>

    <p>
      We have a number of projects all hosted on Github. You can find them all
      <a href="http://github.com/quran" target="_blank" rel="noreferrer">
        here
      </a>
      . But to outline them:
    </p>

    <div className="developers-link">
      <p>
        <a href="https://github.com/quran/quran.com-frontend-v2" target="_blank" rel="noreferrer">
          Quran.com
        </a>
        - written in Ruby on Rails.
      </p>

      <p>
        <a href="https://github.com/quran/quran.com-frontend-v2" target="_blank" rel="noreferrer">
          Quran.com API
        </a>
        - written in Ruby on Rails.
      </p>

      <p>
        <a href="https://github.com/quran/quran_android" target="_blank" rel="noreferrer">
          Quran Android
        </a>
      </p>
      <p>
        <a href="https://github.com/quran/quran-ios" target="_blank" rel="noreferrer">
          Quran iOS
        </a>
      </p>
      <p>
        <a href="https://github.com/quran/audio.quran.com" target="_blank" rel="noreferrer">
          Quranic Audio
        </a>{' '}
        and
        <a href="https://github.com/quran/quranicaudio-app" target="_blank" rel="noreferrer">
          Quranic Audio mobile apps
        </a>
      </p>
    </div>

    <p>
      <a href="https://github.com/cpfair/quran-align" target="_blank" rel="noreferrer">
        Quran Audio Segments
      </a>
    </p>

    <p>
      Typically we use Github issues as the source for what to work on next, what&apos;s coming up
      and what bugs exist that need to be solved. For example
      <a
        href="https://github.com/quran/quran.com-frontend-v2/issues"
        target="_blank"
        rel="noreferrer"
      >
        this url
      </a>
      has list of bugs, things we need help with, and upcoming features.
    </p>

    <p>
      Should you have any questions or want to contact maintainers, just write an issue! We will get
      back to you as soon as we can, inshAllah.
    </p>
    <p>Thanks for reading! Looking forward to seeing you commit some code!</p>
    <p>- Quran.com team</p>
  </div>
);

export default DevelopersPage;
