/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
import classNames from 'classnames';
import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import InlineLink from '@/components/RamadanActivity/InlineLink';
import { getWhatIsRamadanOgImageUrl } from '@/lib/og';
import styles from '@/pages/contentPage.module.scss';
import pageStyles from '@/pages/ramadan/RamadanActivities.module.scss';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getWhatIsRamadanNavigationUrl } from '@/utils/navigation';

const PATH = getWhatIsRamadanNavigationUrl();
const WhatIsRamadanPage: NextPage = (): JSX.Element => {
  const { lang } = useTranslation('ramadan-activities');

  return (
    <>
      <NextSeoWrapper
        title="What is Ramadan? Discover Its Spiritual Significance and Connection to the Quran"
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description="Discover the spiritual significance of Ramadan and its profound connection to the Quran—a transformative journey of revelation, reflection, and renewal."
        image={getWhatIsRamadanOgImageUrl({
          locale: lang,
        })}
      />
      <PageContainer>
        <div className={classNames(pageStyles.container, styles.contentPage)} dir="ltr">
          <h1>Ramadan: A Journey of Reflection, Renewal, and Revelation.</h1>
          <div className={styles.subSection}>
            <h2>What is Ramadan?</h2>
            <div>
              At the heart of Ramadan lies the Quran, the holy book of Islam. Revealed over 1,400
              years ago during this blessed month, the Quran is more than just a scripture; it is a
              guide for life, offering wisdom, comfort, and answers to life’s deepest questions. For
              Muslims, Ramadan is not just about fasting; it’s about reconnecting with the Quran’s
              timeless message and allowing it to renew and transform their hearts and minds.
            </div>
          </div>
          <div className={styles.subSection}>
            <h2>A Prescription for Mindfulness</h2>
            <div className={pageStyles.mainVerse}>
              <div>
                <i>
                  "You who believe, fasting is prescribed for you, as it was prescribed for those
                  before you, so that you may be mindful of God."
                </i>
              </div>
              [Quran <InlineLink text="2:183" href="/2:183" />]
            </div>
            <div className={styles.subSection}>
              Imagine a month dedicated entirely to nourishing your soul, fostering gratitude,
              selflessness and reconnecting with your Creator. Ramadan is that month for over 1.8
              billion Muslims worldwide. It is the ninth month of the Islamic calendar, a sacred
              period of fasting, prayer, and reflection. From dawn to sunset, Muslims refrain from
              food, drink, and sexual relations to focus on spiritual growth and self-discipline.
              But Ramadan is so much more than abstaining; it’s about connecting—to God, to one’s
              community, and to the divine message of the Quran. God tells us in the Quran,
            </div>
            <div className={styles.subSection}>
              <div>
                <i>
                  "It was in the month of Ramadan that the Quran was revealed as guidance for
                  mankind, clear messages giving guidance and distinguishing between right and
                  wrong. So any one of you who is present that month should fast, and anyone who is
                  ill or on a journey should make up for the lost days by fasting on other days
                  later. God wants ease for you, not hardship. He wants you to complete the
                  prescribed period and to glorify Him for having guided you, so that you may be
                  thankful."
                </i>
              </div>
              (Quran <InlineLink text="2:185" href="/2:185" />)
            </div>
          </div>
          <div className={styles.subSection}>
            <h2>A Profound Pause and Spiritual Reset</h2>
            <div>
              Have you ever felt the need to pause the chaos of life and reset? Ramadan is the
              perfect opportunity. This month was chosen by God to reveal the Quran, the holy book
              of Islam, to the Prophet Muhammad (peace be upon him). This divine connection makes
              Ramadan a time of heightened spirituality and purpose.
            </div>
            <div className={styles.subSection}>
              Fasting during Ramadan carries many additional benefits for the heart and soul -
              increased empathy for those in need, gratitude for blessings, and discipline over
              desires. But it’s not just about the physical fast—it’s a fast of the heart and soul
              from negativity and heedlessness, a reset for the mind and soul.
            </div>
          </div>
          <div className={styles.subSection}>
            <h2>The Quran: The Heart of Ramadan</h2>
            <div>
              What makes Ramadan unique is its intimate link with the Quran. Revealed over 1,400
              years ago, the Quran is the direct word of God. It’s not just a book but a guide for
              life, offering wisdom, comfort, and answers to life’s deepest questions.
            </div>
            <div className={styles.subSection}>
              During Ramadan, Muslims dedicate extra time to reading, reciting, and reflecting on
              the Quran. Special nightly prayers called Taraweeh are held, where the Quran is
              recited in beautiful, melodic tones. This deep immersion in the Quran’s message
              elevates Ramadan from a sacred observance into a profound journey of self-discovery,
              spiritual renewal, and reconnection with God, providing a chance to shed bad habits,
              realign the soul, and embrace a fresh start.
            </div>
          </div>
          <div className={styles.subSection}>
            <h2>What Can Ramadan Teach You?</h2>
            <div>
              Even if you’re not Muslim, Ramadan holds universal lessons. Have you ever wondered
              what it means to live with mindfulness? To practice gratitude even in moments of
              challenge? To seek clarity about your place in the world? These are the questions
              Ramadan invites us all to reflect upon.
            </div>
            <div className={styles.subSection}>
              <ul>
                <li>
                  What would happen if you paused for moments throughout the day to express
                  gratitude to your Creator?
                </li>
                <li>
                  How might a day of fasting—or even just cutting out distractions—change your
                  perspective?
                </li>
                <li>What could you discover about yourself by exploring the Quran?</li>
              </ul>
            </div>
          </div>
          <div className={styles.subSection}>
            <h2>Experience the Power of the Quran</h2>
            <div>
              The Quran is not just a book for Muslims; it’s a wellspring of wisdom and inspiration
              for any person willing to come to it with an open heart. Whether you’re searching for
              peace, answers, or a deeper understanding of life’s purpose, the Quran speaks to the
              human soul in ways that transcend culture and time.
            </div>
            <div className={styles.subSection}>
              As you explore the Quran, you’ll encounter profound ideas about justice, mercy,
              patience, and the beauty of creation. The Quran challenges us to think deeply, to
              reflect, and to act with compassion. Could this be the message your soul has been
              waiting for?
            </div>
          </div>
          <div className={styles.subSection}>
            <h2>Your Invitation</h2>
            <div>
              We invite you to take the first step on this journey. Explore Quran.com to experience
              the Quran for yourself. Listen to its recitation, read its meaning, and discover how
              its timeless guidance can illuminate your path.
            </div>
            <div className={styles.subSection}>
              Ramadan is a reminder that the soul’s nourishment is just as vital as the body’s.
              Whether you’re fasting or simply curious, this month offers a chance to reflect,
              renew, and reconnect. What could be more powerful than a fresh start for your soul?
            </div>
          </div>
          <div className={styles.subSection}>
            <h2>Discover. Reflect. Begin.</h2>
            <div>
              Let this Ramadan be your gateway to exploring the Quran’s profound impact. Who knows?
              This moment of curiosity could be the beginning of a life-changing journey.
            </div>
          </div>
          <div className={styles.subSection}>
            Interested in learning more about the Quran? Visit:{' '}
            <InlineLink text="About The Quran" href="/about-the-quran" />
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default WhatIsRamadanPage;
