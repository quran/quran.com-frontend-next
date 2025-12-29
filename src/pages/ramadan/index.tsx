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
import ReadMoreCollapsible, {
  Section,
  TitleType,
} from '@/components/RamadanActivity/ReadMoreCollapsible';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import { getPreparingForRamadanOgImageUrl } from '@/lib/og';
import styles from '@/pages/contentPage.module.scss';
import pageStyles from '@/pages/ramadan/RamadanActivities.module.scss';
import AyahLevelSettings from '@/public/images/ayah-level-settings.jpeg';
import { makeDonatePageUrl } from '@/utils/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import {
  getCanonicalUrl,
  getCourseNavigationUrl,
  getLoginNavigationUrl,
  getRamadanNavigationUrl,
  getReadingGoalNavigationUrl,
} from '@/utils/navigation';

const PATH = getRamadanNavigationUrl();
const PreparingForRamadanPage: NextPage = (): JSX.Element => {
  const { lang } = useTranslation();

  const onButtonClicked = (section: string) => {
    logButtonClick(`${section}_preparing_for_ramadan_cta`);
  };

  return (
    <>
      <NextSeoWrapper
        title="Ramadan Tools, Programs, and Features: Deepen Your Connection with the Quran"
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description="Discover free tools, programs, and features to make the most of Ramadan. Set goals, prepare your heart, and deepen your connection with the Quran."
        image={getPreparingForRamadanOgImageUrl({
          locale: lang,
        })}
      />
      <PageContainer>
        <div className={classNames(pageStyles.container, styles.contentPage)} dir="ltr">
          <div className={styles.subSection}>
            <h1>Deepen Your Connection with the Quran this Ramadan</h1>
            <div>
              Ramadan is a time of immense blessings and reflection, a month where hearts are
              softened and connections with the Quran are deepened. It’s the perfect opportunity to
              embrace meaningful growth and embark on a transformative journey. With thoughtfully
              designed tools and programs, we aim to inspire engagement with the Quran that lasts
              well beyond this blessed month.
            </div>
            <ul>
              <li>
                <InlineLink
                  text="Goal Setting for Your Ramadan Journey"
                  href="#goal-setting"
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
                  text="Quranic Duas: Reflect and Connect"
                  href="#quranic-duas"
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
                  text="Share the Month of the Quran! Visit 'What Is Ramadan?'"
                  href="#share-the-month-of-the-quran"
                  isNewTab={false}
                />
              </li>
              <li>
                <InlineLink
                  text="Explore Additional Beneficial Features!"
                  href="#explore-additional-beneficial-features"
                  isNewTab={false}
                />
              </li>
            </ul>
            <hr />
          </div>
          <div className={styles.subSection} id="goal-setting">
            <h1>Goal Setting for Your Ramadan Journey</h1>
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
                href={
                  isLoggedIn()
                    ? getReadingGoalNavigationUrl()
                    : getLoginNavigationUrl(getReadingGoalNavigationUrl())
                }
                isNewTab
                className={styles.button}
              >
                Set Your Goal
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>Our Featured Ramadan Programs</h1>
          </div>
          <hr />
          <div className={styles.subSection} id="mindful-fasting">
            <h1>Mindful Fasting: A Ramadan Learning Plan</h1>
            <div>
              Discover the beauty of fasting beyond abstention with Mindful Fasting, a unique
              Learning Plan designed to help you:
            </div>
            <ul>
              <li>Reflect on the deeper purpose of fasting.</li>
              <li>Gain Quranic insights into patience, gratitude, and self-control.</li>
              <li>Deepen your connection with Allah through intentional practices.</li>
            </ul>
            <div>Start this learning plan now:</div>
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
                Enroll Now
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection} id="quranic-duas">
            <h1>Quranic Duas: Reflect and Connect</h1>
            <div>
              This Ramadan, join Shaykh Hammad Fahim and the QuranReflect community in a
              transformative journey through the Duas in the Quran. Each session invites you to:
            </div>
            <ul>
              <li>Reflect deeply on selected Quranic supplications.</li>
              <li>Understand the meaning and context of these powerful prayers.</li>
              <li>Share and engage with reflections from a global community.</li>
            </ul>
            <div>To participate, sign into QuranRelect:</div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('quranic_duas');
                }}
                variant={ButtonVariant.Shadow}
                href="https://quranreflect.com/users/sign_in"
                isNewTab
                className={styles.button}
              >
                Sign in
              </Button>
            </div>
            <div>
              Sign up on QuranReflect.com to automatically follow Shaykh Fahim and receive updates.
              Explore{' '}
              <InlineLink
                text="#QuranicDuas"
                href="https://quranreflect.com/?tags=%23QuranicDuas"
                isNewTab
              />{' '}
              throughout the month to read community reflections.
            </div>
            <br />
            <div>
              (Already have a Quran.com account? Sign in with the same email to link your accounts.)
            </div>
          </div>
          <hr />
          <div className={styles.subSection} id="preparing-our-hearts">
            <h1>Preparing Our Hearts for Ramadan</h1>
            <div>
              It's never too late to prepare for the days of Ramadan! Enhance your spiritual and
              mental readiness with our Learning Plan, Preparing Our Hearts for Ramadan. Start today
              and make the most of the blessed days ahead. This revised program is based on last
              year’s highly-rated course, enriched with additional insights and reflections to help
              you approach Ramadan with a rejuvenated focus.
            </div>
            <div>What You’ll Gain:</div>
            <ul>
              <li>Self-development tips.</li>
              <li>Quranic reflections to inspire mindfulness and intention-setting.</li>
              <li>Actionable tips to create a fulfilling Ramadan routine.</li>
            </ul>
            <div>Start this learning plan now:</div>
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
                Enroll Now
              </Button>
            </div>
            <div>Reviews from readers who completed this Learning Plan last Ramadan:</div>
            <div>
              ⭐⭐⭐⭐⭐ Mashallah,this learning plan not just helpful but it is extremely a helpful
              source for me to prepare myself for upcoming ramadhan. All the 9 day topics teach me
              lots of thing and made me reflect on my state of imaan.I hope i will gain more
              knowledge in the month of ramadhan. Ameen insyaallah. Thank you Quran.com!!
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
            <ReadMoreCollapsible section={Section.MORE_REVIEWS} titleType={TitleType.MORE_REVIEWS}>
              <div>⭐⭐⭐⭐⭐ “Mashallah, this is excellent content.”</div>
              <div>⭐⭐⭐⭐⭐ “Course was very inspiring and intuitive.”</div>
              <div>
                ⭐⭐⭐⭐⭐ “I kinda joined late but it surely did increase my knowledge and made me
                reflect upon my actions. It is a great step and I wish more people to join it so
                that they can also take benefit from it and try to improve their quality of life.”
              </div>
              <div>
                ⭐⭐⭐⭐⭐ “It was extremely useful. It reminds us to act to act upon the manual
                given to us by He Who is Exalted, High, and Mighty: Allah. Please do develop such
                plans for other months like Rajab. Thanks!”
              </div>
              <div>
                ⭐⭐⭐⭐⭐ “Not a single word in all the lessons didn't speak the truth. It was so
                helpful, alhamdulilah. Quran.com is a wonderful website, and every person, muslim
                and non-muslim, should use it. And, Inshallah, they will. Thank you for the help you
                provided me.”
              </div>
              <div>
                ⭐⭐⭐⭐⭐ “Important and vital read to prepare the heart for Ramadan and beyond.”
              </div>
            </ReadMoreCollapsible>
            <div>Start this learning plan now:</div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('preparing_our_hearts_bottom');
                }}
                variant={ButtonVariant.Shadow}
                href={getCourseNavigationUrl('preparing-our-hearts-for-ramadan')}
                isNewTab
                className={styles.button}
              >
                Enroll Now
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection} id="share-the-month-of-the-quran">
            <h1>Share the Month of the Quran! Visit 'What Is Ramadan?'</h1>
            <div>
              For those unfamiliar with Ramadan, we’ve created a page to explore the question “What
              is Ramadan?” in a simple and inspiring way. This page highlights the significance of
              Ramadan and its profound connection to the Quran. Share it with your friends and loved
              ones to invite them to experience the beauty and blessings of this sacred month.
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('what_is_ramadan');
                }}
                variant={ButtonVariant.Shadow}
                href="/what-is-ramadan"
                isNewTab
                className={styles.button}
              >
                What Is Ramadan?
              </Button>
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
            <div className={pageStyles.ayahLevelSettings}>
              <Image src={AyahLevelSettings} height={38} width={120} alt="Ayah Level Settings" />
              <div>Check at the ayah-level for these additional features.</div>
            </div>
            <div>
              With more features like bookmarking, audio recitations, and a powerful search tool, we
              hope Quran.com can help you deeply connect with the Quran in Ramadan and beyond,
              insha’Allah!
            </div>
          </div>
          <div className={styles.subSection}>
            <h1>May You Build a Deep and Profound Connection with the Quran This Ramadan</h1>
            <div>
              May Allah make this Ramadan a time of profound growth, deep reflection, and meaningful
              connection with the Quran. Start preparing today and join us on this transformative
              journey.
            </div>
          </div>
          <div className={styles.subSection}>
            <h1>Support Quran.Foundation ❤️</h1>
            <div>
              We remain committed to our mission to empower every human being to benefit from the
              Quran. The modern technology and human talent needed to accomplish our mission
              requires resources. Monthly donations help us retain top talent and sustain operations
              so we focus less on fundraising and more on creating impact. To learn more and donate,
              visit:
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
                className={styles.button}
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

export default PreparingForRamadanPage;
