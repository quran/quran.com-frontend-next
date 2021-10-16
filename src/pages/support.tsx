import styles from './contentPage.module.scss';

const SupportPage = () => (
  <div className={styles.contentPage}>
    <h1>Help and Feedback</h1>
    <p>
      Please check the FAQ to see if your question has been already answered. If needed you can
      <a data-controller="ajax-modal" data-url="/popups/feedback">
        contact us
      </a>{' '}
      &amp; we&apos;ll do our best to get back to you as soon as possible, but just so you know
      we&apos;re a small team so please be nice.
    </p>

    <h2>Can I download the Quran.com to my computer?</h2>
    <p>
      Unfortunately, no. We do not provide functionality to download our website or the Quran to
      your computer yet. You can, however install our mobile app for offline reading.
    </p>

    <h2>Can I browse site in other languages?</h2>
    <p>
      To change your preferred language, there is a drop down on the top right corner on each page(
      to right corner in the left side menu on mobile). Use this dropdown to choose your preferred
      language.
    </p>

    <h2>I found a translation bug, where do I file it?</h2>

    <p>
      Please report this bug{' '}
      <a target="_blank" href="https://feedback.quran.com/" rel="noreferrer">
        here
      </a>{' '}
      and we&apos;ll fix this bug ASAP inshAllah.
    </p>

    <h2>The site is not working, how do I tell you?</h2>
    <p>
      That&apos;s not good! If the site is not working at all or perhaps you see a white screen with
      &apos;502&apos;, we appreciate it if you can email us immediately to let us know. You can
      email us at fire@quran.zendesk.com or report this issue{' '}
      <a target="_blank" href="https://feedback.quran.com/" rel="noreferrer">
        here
      </a>
      .
    </p>

    <h2>I&apos;m a developer. How can I contribute?</h2>
    <p>
      Please see <a href="/developers">developers page</a> for more info.
    </p>

    <h2>Islamic/ Fiqh / Fatwa related questions</h2>

    <p>
      Quran.com is an online reading, listening and studying tool. The team behind Quran.com is made
      up of software engineers, designers, and product managers. Unfortunately, that is the
      limitation of our skill set we do not have scholars, imams or sheikhs as part of the team to
      assist with Islamic, Fiqh or Fatwa related questions. We try to refrain from answering any of
      those questions and advise you speak to your local imam at a mosque or to a sheikh.
    </p>

    <h2>Is Tafsir available?</h2>

    <p>
      Yes, we do have some Tafsirs. Click on <span className="quran-icon icon-menu" /> icon shown
      beside each ayah, then click on tafisrs. App will show you list of available tafsirs. Click on
      the tafsir you want to read.
    </p>

    <h2>Add another translations</h2>

    <p>
      Open a new issue{' '}
      <a href="https://feedback.quran.com/" target="_blank" rel="noreferrer">
        here
      </a>{' '}
      with all the detail, link to translation and we&apos;ll try our best to add this.
    </p>

    <h2>Adding more reciters</h2>
    <p>
      Submit more info about this reciter{' '}
      <a target="_blank" href="https://feedback.quran.com/" rel="noreferrer">
        here
      </a>
    </p>

    <h2>Does Quran.com have mobile app?</h2>
    <p>
      Yes! You can download our Application on{' '}
      <a href="https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&utm_source=quran-com&utm_campaign=download">
        Play Store
      </a>{' '}
      or <a href="https://apps.apple.com/us/app/quran-by-quran-com-qran/id1118663303">App Store</a>
    </p>

    {/* <h2>How can I donate?</h2>
    <p>
      Firstly, we really appreciate your interest to contribute. Please visit this{' '}
      <a href="/donations">this link</a>.
    </p> */}
  </div>
);

export default SupportPage;
