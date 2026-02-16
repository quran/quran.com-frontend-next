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
import EnrollmentCount from '@/components/RamadanChallenge/EnrollmentCount';
import UnauthEnrollButton from '@/components/RamadanChallenge/UnauthEnrollButton';
import Button, { ButtonShape, ButtonType } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link from '@/dls/Link/Link';
import TelegramIcon from '@/icons/telegram.svg';
import WhatsappIcon from '@/icons/whatsapp.svg';
import { getRamadanChallengeOgImageUrl } from '@/lib/og';
import styles from '@/pages/contentPage.module.scss';
import pageStyles from '@/pages/ramadanchallenge/ramadanchallenge.module.scss';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { EXTERNAL_ROUTES, getCanonicalUrl, ROUTES } from '@/utils/navigation';

interface SocialButton {
  name: SocialButtonName;
  icon: React.ComponentType;
  url: string;
  eventKey: string;
}

enum SocialButtonName {
  Whatsapp = 'Whatsapp',
  Telegram = 'Telegram',
}

const SOCIAL_BUTTONS: SocialButton[] = [
  {
    name: SocialButtonName.Whatsapp,
    icon: WhatsappIcon,
    url: EXTERNAL_ROUTES.RAMADAN_CHALLENGE_WHATSAPP,
    eventKey: 'ramadan_challenge_join_whatsapp',
  },
  {
    name: SocialButtonName.Telegram,
    icon: TelegramIcon,
    url: EXTERNAL_ROUTES.RAMADAN_CHALLENGE_TELEGRAM,
    eventKey: 'ramadan_challenge_join_telegram',
  },
];

const PATH = ROUTES.RAMADAN_CHALLENGE;

const RamadanChallengePage: NextPage = (): JSX.Element => {
  const { lang } = useTranslation('common');

  return (
    <>
      <NextSeoWrapper
        title="One Ayah a Day: Surah Al-Mulk Challenge This Ramadan (Free)"
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description="Join the Meaningful Memorization Challenge this Ramadan! One ayah a day with word-by-word meaning, tafsir, and reflection. Start today and deepen your connection with Surah Al-Mulk."
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
              <UnauthEnrollButton section="join_surah_mulk_challenge" />
            </div>
            <div className={pageStyles.enrollmentContainer}>
              <EnrollmentCount />
            </div>
            <div className={pageStyles.socialButtonsGroup}>
              {SOCIAL_BUTTONS.map(({ name, icon: Icon, url, eventKey }) => (
                <Button
                  type={ButtonType.Success}
                  shape={ButtonShape.Pill}
                  key={name}
                  href={url}
                  isNewTab
                  onClick={() => logButtonClick(eventKey)}
                  className={pageStyles.socialButton}
                >
                  <IconContainer
                    className={pageStyles.iconContainer}
                    size={IconSize.Small}
                    shouldFlipOnRTL={false}
                    shouldForceSetColors={false}
                    icon={<Icon />}
                  />
                  <span className={pageStyles.joinSocialText}>Join our {name}</span>
                  <span className={pageStyles.joinSocialMobileText}>{name}</span>
                </Button>
              ))}
            </div>
            <h2>
              Don't miss this great opportunity to transform your relationship with this powerful
              Surah.
            </h2>
            <div>This Challenge is based on the content contained in our new Learning Plan:</div>
            <Link
              href="/learning-plans/30-transformative-days-with-surah-al-mulk-learn-reflect-memorize"
              isNewTab
            >
              🌍 30 Transformative Days with Surah Al-Mulk: Learn, Reflect, Memorize
            </Link>
          </div>
          <hr />
          <div className={styles.subSection} id="how-the-challenge-works">
            <h1>How the Challenge Works</h1>
            <div>
              Each day of Ramadan, you'll receive an email with a short, focused lesson built around{' '}
              <span className={pageStyles.bold}>one ayah</span> from Surah Al-Mulk.
            </div>
            <ul className={pageStyles.list}>
              <li>
                <span className={pageStyles.bold}>Word-by-word</span> breakdown to understand the
                meaning of the words
              </li>
              <li>
                <span className={pageStyles.bold}>A concise tafsir insight</span> to help you
                understand the ayah
              </li>
              <li>
                <span className={pageStyles.bold}>A daily reflection</span> from the community for
                the ayah
              </li>
              <li>
                <span className={pageStyles.bold}>Valuable</span>, optional content for a deeper
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
            <ul className={pageStyles.list}>
              <li>A memorized (or deeply familiar) Surah Al-Mulk</li>
              <li>Stronger connection between recitation and meaning</li>
              <li>A daily habit of engaging the Quran</li>
              <li>Verses that stay with you long after Ramadan ends</li>
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
              <UnauthEnrollButton section="join_surah_mulk_challenge" />
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
              <UnauthEnrollButton section="join_surah_mulk_challenge" />
            </div>
            <div className={pageStyles.learnMore}>
              To learn more about our Ramadan activities, visit{' '}
              <Link href={ROUTES.RAMADAN_2026} isNewTab>
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
