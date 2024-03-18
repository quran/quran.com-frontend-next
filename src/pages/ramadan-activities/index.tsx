/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import pageStyles from './RamadanActivities.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import EmbeddableVerseCell from '@/components/QuranReader/TranslationView/EmbeddableVerseCell';
import InlineLink from '@/components/RamadanActivity/InlineLink';
import RamadanActivityHero from '@/components/RamadanActivity/RamadanActivityHero';
import ReadMoreCollapsible, {
  Section,
  TitleType,
} from '@/components/RamadanActivity/ReadMoreCollapsible';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import styles from '@/pages/contentPage.module.scss';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import {
  getCanonicalUrl,
  getLoginNavigationUrl,
  getRamadanActivitiesNavigationUrl,
  getReadingGoalNavigationUrl,
} from '@/utils/navigation';

const PATH = getRamadanActivitiesNavigationUrl();
const RamadanActivitiesPage: NextPage = (): JSX.Element => {
  const { t, lang } = useTranslation('ramadan-activities');

  const onButtonClicked = (section: Section) => {
    logButtonClick(`${section}_ramadan_activities_cta`);
  };

  return (
    <>
      <NextSeoWrapper
        title={t('ramadan-activities')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description={t('ramadan-activities-desc')}
      />
      <RamadanActivityHero />
      <PageContainer>
        <div className={pageStyles.verseContainer}>
          <EmbeddableVerseCell chapterId={2} verseNumber={183} fontScale={3} />
        </div>
        <div className={classNames(pageStyles.container, styles.contentPage)} dir="ltr">
          <div className={styles.subSection} id="mindful">
            <h1>Mindful Fasting📿</h1>
            <div className={styles.subHeading}>
              A QuranReflect interactive Program with Shaykh Hammad Fahim.
            </div>
            <div>
              “Mindful Fasting” will explore how fasting purifies the soul, disciplines the mind,
              and awakens the heart, offering a transformative experience that deepens our
              relationship with Allah. This program is a gateway to a profound journey of faith and
              reflection.
            </div>
            <ReadMoreCollapsible section={Section.MINDFUL_FASTING}>
              <div>
                When you
                <InlineLink text="Sign up" href="https://quranreflect.com/users/sign_in" />
                for QuranReflect.com you will automatically follow Shaykh Fahim and receive updates.
                Search #MindfulFasting throughout the month on
                <InlineLink text="QuranReflect.com" href="https://quranreflect.com" />
                to read reflections from the community. (If you already have a Quran.com account -
                signing in to QuranReflect with the same email will link the two accounts.)
              </div>
            </ReadMoreCollapsible>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked(Section.MINDFUL_FASTING);
                }}
                variant={ButtonVariant.Shadow}
                href="https://quranreflect.com"
                isNewTab
                className={styles.button}
              >
                Join QuranReflect Community
              </Button>
            </div>
          </div>
          <div className={styles.subSection} id="ayah-lookup">
            <h1>Ayah Lookup Challenge 🔎</h1>
            <div className={styles.subHeading}>with Dr Mohannad Hakeem</div>
            <div>
              Are you seeking to enhance your connection with the Quran while being challenged to
              delve deeper and search for answers? If so, consider exploring a fresh approach that
              can help you deepen your relationship with the Quran.
            </div>
            <ReadMoreCollapsible section={Section.AYAH_LOOKUP_CHALLENGE}>
              <>
                <div>
                  Join Dr. Mohannad Hakeem's Ayah Lookup Challenge where he will share a question
                  that can be answered with an ayah in the Quran. Sharpen your reading and
                  researching skills as you search for the answer within the suggested range of
                  verses.
                </div>
                <br />
                <div>
                  Check back at the end of the day when Dr. Mohannad posts the answer to see if you
                  got it right. To join this exciting challenge, follow
                  <InlineLink text="Dr. Mohannad Hakeem" href="https://quranreflect.com/mohannad" />
                  on QuranReflect.com and take part in this enriching experience! You may also
                  search
                  <InlineLink
                    text="#AyahLookUp"
                    href="https://quranreflect.com/?authors=%40mohannad&tags=%23AyahLookup&tab=newest"
                  />{' '}
                  on QuranReflect.
                </div>
              </>
            </ReadMoreCollapsible>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked(Section.AYAH_LOOKUP_CHALLENGE);
                }}
                variant={ButtonVariant.Shadow}
                href="https://quranreflect.com/?authors=%40mohannad&tags=%23AyahLookup&tab=newest"
                isNewTab
                className={styles.button}
              >
                Follow AyahLookupChallenge
              </Button>
            </div>
          </div>
          <div className={styles.subSection} id="mas-quiz">
            <h1>MAS Ramadan Quiz Trivia (live) 🎙️</h1>
            <div>
              A daily 10-minute live trivia quiz featuring 10 quick questions from the Quran.
              Participants will also be assigned one Quran verse a week to reflect upon. See below
              for details on prizes!
            </div>
            <ReadMoreCollapsible section={Section.MAS_QUIZ}>
              <div>
                To help achieve a closer connection with the Quran, MAS will host a nationwide
                10-minute live, interactive quiz daily where contestants get to test and show their
                knowledge of the Quran.
                <br />
                MAS will offer winners residing in the U.S. monetary prizes with the option to
                donate them to a charity (Insha’Allah, prizes can be extended to a global audience
                in coming years.)
              </div>
            </ReadMoreCollapsible>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked(Section.MAS_QUIZ);
                }}
                variant={ButtonVariant.Shadow}
                href="https://quranreflect.com/masrqt"
                isNewTab
                className={styles.button}
              >
                Follow MAS RQT
              </Button>
            </div>
          </div>
          <div className={styles.subSection}>
            <h1>Learning Plans on Quran.com 📖</h1>
            <div>
              <b>Boost your knowledge with easy-to-follow lessons</b> that keep you growing in your
              journey with the Quran. Your progress is tracked until you reach the finish line.
              Start a Learning Plan today!
            </div>
            <ReadMoreCollapsible section={Section.LEARNING_PLANS}>
              <ul>
                <li>
                  <InlineLink
                    text="How to Explore the Quran: One Ayah at a Time"
                    href="/learning-plans/how-to-explore-the-quran"
                  />
                  by Dr. Sohaib Saeed
                </li>
                <li>
                  <InlineLink
                    text="Five Lenses for Reflecting on the Quran"
                    href="/learning-plans/five-lenses-to-reflect-on-the-quran"
                  />
                  by Dr. Sohaib Saeed
                </li>
                <li>
                  <InlineLink
                    text="Preparing Our Hearts for Ramadan"
                    href="/learning-plans/preparing-our-hearts-for-ramadan"
                  />
                  by Shaykh Hammad Fahim
                </li>
                <li>
                  More programs coming soon, insha’Allah. Keep an eye out on our
                  <InlineLink text="Learning Plans" href="/learning-plans" />
                  page.
                </li>
              </ul>
            </ReadMoreCollapsible>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked(Section.LEARNING_PLANS);
                }}
                variant={ButtonVariant.Shadow}
                href="/learning-plans"
                isNewTab
                className={styles.button}
              >
                View Learning Plans
              </Button>
            </div>
          </div>
          <div className={styles.subSection}>
            <h1>
              Keep a 30 day Quran reading streak and create a custom goal with Quran Growth Journey!
              🏅
            </h1>
            <div>
              Can you keep a 30 day Quran reading streak This Ramadan? Simply
              <InlineLink text="Log-in" href={getLoginNavigationUrl()} />
              to Quran.com and begin reading to start your Streak! You can also create a custom goal
              that will help you stay on track:
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked(Section.MONTH_STREAK);
                }}
                variant={ButtonVariant.Shadow}
                href={getReadingGoalNavigationUrl()}
                isNewTab
                className={styles.button}
              >
                Create Goal
              </Button>
            </div>
          </div>
          <div className={styles.subSection}>
            <h1>Invite people to learn about the Quran this Ramadan 💌</h1>
            <div>
              Help someone who has never read the Quran learn more and begin their Quran journey!
              Share our <InlineLink text="About The Quran" href="/about-the-quran" /> page designed
              to help newcomers ease into their Quran reading experience. View sample invitation:
            </div>
            <ReadMoreCollapsible section={Section.INVITE_PEOPLE}>
              <>
                <div>
                  “Ramadan is not just a month of fasting for Muslims; it's also about the Quran's
                  revelation, a time of deep reflection & connection. 📖 Curious about its messages?
                  Visit <InlineLink text="Quran.com/about-the-Quran" href="/about-the-quran" /> to
                  find answers to key questions and tips on how to explore it.”
                </div>
                <br />
                <div>
                  You can also share an invitation to view responses to a reflection activity based
                  on the the viral hashtag
                  <InlineLink
                    text="#QuranBookClub"
                    href="https://quranreflect.com/?tags=%23QuranBookClub"
                  />
                  .
                </div>
                <br />
                <div>
                  QuranReflect asks: "If you could introduce someone to the Quran with just one
                  ayah, which would it be, and why?"
                </div>
                <br />
                <div>
                  View responses, write your own, and invite people to read the Quran for the first
                  time.
                </div>
              </>
            </ReadMoreCollapsible>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked(Section.INVITE_PEOPLE);
                }}
                variant={ButtonVariant.Shadow}
                href="/about-the-quran"
                isNewTab
                className={styles.button}
              >
                About The Quran
              </Button>
            </div>
          </div>
          <div className={styles.subSection}>
            <h1>Reflecting In Crisis ❤️‍🩹</h1>
            <div>
              Join the QuranReflect community for an on-going reflection theme dedicated to
              reflecting upon the Quran during these difficult times of crisis. Read and interact
              with over 60 Personal reflections shared by our community members and share your own.
              <InlineLink
                text="#ReflectingInCrisis"
                href="https://quranreflect.com/?tags=%23ReflectingInCrisis&tab=most_popular"
              />
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked(Section.CRISIS);
                }}
                variant={ButtonVariant.Shadow}
                href="https://quranreflect.com/?tags=%23ReflectingInCrisis&tab=most_popular"
                isNewTab
                className={styles.button}
              >
                Go to #ReflectingInCrisis
              </Button>
            </div>
          </div>
          <div className={styles.subSection} id="ramadan-reading">
            <h1>Inspiring Ramadan Reading 🌞</h1>
            <div>
              Explore a collection of inspirational Ramadan reflections from the QuranReflect
              Community curated to help you connect more deeply with the Quran.
            </div>
            <ul>
              <li>
                <InlineLink
                  text="Purifying Our  Speech This Ramadan: A Time to Train our Tongues"
                  href="https://quranreflect.com/posts/17754"
                />
              </li>
              <li>
                <InlineLink
                  text="When everything looks broken"
                  href="https://quranreflect.com/posts/13479"
                />
              </li>
            </ul>
            <ReadMoreCollapsible
              section={Section.INSPIRING_READING}
              titleType={TitleType.SHOW_MORE}
            >
              <ul>
                <li>
                  <InlineLink
                    text="Taqwa Through Trials: The Gratitude Gained from Ramadan Fasting"
                    href="https://quranreflect.com/posts/7666"
                  />
                </li>
                <li>
                  <InlineLink
                    text="A Lesson on Mortality from a Missed Cup of Coffee"
                    href="https://quranreflect.com/posts/6797"
                  />
                </li>
                <li>
                  <InlineLink
                    text="Reflections on Faith and Fellowship in a Microbus Journey"
                    href="https://quranreflect.com/posts/3249"
                  />
                </li>
                <li>
                  <InlineLink
                    text="A Limited Number of Days"
                    href="https://quranreflect.com/posts/17824"
                  />
                </li>
                <li>
                  <InlineLink
                    text="Countless Mercies: Reflecting on the Infinite Blessings of Allah"
                    href="https://quranreflect.com/posts/17852"
                  />
                </li>
                <li>
                  <InlineLink
                    text="Nurturing a God-Conscious Character Amid Imperfection"
                    href="https://quranreflect.com/posts/13453"
                  />
                </li>
                <li>
                  <InlineLink
                    text="My Lord Prescribed This Fast For Me"
                    href="https://quranreflect.com/posts/17399"
                  />
                </li>
                <li>
                  <InlineLink
                    text="You See More In the Dark"
                    href="https://quranreflect.com/posts/281"
                  />
                </li>
                <li>
                  <InlineLink
                    text="Overcoming Self-Hatred: A Journey Towards Healing and Faith in Ramadan"
                    href="https://quranreflect.com/posts/13513"
                  />
                </li>
                <li>
                  <InlineLink
                    text="On Taqwa: Understanding the Meaning Beyond Simple Translations"
                    href="https://quranreflect.com/posts/10511"
                  />
                </li>
                <li>
                  <InlineLink
                    text="“Draw Near!” Coming Closer to The Creator"
                    href="https://quranreflect.com/posts/8876"
                  />
                </li>
                <li>
                  <InlineLink
                    text="Are We Waiting to Return to Sin, or Do We Want To Permanently Break Free?"
                    href="https://quranreflect.com/posts/17987"
                  />
                </li>
                <li>
                  <InlineLink
                    text="Mind Over Matter: Developing Self-Restraint in Ramadan"
                    href="https://quranreflect.com/posts/6785"
                  />
                </li>
                <li>
                  <InlineLink
                    text="A Profound Lesson Learned While Delivering Food"
                    href="https://quranreflect.com/posts/8694"
                  />
                </li>
                <li>
                  <InlineLink
                    text="Allahu Akbar: Embracing the Takbir and Thankfulness as Ramadan Ends"
                    href="https://quranreflect.com/posts/3443"
                  />
                </li>
              </ul>
            </ReadMoreCollapsible>
          </div>
          <div className={styles.subSection}>
            We hope these activities enrich your Ramadan, deepening your connection with the Quran.
            Share this list of activities with anyone who may benefit.
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default RamadanActivitiesPage;
