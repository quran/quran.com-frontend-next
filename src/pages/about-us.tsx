import styles from './contentPage.module.scss';

const AboutUsPage = () => (
  <div className={styles.contentPage}>
    <h1>Quran.com</h1>
    <p>
      The Noble Quran is the central religious text of Islam. Muslims believe the Qur’an is the book
      of Divine guidance and direction for mankind, and consider the original Arabic text the final
      revelation of Allah (God). All translations of the original Arabic text are thus
      interpretations of the original meanings and should be embraced as such.
    </p>

    <h1>Meccan Surahs</h1>
    <p>
      The Meccan suras are the chronologically earlier chapters (suras) of the Quran that were,
      according to Islamic tradition, revealed anytime before the migration of the Islamic prophet
      Muhammed and his followers from Mecca to Medina (Hijra). The Medinan suras are those
      revelations that occurred after the move to the city of that name.
    </p>

    <h1>Medinan Surahs</h1>
    <p>
      The Medinan suras or Medinan chapters of the Quran are the latest 24 suras that, according to
      Islamic tradition, were revealed at Medina after Muhammad&apos;s hijra from Mecca. These suras
      were revealed by Allah when the Muslim community was larger and more developed, as opposed to
      their minority position in Mecca.
    </p>
    <p>
      We have redesigned the website with a user friendly approach in mind. To browse through the
      surahs, click on the button (shown left) in the READ &amp; LISTEN page and navigate surah by
      title or by page. In future iterations, we will be integrating more search and audio features
      inshaAllah. If you have any suggestions on how we can make the website a better experience
      please do not hesitate to
      <a data-controller="ajax-modal" data-url="/popups/feedback">
        contact us.
      </a>
    </p>

    <h1>Credits</h1>
    <p>
      This website was created by a few volunteers and was made possible with the will of Allah
      (Glory be unto Him) and with the help of the open source Muslim community online. Data sources
      include{' '}
      <a href="https://tanzil.net/" target="_blank" rel="noreferrer">
        Tanzil
      </a>{' '}
      ,
      <a href="https://qurancomplex.gov.sa/" target="_blank" rel="noreferrer">
        QuranComplex
      </a>{' '}
      ,
      <a href="https://github.com/cpfair/quran-align" target="_blank" rel="noreferrer">
        Colin Fair&apos;s
      </a>{' '}
      work on audio segments,
      <a href="https://quranenc.com/en/home" target="_blank" rel="noreferrer">
        QuranEnc
      </a>
      ,{' '}
      <a href="https://zekr.org" target="_blank" rel="noreferrer">
        Zekr
      </a>{' '}
      and Online Quran Project.
    </p>
    <p>
      If you have any questions, you may visit the{' '}
      <a href="https://quran.zendesk.com/hc/en-us/requests/new" target="_blank" rel="noreferrer">
        contact
      </a>{' '}
      page.
    </p>
  </div>
);

export default AboutUsPage;
