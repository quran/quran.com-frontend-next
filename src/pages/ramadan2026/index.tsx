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
import { getRamadan2026OgImageUrl } from '@/lib/og';
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

const PATH = ROUTES.RAMADAN_2026;
const Ramadan2026Page: NextPage = (): JSX.Element => {
  const { lang } = useTranslation();

  const onButtonClicked = (event: string) => {
    logButtonClick(`ramadan2026_${event}`);
  };

  return (
    <>
      <NextSeoWrapper
        title="A Transformational Ramadan 2026 1447AH"
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description="Prepare your heart for Ramadan with Quran-centered challenges, learning plans, goal-setting, and more. Join us today!"
        image={getRamadan2026OgImageUrl({
          locale: lang,
        })}
      />
      <PageContainer>
        <div className={classNames(pageStyles.container, styles.contentPage)} dir="ltr">
          <div className={styles.subSection}>
            <h1>
              A Transformational Ramadan <span className={pageStyles.h1Subtext}>2026/1447AH</span>
            </h1>
            <h2>Ramadan Mubarak!</h2>
            <div className={styles.paragraph}>
              To reach another Ramadan is a great mercy from Allah (SWT) and a precious opportunity
              for true transformation.
            </div>
            <div className={styles.paragraph}>
              Ramadan is the month of the Quran - the greatest miracle and the most powerful source
              of guidance and change. Its words awaken hearts, bring clarity, and draw us closer to
              Allah.
            </div>
            <div className={styles.paragraph}>
              We are grateful and excited to share these Ramadan offerings with you to support your
              journey with the Quran during this blessed time.
            </div>
            <h2>We invite you to join the following activities:</h2>
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
                  text="Join the Global Quran Reflection Community"
                  href="#join-the-global-quran-reflection-community"
                  isNewTab={false}
                />
              </li>
              <li>
                <InlineLink
                  text="Quranic Leadership Series with Dr. Suleiman Hani"
                  href="#quranic-leadership-series"
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
          </div>
          <br />
          <hr />
          <div className={styles.subSection} id="join-surah-mulk-challenge">
            <h1>🌎 Meaningful Memorization Challenge: Surah Al-Mulk</h1>
            <div>
              A guided Ramadan challenge focused on memorizing Surah Al-Mulk one ayah at a time,
              rooted in understanding and reflection, so participants finish Ramadan with a lasting,
              meaningful connection to the surah.
            </div>
            <div className={styles.ctaContainer}>
              <Button
                href={ROUTES.RAMADAN_CHALLENGE}
                onClick={() => {
                  onButtonClicked('join_surah_mulk_challenge');
                }}
                variant={ButtonVariant.Shadow}
                className={styles.button}
              >
                Learn More
              </Button>
            </div>
            <div>This Challenge is based on the content contained in our new Learning Plan:</div>
            <Link
              href="/learning-plans/30-transformative-days-with-surah-al-mulk-learn-reflect-memorize"
              isNewTab
            >
              ➡️ 30 Transformative Days with Surah Al-Mulk: Learn, Reflect, Memorize
            </Link>
          </div>
          <br />
          <hr />
          <div className={styles.subSection} id="goal-setting">
            <h1>🎯 Goal-setting to stay on track</h1>
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
          <br />
          <hr />
          <div className={styles.subSection} id="preparing-our-hearts">
            <h1>♥️ Preparing Our Hearts for Ramadan</h1>
            <div className={styles.paragraph}>
              Enhance your spiritual and mental readiness with our Learning Plan, Preparing Our
              Hearts for Ramadan. Start today and make the most of the blessed days ahead. This
              revised program is based on last year's highly-rated course, enriched with additional
              insights and reflections to help you approach Ramadan with a rejuvenated focus.
            </div>
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
                Start this learning plan now! (Free)
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
                Start this learning plan now! (Free)
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection} id="mindful-fasting">
            <h1>☕ Mindful Fasting: A Ramadan Learning Plan</h1>
            <div className={styles.paragraph}>
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
                Start this learning plan now! (Free)
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
                Start this learning plan now! (Free)
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection} id="join-the-global-quran-reflection-community">
            <h1>📝 Join the Global Quran Reflection Community</h1>
            <div className={styles.paragraph}>
              Reflect on the Quran with a global community in a safe, moderated environment where
              the focus is on the Quran. Read and share reflections, learn from others around the
              world, and grow through a journey built for deep connection.
            </div>
            <div className={styles.paragraph}>
              Follow the Surah Al-Mulk Challenge, with{' '}
              <Link href="https://quran.foundation/shaykh-hammad-fahim" isNewTab>
                Shaykh Hammad Fahim
              </Link>{' '}
              accompanying this months Meaningful Memorization Challenge and share insights along
              the way.
            </div>
            <div>
              Shaykh Fahim and the review team will also be hosting 🔴 LIVE webinars and podcast
              throughout the month, so don't miss this great opportunity to grow closer to the
              Quran, insha'Allah!
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
          </div>
          <br />
          <hr />
          <div className={styles.subSection} id="quranic-leadership-series">
            <h1>🌿 Quranic Leadership Series with Dr. Suleiman Hani</h1>
            <div className={styles.paragraph}>
              Most people misunderstand leadership and reduce it to charisma, titles, or control,
              when in reality, leadership is the daily practice of influence, responsibility, and
              moral clarity. This Ramadan series brings together the highest-level leadership
              theories, simplified and synthesized into clear, actionable insights, and grounds them
              in deep Qur'anic guidance and Prophetic wisdom.
            </div>
            <div className={styles.paragraph}>
              Each short episode offers one verse, one reflection, and one leadership principle that
              trains the inner leader first. If you want a Ramadan journey that is spiritually
              transformative and intellectually rigorous, designed to reshape how you lead at home,
              at work, and in your community, follow the series and let the Qur'an rebuild your
              definition of leadership from the inside out.{' '}
              <Link href="https://quranreflect.com/SuleimanHani" isNewTab>
                Follow Dr. Suleiman Hani for daily posts on QuranReflect.
              </Link>
            </div>
          </div>
          <br />
          <hr />
          <div className={styles.subSection} id="share-the-month-of-the-quran">
            <h1>⭐ Share the Month of the Quran! Visit 'What Is Ramadan?'</h1>
            <div className={styles.paragraph}>
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
          <br />
          <hr />
          <div className={styles.subSection} id="explore-additional-beneficial-features">
            <h1>📱 Explore Additional Beneficial Features!</h1>
            <div className={styles.paragraph}>
              Discover additional features on Quran.com to make your Ramadan journey more enriching.
              You can take personalized notes at the ayah level to capture your reflections and
              thoughts, read tafsir (commentary) to deepen your understanding of the Quran, and
              explore reflections shared by others for inspiration.
            </div>
            <div className={classNames(pageStyles.newFeature, styles.paragraph)}>
              <Image src={newFeatureImage} height={200} width={300} alt="New Feature Image" />
            </div>
            <div className={styles.paragraph}>
              Check at the ayah-level for these additional features.
            </div>
            <div className={styles.paragraph}>
              With more features like bookmarking, audio recitations, and a powerful search tool, we
              hope Quran.com can help you deeply connect with the Quran in Ramadan and beyond,
              insha'Allah!
            </div>
          </div>
          <br />
          <hr />
          <div className={styles.subSection}>
            <h1>🕌 May You Build a Deep and Profound Connection with the Quran This Ramadan</h1>
            <div>
              May Allah make this Ramadan a time of profound growth, deep reflection, and meaningful
              connection with the Quran.
            </div>
          </div>
          <br />
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
