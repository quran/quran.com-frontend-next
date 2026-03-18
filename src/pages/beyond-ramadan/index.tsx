/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { useCallback, useState } from 'react';

import classNames from 'classnames';
import { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import PlainVerseText from '@/components/Verse/PlainVerseText';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useAuthData from '@/hooks/auth/useAuthData';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { getBeyondRamadanOgImageUrl } from '@/lib/og';
import pageStyles2 from '@/pages/beyond-ramadan/beyond-ramadan.module.scss';
import styles from '@/pages/contentPage.module.scss';
import pageStyles from '@/pages/ramadan/RamadanActivities.module.scss';
import { setAfterOnboardingRedirect } from '@/redux/slices/onboarding';
import ConsentType from '@/types/auth/ConsentType';
import { makeDonatePageUrl } from '@/utils/apiPaths';
import { updateUserConsent } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import {
  EXTERNAL_ROUTES,
  getBeyondRamadanNavigationUrl,
  getCanonicalUrl,
  getCourseNavigationUrl,
  getCoursesNavigationUrl,
  getLoginNavigationUrl,
  getQuranicCalendarNavigationUrl,
  getReadingGoalNavigationUrl,
  PRODUCT_UPDATES_URL,
} from '@/utils/navigation';
import verse3829 from 'src/data/verses/verse3829';
import UserProfile from 'types/auth/UserProfile';

const updateEbookConsent = async (
  setIsLoading: (v: boolean) => void,
  signUpReason: string | null,
  toast: ReturnType<typeof useToast>,
  t: ReturnType<typeof useTranslation>['t'],
  onSuccess?: () => void,
) => {
  setIsLoading(true);
  try {
    await updateUserConsent({ consentType: ConsentType.EBOOK, consented: true });
    if (signUpReason) {
      await updateUserConsent({ consentType: ConsentType.SIGNUP_REASON, consented: signUpReason });
    }
    onSuccess?.();
  } catch {
    toast(t('common:error.general'), {
      status: ToastStatus.Error,
    });
  } finally {
    setIsLoading(false);
  }
};

const PATH = getBeyondRamadanNavigationUrl();
const BeyondRamadanPage: NextPage = (): JSX.Element => {
  const { lang, t } = useTranslation('common');
  const toast = useToast();
  const dispatch = useDispatch();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { isLoggedIn } = useIsLoggedIn();
  const { userData } = useAuthData();

  const [isLoading, setIsLoading] = useState(false);

  const onSuccess = useCallback(async () => {
    await mutate(
      makeUserProfileUrl(),
      (currentProfileData: UserProfile) => ({
        ...currentProfileData,
        consents: { ...currentProfileData?.consents, [ConsentType.EBOOK]: true },
      }),
      { revalidate: false },
    );
  }, [mutate]);

  const onButtonClicked = (section: string) => {
    logButtonClick(`${section}_beyond_ramadan_cta`);

    if (section === 'ebook') {
      if (isLoggedIn) {
        updateEbookConsent(setIsLoading, null, toast, t, onSuccess);
      } else {
        const currentUrl = PATH;
        dispatch(setAfterOnboardingRedirect(currentUrl));
        router.push(getLoginNavigationUrl(currentUrl));
      }
    }
  };

  const isEbookSubscribed = userData?.consents?.ebook === true;

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
            <h1>Don’t Let Your Quran Journey End with Ramadan</h1>
            <div className={styles.paragraph}>
              Ramadan may be ending, but your relationship with the Quran should not. In this
              blessed month you recited more, listened more, and reflected more deeply on Allah’s
              words.
            </div>
            <div className={styles.paragraph}>
              Now the question is: What will happen after Ramadan?
            </div>
            <div className={styles.paragraph}>
              Many people feel their connection fade once the month ends. But the Quran was never
              meant to be seasonal. It was revealed to guide us{' '}
              <span className={pageStyles2.bold}>every day of our lives.</span>
            </div>
            <div className={styles.paragraph}>Allah says:</div>
            <PlainVerseText fontScale={1} words={verse3829.words} />
            <div className={classNames(pageStyles.verseTranslation, styles.paragraph)}>
              "˹This is˺ a blessed Book which We have revealed to you ˹O Prophet˺ so that they may
              contemplate its verses, and people of reason may be mindful."{' '}
              <Link variant={LinkVariant.Highlight} href="/38:29" isNewTab>
                Sad 38:29
              </Link>
            </div>
            <div className={styles.paragraph}>
              The habits you built this Ramadan can become the foundation of a lifelong relationship
              with the Quran.
            </div>
            <div className={styles.paragraph}>Here are simple ways to continue your journey:</div>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>🗓️ Quran in a Year</h1>
            <h2>A Simple Plan to Stay Consistent</h2>
            <div className={styles.paragraph}>
              One of the best ways to maintain your Quran habit is with a{' '}
              <span className={pageStyles2.bold}>clear and achievable plan.</span>
            </div>
            <div className={styles.paragraph}>
              <span className={pageStyles2.bold}>Quran in a Year</span> helps you complete the Quran
              between Ramadans through a manageable weekly reading schedule.
            </div>
            <div>What you’ll gain:</div>
            <ul className={classNames(pageStyles2.list, styles.paragraph)}>
              <li>A simple week-by-week reading plan</li>
              <li>Companion PDFs and podcast reflections</li>
              <li>A steady pace that fits into your life</li>
            </ul>
            <br />
            <div>
              <span className={classNames(pageStyles2.italic, pageStyles2.bold)}>
                Make it even more powerful:
              </span>
            </div>
            <div>
              Invite a few friends or family members to join you. Set a schedule together and
              encourage each other to stay consistent.
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('quran_in_a_year');
                }}
                variant={ButtonVariant.Shadow}
                href={getQuranicCalendarNavigationUrl()}
                isNewTab
              >
                Start Quran in a Year
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>📗 Free Community Reflection Ebook</h1>
            <div className={styles.paragraph}>
              Sign up now to receive the{' '}
              <span className={pageStyles2.bold}>free ebook after Eid</span>, insha’Allah!
            </div>
            <div className={styles.paragraph}>
              We are creating a{' '}
              <span className={pageStyles2.bold}>community reflection ebook on Surah Al-Mulk.</span>
            </div>
            <div className={styles.paragraph}>
              You can also participate: Share your reflection on{' '}
              <span className={pageStyles2.bold}>any verse of Surah Al-Mulk</span>, and it may be
              selected for inclusion in the final book.{' '}
            </div>
            <div>To participate:</div>
            <ul className={classNames(pageStyles2.list, styles.paragraph)}>
              <li>Post your reflection on QuranReflect</li>
              <li>Reflect on any verse from Surah Al-Mulk</li>
            </ul>
            <div>Selected reflections will be included in the ebook.</div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('ebook');
                }}
                variant={ButtonVariant.Shadow}
                isLoading={isLoading}
                isDisabled={isLoading || isEbookSubscribed}
              >
                {(() => {
                  if (isEbookSubscribed) return 'Subscribed';
                  return 'Sign Up for the Ebook';
                })()}
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>🪴 Maintaining Your Momentum Learning Plan</h1>
            <div className={styles.paragraph}>
              Many people struggle to sustain their Quran habits after Ramadan. This revised program
              is based on last year's highly-rated Learning Plan, “Maintaining Your Momentum:
              Avoiding the Post-Ramadan Slump” shares practical advice and helpful tips on how to
              maintain the momentum of Ramadan even after Ramadan has come to an end.
            </div>
            <h2>What You'll Gain:</h2>
            <ul className={classNames(pageStyles2.list2, styles.paragraph)}>
              <li>Self-development insights rooted in the Quran</li>
              <li>Reflections to help you cultivate a growth mindset</li>
              <li>Actionable strategies to integrate the Quran into daily life</li>
            </ul>
            <h2>Start the Free Learning Plan today and continue your transformation.</h2>
            <div>
              <span className={pageStyles2.bold}>Learn more:</span>{' '}
              <Link href={getCourseNavigationUrl('avoiding-the-post-ramadan-slump')}>
                Maintaining Your Momentum: Avoiding the Post-Ramadan Slump - Quran.com
              </Link>
            </div>
            <br />
            <h2>Reviews from readers who took this Learning Plan previously:</h2>
            <div className={pageStyles2.bold}>
              ⭐⭐⭐⭐⭐ "Another extremely enriching experience! An impactful nourishment to the
              heart. May Allah SWT give barakah to the author, the entire Quran.com team, and help
              me to be steadfast in the path of Allah SWT! Ameen."
            </div>
            <div className={pageStyles2.bold}>
              ⭐⭐⭐⭐⭐ "Just amazing, through Qur'an.com I started reflecting/Pondering and these
              learning paths adds a lot to my journey to Understand Qur'an better each day.."
            </div>
            <div className={pageStyles2.bold}>
              ⭐⭐⭐⭐⭐ "Excellent. Include more courses like this. Brilliant job. Learned many new
              things.Whoever is behind this work, May Allah give have mercy and blessings upon
              them."
            </div>
            <div className={pageStyles2.bold}>
              ⭐⭐⭐⭐⭐ "beautiful mashAllah this was a great reminder for after Ramadan and how to
              "stay" religious after that blessed month! jzak!"
            </div>
            <div className={pageStyles2.bold}>
              ⭐⭐⭐⭐⭐ "I must thank you again and again for these valuable lessons ! May Allah
              grant you the highest rank of Jannah ."
            </div>
            <div className={pageStyles2.bold}>
              ⭐⭐⭐⭐⭐ "Very informative and thought provoking. I enjoyed the reflection."
            </div>
            <div className={pageStyles2.bold}>
              ⭐⭐⭐⭐⭐ "I love how practical these tips are, and how the lessons were curated."
            </div>
            <br />
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>🌟 Additional New Learning Plans</h1>
            <div className={styles.paragraph}>
              Boost your knowledge with free, easy-to-follow lessons that keep you growing in your
              journey with the Quran.
            </div>
            <div className={styles.paragraph}>
              Start a Learning Plan today! Your progress can be tracked until you reach the finish
              line.
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('learning_plans');
                }}
                variant={ButtonVariant.Shadow}
                href={getCoursesNavigationUrl()}
                isNewTab
              >
                Explore Learning Plans
              </Button>
            </div>
            <Link href={getCoursesNavigationUrl()} isNewTab>
              <div className={pageStyles2.learningPlansImage}>
                <Image src="/images/learning-plans.png" alt="Learning Plans" fill />
              </div>
            </Link>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>📖 Surah Al-Fatiha Word-by-Word Learning Plan</h1>
            <div className={styles.paragraph}>
              Surah Al-Fatiha is the chapter you recite in{' '}
              <span className={pageStyles2.bold}>every prayer</span>
            </div>
            <div className={styles.paragraph}>
              But do you know the meaning of{' '}
              <span className={pageStyles2.bold}>every word you say to Allah?</span>
            </div>
            <div className={styles.paragraph}>
              Join our{' '}
              <span className={pageStyles2.bold}>Surah Al-Fatiha Word-by-Word Learning Plan</span>{' '}
              and begin your post-Ramadan journey with deeper understanding.
            </div>
            <div>In this short learning plan you will:</div>
            <ul className={classNames(pageStyles2.list, styles.paragraph)}>
              <li>Understand the words of Surah Al-Fatiha</li>
              <li>Discover the depth and beauty of its meanings</li>
              <li>Experience your daily prayers with greater presence and reflection</li>
            </ul>
            <div>
              Start your post-Ramadan days{' '}
              <span className={pageStyles2.bold}>
                grounded in the meaning of the words you recite in every salah.
              </span>
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('surah_al_fatiha_learning_plan');
                }}
                variant={ButtonVariant.Shadow}
                isDisabled
              >
                Coming soon, insha’Allah
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>💭 Continue Reflecting with QuranReflect</h1>
            <div className={styles.paragraph}>
              Ramadan teaches us lessons that should stay with us long after the month ends.
            </div>
            <div className={styles.paragraph}>This month’s reflection theme is:</div>
            <h2>“Ramadan Taught Me”</h2>
            <div className={styles.paragraph}>What did Ramadan teach you about the Quran?</div>
            <div className={styles.paragraph}>
              What insights will you carry with you into the rest of the year?
            </div>
            <div>On QuranReflect you can:</div>
            <ul className={classNames(pageStyles2.list, styles.paragraph)}>
              <li>Read reflections from scholars and readers</li>
              <li>Share your own insights</li>
              <li>Learn from a global community reflecting on the Quran</li>
            </ul>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('quran_reflect');
                }}
                variant={ButtonVariant.Shadow}
                href={EXTERNAL_ROUTES.QURAN_REFLECT}
                isNewTab
              >
                Join the Discussion
              </Button>
            </div>
            <h2>QuranReflect is free, non-profit and has no ads.</h2>
            <div className={pageStyles2.storeButtons}>
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
          <hr />
          <div className={styles.subSection}>
            <h1>✅ Set a Personal Quran Goal</h1>
            <div className={styles.paragraph}>Consistency grows when you track your progress.</div>
            <div className={styles.paragraph}>
              Set a custom Quran goal and build a lasting habit with Allah’s words.
            </div>
            <div>You can:</div>
            <ul className={classNames(pageStyles2.list, styles.paragraph)}>
              <li>Set reading goals</li>
              <li>Track your progress</li>
              <li>Build daily Quran streaks</li>
            </ul>
            <div>
              Small steps taken consistently can transform your relationship with the Quran.
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('reading_goal');
                }}
                variant={ButtonVariant.Shadow}
                href={getReadingGoalNavigationUrl()}
                isNewTab
              >
                Create Your Goal
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>📲 Explore Features that Deepen Your Connection</h1>
            <div className={styles.paragraph}>
              Quran.com includes powerful tools to help you stay engaged with the Quran throughout
              the year.
            </div>
            <div>You can:</div>
            <ul className={classNames(pageStyles2.list, styles.paragraph)}>
              <li>Save personal notes and reflections</li>
              <li>Bookmark verses to revisit later</li>
              <li>Read trusted tafsir and translations</li>
              <li>Read reflections and lessons</li>
              <li>Listen to beautiful recitations anytime</li>
              <li>And much more</li>
            </ul>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('product_updates');
                }}
                variant={ButtonVariant.Shadow}
                href={PRODUCT_UPDATES_URL}
                isNewTab
              >
                Explore Quran.com Features
              </Button>
            </div>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>❤️ Support Quran.Foundation</h1>
            <div className={styles.paragraph}>
              Your support helps millions of people around the world access the Quran through{' '}
              <span className={pageStyles2.bold}>Quran.com</span> and{' '}
              <span className={pageStyles2.bold}>QuranReflect</span>.
            </div>
            <div className={styles.paragraph}>
              These platforms remain{' '}
              <span className={pageStyles2.bold}>free, ad-free, and accessible to everyone</span>,
              thanks to supporters like you.
            </div>
            <div className={styles.paragraph}>
              At a time when so many hearts are searching for guidance, the world needs the Quran
              more than ever.
            </div>
            <div className={styles.paragraph}>
              Your support helps share Allah’s words with people everywhere.
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
