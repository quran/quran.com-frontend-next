/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import { NextPage } from 'next';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import InlineLink from '@/components/RamadanActivity/InlineLink';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import { getPreparingForRamadanOgImageUrl } from '@/lib/og';
import styles from '@/pages/contentPage.module.scss';
import pageStyles from '@/pages/ramadan2026/ramadan2026.module.scss';
import newFeatureImage from '@/public/images/new-features.png';
import { makeDonatePageUrl, makeDonateUrl } from '@/utils/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import {
  EXTERNAL_ROUTES,
  getCanonicalUrl,
  getCourseNavigationUrl,
  getReadingGoalNavigationUrl,
  getWhatIsRamadanNavigationUrl,
  ROUTES,
} from '@/utils/navigation';

const Ramadan2026Page: NextPage = (): JSX.Element => {
  const PATH = ROUTES.RAMADAN_2026_URL;
  const { lang } = useTranslation();

  const onButtonClicked = (event: string) => {
    logButtonClick(`ramadan2026_${event}`);
  };

  return (
    <>
      <NextSeoWrapper
        title="Prepare for a Transformative Ramadan 2026 1447AH"
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description="Prepare your heart for Ramadan with Quran-centered challenges, learning plans, goal-setting, and more. Join us today!"
        image={getPreparingForRamadanOgImageUrl({
          locale: lang,
        })}
      />
      <PageContainer>
        <div className={classNames(pageStyles.container, styles.contentPage)} dir="ltr">
          <div className={styles.subSection}>
            <h1>
              Prepare for a Transformative Ramadan{' '}
              <span className={pageStyles.h1Subtext}>2026/1447AH</span>
            </h1>
            <div>
              How you prepare for Ramadan and the intentions you carry into it, have a big impact on
              how much you benefit from this blessed month. Ramadan is unlike any other time: the
              month in which the Quran was revealed to awaken hearts and guide lives. Preparation
              begins before the month enters, so that when Ramadan departs, it leaves you renewed -
              carrying greater clarity, discipline, and closeness to Allah beyond its days.
            </div>
            <br />
            <div>
              <Link href="https://quran.com" isNewTab>
                Quran.com
              </Link>{' '}
              invites you to begin preparing for the month with us!
            </div>
            <div>Join the following activities:</div>
            <ul className={pageStyles.list}>
              <li>
                <InlineLink
                  text="Surah Al-Mulk: Meaningful Memorization Challenge"
                  href="#join-surah-mulk-challenge"
                  isNewTab={false}
                />
              </li>
              <li>
                <InlineLink
                  text="Goal Setting for Your Ramadan Journey"
                  href="#goal-setting"
                  isNewTab={false}
                />
              </li>
              <li>
                <InlineLink
                  text="Preparing Our Hearts for Ramadan"
                  href="#preparing-our-hearts"
                  isNewTab={false}
                />
              </li>
              <li>
                <InlineLink
                  text="Mindful Fasting: A Ramadan Learning Plan"
                  href="#mindful-fasting"
                  isNewTab={false}
                />
              </li>
              <li>
                <InlineLink
                  text="QuranReflect Ramadan Ready Challenge"
                  href="#quranreflect-ramadan-challenge"
                  isNewTab={false}
                />
              </li>
              <li>
                <InlineLink
                  text="Share the Month of the Quran! Visit 'What Is Ramadan?'"
                  href="#share-the-month-of-the-quran"
                  isNewTab={false}
                />
              </li>
              <li>
                <InlineLink
                  text="Explore Additional Beneficial Features"
                  href="#explore-additional-beneficial-features"
                  isNewTab={false}
                />
              </li>
            </ul>
            <hr />
          </div>
          <div className={styles.subSection} id="join-surah-mulk-challenge">
            <h1>Meaningful Memorization Challenge: Surah Al-Mulk</h1>
            <div>
              A guided Ramadan challenge focused on memorizing Surah Al-Mulk one ayah at a time,
              rooted in understanding and reflection, so participants finish Ramadan with a lasting,
              meaningful connection to the surah.
            </div>
            <div className={styles.ctaContainer}>
              <Button
                href={ROUTES.RAMADAN_CHALLENGE_URL}
                onClick={() => {
                  onButtonClicked('join_surah_mulk_challenge');
                }}
                variant={ButtonVariant.Shadow}
                className={styles.button}
              >
                Join the Surah Al-Mulk Challenge
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection} id="goal-setting">
            <h1>Goal-setting to stay on track</h1>
            <div>
              Set custom Quranic goals tailored to your Ramadan journey. Decide how much Quran you
              want to read over a specific time period and track your progress with ease. Stay
              motivated with streak tracking and make steady progress toward your goals!
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('goal_setting');
                }}
                variant={ButtonVariant.Shadow}
                className={styles.button}
                href={getReadingGoalNavigationUrl()}
                isNewTab
              >
                Set your goal
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection} id="preparing-our-hearts">
            <h1>Preparing Our Hearts for Ramadan</h1>
            <div>
              Enhance your spiritual and mental readiness with our Learning Plan, Preparing Our
              Hearts for Ramadan. Start today and make the most of the blessed days ahead. This
              revised program is based on last year's highly-rated course, enriched with additional
              insights and reflections to help you approach Ramadan with a rejuvenated focus.
            </div>
            <br />
            <div>What You'll Gain:</div>
            <ul className={pageStyles.list}>
              <li>Self-development tips.</li>
              <li>Quranic reflections to inspire mindfulness and intention-setting.</li>
              <li>Actionable tips to create a fulfilling Ramadan routine.</li>
            </ul>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('preparing_our_hearts');
                }}
                href={getCourseNavigationUrl('preparing-our-hearts-for-ramadan')}
                variant={ButtonVariant.Shadow}
                className={styles.button}
                isNewTab
              >
                Start this learning plan now (Free)
              </Button>
            </div>
            <h2>Reviews from readers who completed this Learning Plan:</h2>
            <div>
              ⭐⭐⭐⭐⭐ “Mashallah,this learning plan not just helpful but it is extremely a
              helpful source for me to prepare myself for upcoming ramadhan. All the 9 day topics
              teach me lots of thing and made me reflect on my state of imaan.I hope i will gain
              more knowledge in the month of ramadhan. Ameen insyaallah. Thank you Quran.com!!”
            </div>
            <div>
              ⭐⭐⭐⭐⭐ “The plan was very transformative. I pray Allah SW will bless me with the
              ability to implement most, if not all of the recommendations in order to adequately
              prepare for Ramadan, spiritually, intellectually, and morally grow during this period,
              and continue to improve in these areas even after Ramadan In Shaa Allah.”
            </div>
            <div>
              ⭐⭐⭐⭐⭐ “This made me to read Qur'an with meaning and reflect upon it. And the
              author talked about increasing iman, giving up the sins and also he talked about how
              to be in the month of ramadhan and how to prepare for it from the month of shaban.”
            </div>
            <div>⭐⭐⭐⭐⭐ “I LOVED this is was very insightful and i learnt a lot”</div>
            <div>
              ⭐⭐⭐⭐⭐ “SubhanAllah, I have learned many topics and truly built a greater
              understanding of the Quran and faith. Wallahi, there is an activity mentioned here and
              I will perform it.”
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('preparing_our_hearts');
                }}
                variant={ButtonVariant.Shadow}
                href={getCourseNavigationUrl('preparing-our-hearts-for-ramadan')}
                isNewTab
                className={styles.button}
              >
                Start this learning plan now!
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection} id="mindful-fasting">
            <h1>Mindful Fasting: A Ramadan Learning Plan</h1>
            <div>
              Discover the beauty of fasting beyond abstention with Mindful Fasting, a unique
              Learning Plan designed to help you:
            </div>
            <ul className={pageStyles.list}>
              <li>Reflect on the deeper purpose of fasting.</li>
              <li>Gain Quranic insights into patience, gratitude, and self-control.</li>
              <li>Deepen your connection with Allah through intentional practices.</li>
            </ul>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('mindful_fasting');
                }}
                variant={ButtonVariant.Shadow}
                href={getCourseNavigationUrl('mindful-fasting')}
                isNewTab
                className={styles.button}
              >
                Start this learning plan now (free)
              </Button>
            </div>
            <div>
              ⭐⭐⭐⭐⭐ “This lesson was amazing and helped me get a better understanding about
              what taqwa even means and how to implicate it in my daily life”
            </div>
            <div>
              ⭐⭐⭐⭐⭐ “Alhamdulillah, it was very insightful, thought provoking, transformative.
              May Allah grant us the power to apply the principles into our lives. Aameen.”
            </div>
            <div>
              ⭐⭐⭐⭐⭐ "This learning plan was absolutely amazing! I'm left speechless by the
              profound impact it had on me, especially during fasting times. As Muslims, we must
              constantly remind ourselves to be mindful of Allah, and during Ramadan, we need to be
              extra vigilant about our actions to ensure our fasts are accepted."
            </div>
            <div>
              ⭐⭐⭐⭐⭐ “I'm deeply grateful for this entire plan. I wanted to learn more, but it
              ended all too soon - each word was like a delicate flower on a branch.”
            </div>
            <div>
              ⭐⭐⭐⭐⭐ “Thank you for sharing this masterpiece. May Allah reward you with Jannah
              for your efforts.”
            </div>
            <div>
              ⭐⭐⭐⭐⭐ “It has been the best few thousand of words that has ever passed infront of
              my eyes . I could not be more grateful that there are resources like this that anyone
              can reach at anytime and get an insight of such deep and personal queries. Thank you
              so much and huge respect for the writer.”
            </div>
            <div>
              ⭐⭐⭐⭐⭐ “I loved it!!! Continue on just like that! I especially liked that it was a
              short and approachable learning plan that still held onto so much substance in each
              lesson, as well as how important and applicable it was during Ramadan where our
              purpose of fasting is to gain Taqwa. A topic of the Qur'an that's not talked about as
              much as it needs to be! Alhamdulillah. I think such a learning plan like this could
              easily be shared with friends as well without being overwhelming, and I love the tips
              that wrapped it up so nicely at the end! Thank you so much! /Fatima”
            </div>
            <div>
              ⭐⭐⭐⭐⭐ “I have learned there is much more deeper meaning to the holy month of
              Ramadan. it was very educating.”
            </div>
            <div>
              ⭐⭐⭐⭐⭐ “The simplicity and clarity of the explanations eased the understanding
              process..this was truly knowledgable”
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('mindful_fasting');
                }}
                variant={ButtonVariant.Shadow}
                href={getCourseNavigationUrl('mindful-fasting')}
                isNewTab
                className={styles.button}
              >
                Start this learning plan now!
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection} id="quranreflect-ramadan-challenge">
            <h1>Ramadan Ready Challenge on QuranReflect</h1>
            <div>
              Preparing for Ramadan does not begin with the only gearing up for the first fast, it
              begins with readiness of the heart.
            </div>
            <div>
              The <span className={pageStyles.bold}>Ramadan Ready Challenge</span> invites you to
              share your{' '}
              <span className={pageStyles.bold}>best advice, insight, or reflection</span> on how to
              truly prepare for Ramadan, spiritually, mentally, and practically.
            </div>
            <div>
              This reflection challenge is <span className={pageStyles.bold}>led by Shaykh</span>{' '}
              <Link href="https://quran.foundation/shaykh-hammad-fahim" isNewTab>
                Hammad Fahim
              </Link>
              , guiding us toward intentional, Quran-centered preparation for the blessed month.
            </div>
            <br />
            <h2>✏️ How to participate</h2>
            <ul className={pageStyles.list}>
              <li>
                Post your reflection on{' '}
                <Link href={EXTERNAL_ROUTES.QURAN_REFLECT} isNewTab>
                  QuranReflect
                </Link>
              </li>
              <li>Share sincere, practical guidance on getting Ramadan ready</li>
              <li>Reflect on what helps the heart receive the Quran more fully</li>
            </ul>
            <br />
            <h2 className={pageStyles.italic}>🏆 Featured Reflections</h2>
            <div>
              The most impactful reflections will be{' '}
              <span className={pageStyles.bold}>featured and shared</span> during the{' '}
              <span className={pageStyles.bold}>Reflection Retreat Live Podoct</span> on February
              14th 2026, insha'Allah.
            </div>
            <div>
              Your reflection may help hearts enter Ramadan with clarity, intention, and hope.
            </div>
            <div>
              (Already have a Quran.com account? Sign in with the same email to link your accounts.)
            </div>
            <br />
            <div className={pageStyles.subtext}>
              Download the QuranReflect app on the App Store or Google Play Store, or simply visit{' '}
              <Link href={EXTERNAL_ROUTES.QURAN_REFLECT} isNewTab>
                QuranReflect.com
              </Link>
            </div>
            <div className={classNames(pageStyles.bold, pageStyles.subtext)}>
              QuranReflect is free, non-profit and has no ads.
            </div>
            <br />
            <div className={pageStyles.storeButtons}>
              <div>
                <Link href={EXTERNAL_ROUTES.QURAN_REFLECT_ANDROID} isNewTab>
                  <Image src="/images/qr_playstore.png" alt="Play Store" width={160} height={100} />
                </Link>
              </div>
              <Link href={EXTERNAL_ROUTES.QURAN_REFLECT_IOS} isNewTab>
                <Image src="/images/qr_appstore.png" alt="App Store" width={160} height={100} />
              </Link>
            </div>
            <br />
          </div>
          <hr />
          <div className={styles.subSection} id="share-the-month-of-the-quran">
            <h1>Share the Month of the Quran! Visit 'What Is Ramadan?'</h1>
            <div>
              For those unfamiliar with Ramadan, we've created a page to explore the question “What
              is Ramadan?” in a simple and inspiring way. This page highlights the significance of
              Ramadan and its profound connection to the Quran. Share it with your friends and loved
              ones to invite them to experience the beauty and blessings of this sacred month.
            </div>
            <div>
              Visit:{' '}
              <Link href={getWhatIsRamadanNavigationUrl()} isNewTab>
                What Is Ramadan?
              </Link>
            </div>
          </div>
          <hr />
          <div className={styles.subSection} id="explore-additional-beneficial-features">
            <h1>Explore Additional Beneficial Features!</h1>
            <div>
              Discover additional features on Quran.com to make your Ramadan journey more enriching.
              You can take personalized notes at the ayah level to capture your reflections and
              thoughts, read tafsir (commentary) to deepen your understanding of the Quran, and
              explore reflections shared by others for inspiration.
            </div>
            <div className={pageStyles.newFeature}>
              <Image src={newFeatureImage} height={490} width={300} alt="New Feature Image" />
            </div>
            <div>Check at the ayah-level for these additional features.</div>
            <div>
              With more features like bookmarking, audio recitations, and a powerful search tool, we
              hope Quran.com can help you deeply connect with the Quran in Ramadan and beyond,
              insha'Allah!
            </div>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>May You Build a Deep and Profound Connection with the Quran This Ramadan</h1>
            <div>
              May Allah make this Ramadan a time of profound growth, deep reflection, and meaningful
              connection with the Quran. Start preparing today and join us on this transformative
              journey.
            </div>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>Support Quran.Foundation ❤️</h1>
            <div>
              We remain committed to our mission to empower every human being to benefit from the
              Quran. The modern technology and human talent needed to accomplish our mission
              requires resources. Monthly donations help us retain top talent and sustain operations
              so we focus less on fundraising and more on creating impact. To learn more and donate,
              visit:{' '}
              <Link href={makeDonateUrl()} isNewTab>
                donate.quran.foundation
              </Link>
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('donate');
                }}
                variant={ButtonVariant.Shadow}
                href={makeDonatePageUrl(false, true)}
                isNewTab
                className={styles.button}
              >
                Donate Today
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default Ramadan2026Page;
