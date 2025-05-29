/* eslint-disable max-lines */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable i18next/no-literal-string */
import classNames from 'classnames';
import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import Button from '@/components/dls/Button/Button';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import InlineLink from '@/components/RamadanActivity/InlineLink';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { getBestDaysOgImageUrl } from '@/lib/og';
import styles from '@/pages/contentPage.module.scss';
import pageStyles from '@/pages/ramadan/RamadanActivities.module.scss';
import { logButtonClick } from '@/utils/eventLogger';
import { getBestDayNavigationUrl, getCanonicalUrl, getDonationUrl } from '@/utils/navigation';

const PATH = getBestDayNavigationUrl();

const TheBestDaysPage: NextPage = () => {
  const { t, lang } = useTranslation('common');

  return (
    <>
      <NextSeoWrapper
        title="The Sacred Month and the Best Days"
        description="The sacred month of Dhul-Hijjah is one of the four sacred months mentioned in the Qur'an, a time divinely designated for heightened devotion, multiplied reward, and deep reflection."
        canonical={getCanonicalUrl(PATH, lang)}
        image={getBestDaysOgImageUrl({ locale: lang })}
      />
      <PageContainer>
        <div className={classNames(pageStyles.container, styles.contentPage)} dir="ltr">
          <div className={styles.subSection}>
            <h1>The Sacred Month and the Best Days</h1>
            <p>
              The sacred month of <b>Dhul-Hijjah</b> is one of the four sacred months mentioned in
              the Qur'an, a time divinely designated for heightened devotion, multiplied reward, and
              deep reflection.
            </p>
            <p>
              These are the days when the believer is called to remember Allah more, sacrifice more
              sincerely, and submit more completely. From the <b>first ten days</b> -described by
              the Prophet (peace be upon him) as the most beloved days for righteous deeds -to the{' '}
              <b>Day of Arafah</b> and <b>Eid al-Adha</b>, each moment holds the potential to
              transform your heart and elevate your Hereafter.
            </p>

            <p>
              The Qur'an calls you, wherever you are, to realign, reconnect, and return to your
              Lord. Whether you're standing on the plains of Arafat or sitting quietly at home,
              these days are a gateway to nearness.
            </p>
          </div>
          <hr />

          <div className={styles.subSection}>
            <h1>What the Qur'an Says About Dhul-Hijjah</h1>
            <div className={pageStyles.postRamadanVerseContainer}>
              <div className={pageStyles.verseTranslation}>
                <p>
                  <b>
                    <i>
                      “Indeed, the number of months ordained by Allah is twelve -in Allah’s Record
                      since the day He created the heavens and the earth -of which four are sacred”
                    </i>
                  </b>{' '}
                  <Link variant={LinkVariant.Highlight} href="/9:36" isNewTab>
                    At-Tawbah 9:36
                  </Link>{' '}
                  Among these, Dhul-Hijjah holds unique weight, as it combines sacred time with
                  sacred acts. Just as Makkah is a sacred place where both good and bad deeds carry
                  amplified consequences, these sacred months demand heightened awareness and
                  reverence. Dhul-Hijjah calls us to elevate our consciousness, avoid wrongdoing,
                  and fill our days with acts of devotion and justice.
                </p>
              </div>
            </div>
            <p>
              The Quran emphasizes the importance of remembering Allah during these sacred days:
            </p>

            <p>
              <b>
                <i>"And remember Allah during ˹these˺ appointed days."</i>
              </b>{' '}
              <Link variant={LinkVariant.Highlight} href="/2:203" isNewTab>
                Al-Baqarah 2:203
              </Link>
            </p>
            <p>
              The first ten days of Dhul-Hijjah are especially blessed—so much so that Allah swears
              by them in the Qur'an:{' '}
              <b>
                <i>"By the dawn. And [by] the ten nights"</i>
              </b>{' '}
              <Link variant={LinkVariant.Highlight} href="/89:1-2" isNewTab>
                Al-Fajr 89:1-2
              </Link>
              . Most scholars agree that these refer to the first ten days of this sacred month.
            </p>

            <p>
              The Prophet Muhammad (peace be upon him) emphasized their significance, saying,{' '}
              <b>
                <i>
                  "There are no days on which righteous deeds are more beloved to Allah than these
                  ten days"
                </i>
              </b>{' '}
              (Sahih al-Bukhari 969).
            </p>
            <p>
              Whether one is undertaking the Hajj pilgrimage or not, these are days to engage in
              fasting, extra prayers, charity, Quran recitation, and heartfelt reflection. The 9th
              day, the Day of Arafah, is particularly exalted. On this day, a verse was revealed
              declaring the perfection of Islam,{' '}
              <b>
                <i>
                  "Today I have perfected your faith for you, completed My favour upon you, and
                  chosen Islam as your way. But whoever is compelled by extreme hunger—not intending
                  to sin—then surely Allah is All-Forgiving, Most Merciful."
                </i>
              </b>{' '}
              <Link variant={LinkVariant.Highlight} href="/5:3" isNewTab>
                Al-Ma'idah 5:3
              </Link>
              .
            </p>
            <p>
              The Prophet (peace be upon him), when asked about fasting on the day of 'Arafa (9th of
              Dhu'I-Hijja), he said:" It expiates the sins of the preceding year and the coming
              year" (Sahih Muslim 1162b). It is a day of unmatched mercy and answered prayers.
            </p>

            <p>
              A recommended invocation as highlighted in the following hadith where the Prophet
              (peace be upon him) said,
            </p>

            <p className={styles.arabic} lang="ar">
              عَنْ عَبْدِ اللَّهِ بْنِ عَمْرٍو أَنَّ النَّبِيَّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ
              قَالَ خَيْرُ الدُّعَاءِ دُعَاءُ يَوْمِ عَرَفَةَ وَخَيْرُ مَا قُلْتُ أَنَا
              وَالنَّبِيُّونَ مِنْ قَبْلِي لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ
              الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ
            </p>

            <p>
              "The most excellent dua is the dua on the Day of Arafa, and the best of what I and the
              prophets before me have said, "'There is no god but Allah, alone, Who has no partner.
              His is the dominion and His is all praise and He is Able to do all things. " Source:
              Sunan al-Tirmidhī 3585/similar Hadith in Muwatta' 726
            </p>
          </div>
          <hr />

          <div className={styles.subSection}>
            <h1>The Legacy of Hajj and Sacrifice</h1>
            <p>
              At the heart of Dhul-Hijjah is the legacy of Hajj - a journey rooted in the submission
              of Prophet Ibrahim (peace be upon him). Allah commanded Ibrahim (peace be upon him)
              saying to him:{' '}
              <b>
                <i>"Proclaim the Pilgrimage to all people."</i>
              </b>{' '}
              <Link variant={LinkVariant.Highlight} href="/22:27" isNewTab>
                Al-Hajj 22:27
              </Link>
              , and to this day, millions respond to that ancient call.
            </p>
            <p>
              Eid al-Adha, on the 10th of Dhul-Hijjah, commemorates Ibrahim's willingness to
              sacrifice his son, and Allah's mercy in replacing it with a ram{' '}
              <Link variant={LinkVariant.Highlight} href="/37:107" isNewTab>
                As-Saffat 37:107
              </Link>
              . This legacy of sacrifice and obedience is revived annually through the Qurbani
              (ritual sacrifice), symbolizing sincere submission and trust in Allah. The following
              Days of Tashreeq (11th-13th) are marked by joy, remembrance, and the continual praise
              of Allah, as believers declare{' '}
              <b>
                <i>"Allahu Akbar" (God is Greater)</i>
              </b>{' '}
              after each prayer, carrying forward the spirit of devotion and gratitude.
            </p>
          </div>
          <hr />

          <div className={styles.subSection}>
            <h1>Theme of the Month on QuranReflect: "The Season of Sacrifice"</h1>
            <p>
              This Dhul-Hijjah, the theme on{' '}
              <InlineLink href="https://quranreflect.com" isNewTab text="QuranReflect.com" />
              is <b>The Season of Sacrifice.</b>
            </p>
            <ul className={styles.list}>
              <li>
                Explore how the Qur'an defines devotion and what it means to submit your will to
                Allah in everyday life.
              </li>
              <li>Read reflections from the community</li>
              <li>Share your own reflections</li>
              <li>Engage in thoughtful discussions</li>
              Hashtag: <b>#Sacrifice</b>
            </ul>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>Explore Community Reflections</h1>

            <ol className={styles.numberedList}>
              <li>
                <Link
                  href="https://quranreflect.com/posts/9481"
                  isNewTab
                  variant={LinkVariant.Highlight}
                >
                  Reclaiming and Proclaiming Takbir
                </Link>
              </li>
              <li>
                <Link
                  href="https://quranreflect.com/posts/27042"
                  isNewTab
                  variant={LinkVariant.Highlight}
                >
                  A season of renewal and reward
                </Link>
              </li>
              <li>
                <Link
                  href="https://quranreflect.com/posts/26466"
                  isNewTab
                  variant={LinkVariant.Highlight}
                >
                  Echoes from Arafat: The Prophet's Last Sermon
                </Link>
              </li>
              <li>
                <Link
                  href="https://quranreflect.com/posts/26517"
                  isNewTab
                  variant={LinkVariant.Highlight}
                >
                  Making The Most of Dhull Hijjah
                </Link>
              </li>
            </ol>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>Explore Quran.com Features to Keep You Engaged with the Quran</h1>
            <p>
              We've designed tools to help you stay consistent and deepen your understanding of the
              Quran year round:
            </p>
            <ul className={styles.list}>
              <li>Notes & Reflections – Capture personal insights as you read</li>
              <li>Bookmarks – Easily return to key verses through the "My Quran" menu</li>
              <li>Tafsir & Translations – Understand the meaning on a deeper level</li>
              <li>Audio Recitations – Listen to the Quran anytime, anywhere</li>
              <li>And more!</li>
            </ul>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>The Ten Days Are Passing. Make Them Count.</h1>
            <p>
              "There are no days in which righteous deeds are more beloved to Allah than these ten
              days..." -Prophet Muhammad (peace be upon him) (Bukhari)
            </p>
            <p>So recite. Learn. Reflect. Give. Sacrifice. Submit.</p>
            <p>
              May this Dhul-Hijjah be the beginning of a deeper, lasting connection with Allah and
              His words.
            </p>
          </div>
          <hr />
          <div className={styles.subSection}>
            <h1>Support the Mission: Quran.Foundation ❤️</h1>
            <p>
              We remain committed to our mission to empower every human being to benefit from the
              Quran. The modern technology and human talent needed to accomplish our mission
              requires resources. Monthly donations help us retain top talent and sustain operations
              so we focus less on fundraising and more on creating impact. To learn more and donate,
              visit:{' '}
              <InlineLink
                href="https://donate.quran.foundation"
                isNewTab
                text="donate.quran.foundation"
              />
            </p>
            <div className={styles.ctaContainer}>
              <Button
                href={getDonationUrl()}
                onClick={() => {
                  logButtonClick('best_days_become_monthly_donor');
                }}
                isNewTab
              >
                {t('fundraising.title')}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default TheBestDaysPage;
