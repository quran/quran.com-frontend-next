/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import InlineLink from '@/components/RamadanActivity/InlineLink';
import PlainVerseText from '@/components/Verse/PlainVerseText';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { getBeyondRamadanOgImageUrl } from '@/lib/og';
import styles from '@/pages/contentPage.module.scss';
import pageStyles from '@/pages/ramadan/RamadanActivities.module.scss';
import { makeDonatePageUrl } from '@/utils/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import {
  getBeyondRamadanNavigationUrl,
  getCanonicalUrl,
  getCourseNavigationUrl,
  getLoginNavigationUrl,
  getQuranicCalendarNavigationUrl,
  getReadingGoalNavigationUrl,
} from '@/utils/navigation';
import verse3829 from 'src/data/verses/verse3829';

const PATH = getBeyondRamadanNavigationUrl();
const BeyondRamadanPage: NextPage = (): JSX.Element => {
  const { lang } = useTranslation();

  const onButtonClicked = (section: string) => {
    logButtonClick(`${section}_beyond_ramadan_cta`);
  };

  return (
    <>
      <NextSeoWrapper
        title="Beyond Ramadan: Keep Growing with the Quran – Stay Connected Year-Round"
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        image={getBeyondRamadanOgImageUrl({
          locale: lang,
        })}
        description="Ramadan may be over, but your journey with the Quran continues. Stay consistent with structured plans, powerful tools, and guided lessons to help you stay on track. Take the next step today!"
      />
      <PageContainer>
        <div className={classNames(pageStyles.container, styles.contentPage)} dir="ltr">
          <div className={styles.subSection}>
            <h1>Beyond Ramadan: Keep Growing with the Quran</h1>
            <p>
              Ramadan may have ended, but the opportunity to grow with the Quran is still here. What
              you do next can shape your faith, transform your life, and impact your hereafter
              forever.
            </p>
            <p>
              Will you let your connection with the Quran fade, or will you build on it? The Quran
              is not just for Ramadan—it's meant to guide, uplift, and transform your life every
              single day.
            </p>
            <p>
              This is your moment to <b>keep going</b>—to deepen your understanding, strengthen your
              consistency, and make the Quran a part of who you are.
            </p>
            <p>
              We've created structured plans, powerful tools, and guided lessons to help you stay on
              track.
              <br />
              <b>Don't stop now—take the next step today.</b>
            </p>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>Quran in a Year</h1>
            <p>
              The best way to maintain consistency is with a clear, achievable plan. Quran in a Year
              is a structured reading program designed to help you complete the entire Quran between
              Ramadans—at a steady, manageable pace.
            </p>
            <div>What You'll Gain:</div>
            <p>
              <ul>
                <li>A clear, week-by-week reading plan</li>
                <li>Accompanying PDFs and a podcast to enrich your understanding</li>
                <li>A sustainable approach to Quran engagement without feeling overwhelmed</li>
              </ul>
            </p>
            <p>
              <b>Start your journey today:</b>
              <br />
              <Link
                onClick={() => {
                  onButtonClicked('quran_in_a_year');
                }}
                href={getQuranicCalendarNavigationUrl()}
                isNewTab
              >
                Visit "Quran In a Year" to Learn more
              </Link>
            </p>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>
              Maintain Your Momentum: A Post-Ramadan Learning Plan to help you stay motivated.
            </h1>
            <p>
              Many people struggle to sustain their Quran habits after Ramadan. Our refreshed
              Learning Plan: <b>Maintaining Your Momentum: Avoiding the Post-Ramadan Slump</b>{' '}
              shares practical advice and helpful tips on how to maintain the momentum of Ramadan
              even after Ramadan has come to an end.
            </p>
            <p>What You'll Gain:</p>
            <p>
              <ul>
                <li>Self-development insights rooted in the Quran</li>
                <li>Reflections to help you cultivate a growth mindset</li>
                <li>Actionable strategies to integrate the Quran into daily life</li>
              </ul>
            </p>
            <p>
              <b>Enroll in the Learning Plan today and continue your transformation.</b>
            </p>
            <p>
              Learn more:{' '}
              <Link href={getCourseNavigationUrl('avoiding-the-post-ramadan-slump')} isNewTab>
                Maintaining Your Momentum: Avoiding the Post-Ramadan Slump - Quran.com
              </Link>
            </p>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('maintain_momentum');
                }}
                variant={ButtonVariant.Shadow}
                href={getCourseNavigationUrl('avoiding-the-post-ramadan-slump')}
                isNewTab
              >
                Enroll Now
              </Button>
            </div>
            <p>
              <b>Reviews from readers who took this Learning Plan previously:</b>
            </p>
            <div>
              ⭐⭐⭐⭐⭐ "Another extremely enriching experience! An impactful nourishment to the
              heart. May Allah SWT give barakah to the author, the entire Quran.com team, and help
              me to be steadfast in the path of Allah SWT! Ameen."
            </div>
            <div>
              ⭐⭐⭐⭐⭐ "Just amazing, through Qur'an.com I started reflecting/Pondering and these
              learning paths adds a lot to my journey to Understand Qur'an better each day.."
            </div>
            <div>
              ⭐⭐⭐⭐⭐ "Excellent. Include more courses like this. Brilliant job. Learned many new
              things.Whoever is behind this work, May Allah give have mercy and blessings upon
              them."
            </div>
            <div>
              ⭐⭐⭐⭐⭐ "beautiful mashAllah this was a great reminder for after Ramadan and how to
              "stay" religious after that blessed month! jzak!"
            </div>
            <div>
              ⭐⭐⭐⭐⭐ "I must thank you again and again for these valuable lessons ! May Allah
              grant you the highest rank of Jannah ."
            </div>
            <div>
              ⭐⭐⭐⭐⭐ "Very informative and thought provoking. I enjoyed the reflection."
            </div>
            <div>
              ⭐⭐⭐⭐⭐ "I love how practical these tips are, and how the lessons were curated."
            </div>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>QuranReflect Theme of the Month: Ramadan Taught Me</h1>
            <div className={pageStyles.postRamadanVerseContainer}>
              <PlainVerseText fontScale={1} words={verse3829.words} />
              <div className={pageStyles.verseTranslation}>
                "˹This is˺ a blessed Book which We have revealed to you ˹O Prophet˺ so that they may
                contemplate its verses, and people of reason may be mindful."{' '}
                <Link variant={LinkVariant.Highlight} href="/38:29" isNewTab>
                  Sad 38:29
                </Link>
              </div>
              <p className={pageStyles.translationName}>- Dr. Mustafa Khattab, The Clear Quran</p>
            </div>
            <p>
              Every month, QuranReflect highlights a theme to help you ponder its wisdom and apply
              it to your life.
            </p>
            <p>
              <ul>
                <li>Read reflections from scholars and fellow learners</li>
                <li>Share your own insights and engage in thoughtful discussions</li>
                <li>Develop a habit of deeper Quranic reflection</li>
                <li>Reflections reviewed for quality</li>
              </ul>
            </p>
            <p>
              <b>This Month's Theme: "Ramadan Taught Me"</b>
            </p>
            <p>
              As we reflect on Ramadan's lessons, how has it deepened your connection with the
              Quran? What wisdom have you gained, and how will you carry it forward? Share your
              reflections using the hashtag #RamadanTaughtMe and continue the journey of growth and
              guidance through the Quran.
            </p>
            <Link href="https://quranreflect.com" isNewTab>
              Join the Discussion
            </Link>
            <p>
              <b>Coming Soon, insha'Allah: Live Reflection Workshops</b>
            </p>
            <p>
              Stay tuned for our upcoming Tadabbur workshops, carefully designed to deepen your
              reflection on the Quran.
            </p>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>Set a Custom Goal - Stay Consistent</h1>
            <div>
              Stay consistent on your Quran journey with custom goals and reading streaks! Set your
              targets, track your progress, and build a daily habit of connection with the Quran.
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('create_goal');
                }}
                variant={ButtonVariant.Shadow}
                href={
                  isLoggedIn()
                    ? getReadingGoalNavigationUrl()
                    : getLoginNavigationUrl(getReadingGoalNavigationUrl())
                }
                isNewTab
              >
                Create Goal
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>Explore Features to Keep You Engaged</h1>
            <div>
              We've designed tools to help you <b>stay consistent and deepen your understanding</b>{' '}
              of the Quran year round:
            </div>
            <p>
              <ul>
                <li>Notes & Reflections – Capture personal insights as you read</li>
                <li>Bookmarks – Easily return to key verses through the "My Quran" menu</li>
                <li>Tafsir & Translations – Understand the meaning on a deeper level</li>
                <li>Audio Recitations – Listen to the Quran anytime, anywhere</li>
                <li>And more!</li>
              </ul>
            </p>
            <Link href="/">Start Exploring</Link>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>A Year-Round Commitment to the Quran</h1>
            <div>
              Ramadan was just the beginning. The next step is yours to take. Whether it's reading,
              reflecting, memorizing, or understanding—commit to keeping the words of your Lord
              close to your heart year round.
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
              <InlineLink
                text="donate.quran.foundation"
                href="https://donate.quran.foundation"
                isNewTab
              />
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('become_a_monthly_donor');
                }}
                variant={ButtonVariant.Shadow}
                href={makeDonatePageUrl(false, true)}
                isNewTab
              >
                Become a Monthly Donor
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default BeyondRamadanPage;
