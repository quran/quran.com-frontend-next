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
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import { getRamadanChallengeOgImageUrl } from '@/lib/og';
import styles from '@/pages/contentPage.module.scss';
import pageStyles from '@/pages/ramadanchallenge/ramadanchallenge.module.scss';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, RAMADAN_2026_URL, RAMADAN_CHALLENGE_URL } from '@/utils/navigation';

const RamadanChallengePage: NextPage = (): JSX.Element => {
  const PATH = RAMADAN_CHALLENGE_URL;
  const { lang } = useTranslation();

  const onButtonClicked = (section: string) => {
    logButtonClick(`ramadan_challenge_${section}`);
  };

  return (
    <>
      <NextSeoWrapper
        title="Ramadan Challenge: Take the Meaningful Memorization Challenge This Ramadan"
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description="Take the Meaningful Memorization Challenge This Ramadan"
        image={getRamadanChallengeOgImageUrl({
          locale: lang,
        })}
      />
      <PageContainer>
        <div className={classNames(pageStyles.container, styles.contentPage)} dir="ltr">
          <div className={styles.subSection} id="join-surah-mulk-challenge">
            <h1>Take the Meaningful Memorization Challenge This Ramadan</h1>
            <h2>30 days with Surah Al-Mulk. One ayah a day. A lifetime of impact.</h2>
            <div>
              Join the challenge and end this Ramadan with a deep connection with Surah Al-Mulk.
              Through one ayah a day, you're guided to focus on just one verse at a time - receiving
              the word-by-word breakdown, tafsir insights you need to understand it, reflect on it,
              and memorize it with meaning.
            </div>
            <h2>✅ Sign up today and invite others to join (FREE):</h2>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('join_surah_mulk_challenge');
                }}
                variant={ButtonVariant.Shadow}
                className={styles.button}
              >
                Join the Surah Al-Mulk Challenge
              </Button>
            </div>
            <h2>🌍 68+ people around the world have joined the challenge!</h2>
            <h2>
              Don't miss this great opportunity to transform your relationship with this powerful
              Surah.
            </h2>
          </div>
          <hr />
          <div className={styles.subSection} id="how-the-challenge-works">
            <h1>How the Challenge Works</h1>
            <div>
              Each day of Ramadan, you'll receive a short, focused lesson built around{' '}
              <span className={pageStyles.bold}>one ayah</span> from Surah Al-Mulk.
            </div>
            <ul>
              <li>
                ✨ <span className={pageStyles.bold}>Word-by-word</span> breakdown to understand the
                meaning of the words
              </li>
              <li>
                ✨ <span className={pageStyles.bold}>A concise tafsir insight</span> to help you
                understand the ayah
              </li>
              <li>
                ✨ <span className={pageStyles.bold}>A daily reflection</span> from the community
                for the ayah
              </li>
              <li>
                ✨ <span className={pageStyles.bold}>Valuable</span>, optional content for a deeper
                dive
              </li>
            </ul>
            <h2>Everything is thoughtfully prepared for you and shared one day at a time.</h2>
            <div>
              Each day, you will simply focus on a single ayah - carrying it with you, memorizing
              it, reflecting on it, and connecting with it as you go through your day letting its
              meaning settle into your heart.
            </div>
          </div>
          <hr />
          <div className={styles.subSection} id="goal-setting">
            <h1>What You'll Gain By the End of Ramadan, insha'Allah:</h1>
            <ul>
              <li>✨ A memorized (or deeply familiar) Surah Al-Mulk</li>
              <li>✨ Stronger connection between recitation and meaning</li>
              <li>✨ A daily habit of engaging the Quran</li>
              <li>✨ Verses that stay with you long after Ramadan ends</li>
            </ul>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>Sign up Today and Take the Challenge This Ramadan (Free)</h1>
            <div>
              Begin your journey with Surah Al-Mulk and receive{' '}
              <span className={pageStyles.bold}>Day 1</span> as soon as the challenge begins (Day 1
              of Ramadan).
            </div>
            <h2>Sign up today and share with your friends, family, and community:</h2>
            <div className={styles.ctaContainer}>
              <Button
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
          <div className={styles.subSection}>
            <h1>Don't Miss This Opportunity</h1>
            <div>
              Ramadan arrives quickly and passes even faster. Many of us intend to slow down with
              the Quran, but without a clear path, the days slip by.
            </div>
            <div>
              This challenge gives you a simple, meaningful way to stay connected to Surah Al-Mulk
              every day of Ramadan. One ayah. One focus. A connection that builds quietly and lasts
              beyond the month.
            </div>
            <div>
              <span className={pageStyles.bold}>
                Don't let this Ramadan become another one you look back on wishing you had done more
                with the Quran.
              </span>{' '}
              Sign up today and begin your journey with this powerful Surah.
            </div>
            <div className={styles.ctaContainer}>
              <Button
                onClick={() => {
                  onButtonClicked('join_surah_mulk_challenge');
                }}
                variant={ButtonVariant.Shadow}
                className={styles.button}
              >
                Join the Surah Al-Mulk Challenge
              </Button>
            </div>
            <div>
              To learn more about our Ramadan activities, visit{' '}
              <Link href={RAMADAN_2026_URL} isNewTab>
                Quran.com/Ramadan2026
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default RamadanChallengePage;
