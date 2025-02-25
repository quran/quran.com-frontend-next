/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from '../contentPage.module.scss';

import pageStyles from './about-the-quran.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import PlainVerseText from '@/components/Verse/PlainVerseText';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { getAboutTheQuranImageUrl } from '@/lib/og';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import verse3829 from 'src/data/verses/verse3829';

const PATH = '/about-quran';
const AboutQuranPage: NextPage = (): JSX.Element => {
  const { t, lang } = useTranslation('about-quran');

  const onStartReadingClicked = () => {
    logButtonClick('about_quran_start_reading');
  };

  return (
    <>
      <NextSeoWrapper
        title={t('about-the-quran')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description={t('about-quran-desc')}
        image={getAboutTheQuranImageUrl({
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
      />
      <PageContainer>
        <div className={styles.contentPage} dir="ltr">
          <div className={styles.section}>
            <h1>What is the Quran?</h1>
            <div>
              The most conventional answer is that the Quran is a book – but it is not like most
              books. It is made up of words which contain truth and guidance for every human being,
              and Muslims believe that these are words revealed directly by God, in the Arabic
              language, to the last of His prophets and messengers, Muhammad ﷺ (peace be upon him).
            </div>
            <div>
              The Quran presents itself with a number of names and descriptions which are worth
              reflecting on. Here are just a few:
            </div>
            <ol>
              <li>
                Quran and Kitab (Recital & Writ): the first means something recited aloud, and the
                second means something written down. This describes the two main ways this scripture
                is experienced, and which you can encounter on this website.
              </li>
              <li>
                Kalam Allah (Divine Speech): this means that these words are a direct communication
                from the Creator and Master of every living being. It occupies the highest level of
                authority for its believers, and it is clarified and supported by the teachings of
                the Prophet ﷺ. While the language of this particular revelation was Arabic, we also
                have many translations into different languages which help us to understand its
                meanings.
              </li>
              <li>
                Dhikr and Huda (Remembrance & Guidance): the Quran is used as a way to connect with
                God and keep Him in our hearts and on our tongues. It is also fundamentally a guide
                for our personal lives and for the life of the community and society.
              </li>
            </ol>
            <div>
              The Quran is the final revealed message which complements and completes earlier
              revealed scriptures, just as the Prophet Muhammad ﷺ taught the same essential message
              as the many prophets before him, including Adam, Noah, Moses, Abraham, and Jesus
              (peace be upon them all). The Quran clarifies what humanity needs to know from now
              until the Day of Judgment, and it will remain preserved from loss and distortion which
              affected previous scriptures in various ways.
            </div>
            <div className={pageStyles.verseContainer}>
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
            <div>
              We welcome you to Quran.com and invite you to read and listen to the Quran with an
              open heart, to deeply contemplate its verses, sincerely seek the knowledge contained
              within it, and to learn more using the resources on our site. We hope you will find
              Quran.com beneficial and pray that the message of the Quran will enrich your life's
              journey.
            </div>
          </div>
          <div className={styles.section}>
            <h1>What are some major themes in the Quran?</h1>
            <div>
              There are many themes and ideas explored in the Quran, but the major ones include:
            </div>
            <ul>
              <li>The Oneness of God</li>
              <li>The importance of worship and obedience to God</li>
              <li>The existence of an Afterlife and the Day of Judgment</li>
              <li>Guidance and wisdom for leading a righteous and moral life</li>
              <li>The creation of the universe and all living things</li>
              <li>The role of prophets and revelation in guiding humanity</li>
              <li>The consequences of good and evil actions</li>
              <li>The significance of social justice and fairness</li>
            </ul>
            <div>
              These themes are interwoven throughout the Quran and serve as a guide for believers on
              how to live their lives in accordance with the will of God.
            </div>
          </div>
          <div className={styles.section}>
            <h1>How do we know the Quran is authentic?</h1>
            <div>
              The Quran does not demand blind belief, but instead it invites all human beings to
              study, reflect and follow the evidence. These are some of the broad aspects which lead
              Muslims to be convinced of the truth and accuracy of the Quran as the revealed Word of
              God:
            </div>
            <ol>
              <li>
                Historical: material and living evidence points to the fact that the Quran has been
                transmitted both orally and in writing from the time of the Prophet Muhammad ﷺ, who
                announced at the age of forty (around 610 CE) that he was receiving revelation of
                these words from an angel sent by the One God. The content of this message together
                with the Prophet's impeccable character, integrity and credibility created a
                believing community, at first in Arabia, which carried the Quran to all parts of the
                world.
              </li>
              <li>
                Teachings: not only did the Quran create a revolution in the lives of the Arabs when
                it was revealed, but it continues to effect positive change for individuals and
                communities who follow its teachings. Together with the practical example and
                explanations of the Prophet ﷺ, the message is its own strongest proof that it comes
                from the Creator who knows what is best for creation.
              </li>
              <li>
                Miracles: the Quran declares itself inimitable, and those eloquent Arabs who at
                first opposed its message found themselves unable to meet the challenge to come up
                with anything like it. This points to what is known as the literary miracle of the
                Quran, which means a level of eloquence beyond human ability. However, there are
                many dimensions to what makes the Quran unique and miraculous, and more is
                discovered as human knowledge expands.
              </li>
            </ol>
          </div>
          <div className={styles.section}>
            <h1>Can the Quran be translated?</h1>
            <div>
              The global Muslim population is vast and diverse, reflecting the richness of the
              Islamic faith and its adaptability to different cultural contexts. Muslims come from
              different ethnicities, cultures, and languages, and are spread across every continent
              in the world. It is estimated that there are around 2 billion Muslims worldwide. The
              majority of Muslims live in Asia, with Indonesia being the country with the highest
              number of Muslims, followed by Pakistan, India, and Bangladesh. However, there are
              also significant Muslim populations in Africa, the Middle East, Europe, and North
              America.
            </div>
            <div>
              The Quran has been translated into over 100 different languages, and each translation
              can be considered its own interpretation of the original Arabic text. It is important
              to note, however, that the Quran is the word of God and is therefore sacred and
              unchangeable. As such, translations of the Quran are intended to convey the meaning of
              the original Arabic text as accurately as possible, but they may differ in their
              interpretation of certain passages.
            </div>
          </div>
          <div className={styles.section}>
            <h1>
              I have never read the Quran before. Do you have any suggestions on where I can start?
            </h1>
            <div className={styles.innerSection}>
              <i>Approach the Quran with an open mind and a willingness to learn</i>: It is
              important to approach the Quran with a positive attitude and a desire to understand
              its message. Try to put aside any preconceived notions or biases you may have, and
              approach the Quran with an open mind.
            </div>
          </div>
          <div className={styles.innerSection}>
            <h2>
              <u>Recommendation on where to begin:</u>
            </h2>
            <div>
              The first chapter of the Quran,{' '}
              <Link isNewTab href="/al-fatihah">
                Surah Al Fatiha
              </Link>{' '}
              , is a suitable place to begin your journey with the Quran.
            </div>
            <div>
              Surah Al-Fatiha is the first chapter of the Quran, and it is the most widely recited
              chapter in the Islamic faith. The Surah (chapter) is also known as the "Opening" or
              "Umm al-Kitab" (the Mother of the Book) due to its significance in the Quran.
            </div>
            <div>
              The Surah consists of seven verses, and it is recited several times a day during the
              formal five daily prayers. The Surah begins with the phrase
              "Bismillahir-Rahmanir-Rahim," which means "In the name of God, the Most Merciful, the
              Most Compassionate." This phrase is used to seek God's blessings before beginning any
              task.
            </div>
            <div>
              The Surah is divided into two parts. The first part is an introduction in which
              Muslims acknowledge God's Greatness, Power, and Mercy. The second part is a
              supplication in which Muslims ask for God's guidance, help, and protection from going
              astray.
            </div>
            <div>
              Surah Al-Fatiha is significant because it provides the foundation for Muslim prayer
              and is often the first portion of the Quran that is memorized by children and new
              Muslims around the world.
            </div>
            <div className={styles.innerSection}>
              <i className={styles.italicLarge}>
                Should I read the Quran from the beginning to the end?
              </i>
            </div>
            <div>
              While the Quran is compiled in a particular order, there is no strict requirement for
              a reader to follow that same order when reading it. In fact, the Quran itself does not
              specify a specific sequence in which its chapters must be read.
            </div>
            <div>
              Moreover, many verses of the Quran are self-contained, providing guidance and wisdom
              in and of themselves, without necessarily requiring the reader to have read previous
              or subsequent verses. This is because the Quran is a book of guidance, and each verse
              or surah (chapter) provides insight and wisdom that can be applied to various aspects
              of one's life.
            </div>
            <div>
              In addition, the Quranic chapters and verses were revealed over a period of 23 years,
              during which the Prophet Muhammad ﷺ recited and conveyed them to his followers as they
              were revealed. Thus, the chronological order in which the verses were revealed may not
              necessarily reflect their thematic order or their intended meaning.
            </div>
            <div>
              Therefore, it is perfectly acceptable for someone to read the Quran in a non-linear
              fashion, based on their interests, needs, or circumstances. For example, one may
              choose to read a particular surah for its uplifting and comforting message, or another
              for its practical guidance on a specific matter. Ultimately, the most important thing
              is to approach the Quran with an open mind, seeking guidance and wisdom from its
              verses, regardless of the order in which they are read.
            </div>
          </div>
          <div className={styles.section}>
            <h1>How can Quran.com help me on my Quran journey?</h1>
            <div>
              Quran.com is a comprehensive online platform that provides a range of features to help
              people explore and engage with the Quran.
            </div>
            <div>
              One of the most significant features of the website is its collection of translations
              of the Quran in various languages, allowing users to read and understand the Quran in
              a language they are most comfortable with. We also offer Tafsir, which are scholarly
              interpretations and explanations of the Quranic verses, making the meaning and context
              of the verses more accessible to readers.
            </div>
            <div>
              Another feature of Quran.com is the Reflections section, which provides a space for
              readers to engage with the Quranic text on a more personal level. This feature offers
              insightful and thought-provoking reflections on the verses, providing readers with a
              deeper understanding of the Quranic teachings and their relevance to contemporary
              issues.
            </div>
            <div>
              For those who prefer to listen to the recitation of the Quran, Quran.com offers a
              diverse library of Quranic recitations by renowned{' '}
              <Link href="/reciters" isNewTab>
                reciters
              </Link>{' '}
              from around the world. The website also provides advanced repeat options for users who
              are working on memorizing the Quran, helping them to easily repeat and practice
              specific verses.
            </div>
            <div>
              To further aid users in their understanding of the Quranic text, Quran.com provides
              word-by-word translations and audio, as well as a word tooltip feature that provides
              translations of individual words in the text. This makes the Quranic text more
              accessible and understandable to readers who are still learning the Arabic language.
            </div>
            <div>
              Additionally, Quran.com offers{' '}
              <Link href="/radio" isNewTab>
                QuranRadio
              </Link>
              , a streaming service that provides continuous recitation of the Quran, allowing users
              to listen to the Quran at any time.
            </div>
            <div>
              We hope you find these features beneficial as you explore the Quran. We strive to
              develop and refine our platform, incorporating user feedback and implementing new
              features that improve the learning experience. We are constantly researching and
              exploring new ways to help individuals who are seeking to learn and engage with the
              Quran.
            </div>
          </div>
          <div className={styles.ctaContainer}>
            <Button
              onClick={onStartReadingClicked}
              variant={ButtonVariant.Shadow}
              href="/al-fatihah"
              className={styles.button}
            >
              {t('about-quran-cta')}
            </Button>
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default AboutQuranPage;
