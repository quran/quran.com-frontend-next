/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';
import { NextPage } from 'next';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import styles from '@/pages/contentPage.module.scss';
import pageStyles from '@/pages/ramadan/RamadanActivities.module.scss';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getTakeNotesNavigationUrl } from '@/utils/navigation';

const PATH = getTakeNotesNavigationUrl();
const TakeNotesPage: NextPage = (): JSX.Element => {
  const { lang } = useTranslation();

  const onLinkClicked = (section: string) => {
    logButtonClick(`${section}_take_notes_link`);
  };

  return (
    <>
      <NextSeoWrapper
        title="Take Notes on Quran.com – Enhance Your Quran Journey"
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description="Discover 6 powerful reasons to take notes on Quran.com and how notes can play a vital role in your Journey with the Quran."
      />
      <PageContainer>
        <div className={classNames(pageStyles.container, styles.contentPage)} dir="ltr">
          <div className={styles.subSection}>
            <h1>
              6 Powerful Reasons to Take Notes - And How They Can Transform Your Journey with the
              Quran
            </h1>
            <p className={styles.noMarginEnd}>
              <a href="#benefits">Benefits of Using the Notes Feature</a>
            </p>
            <ol className={styles.decimalList}>
              <li>
                <a href="#personal-reflection">Personal Reflection & Spiritual Growth</a>
              </li>
              <li>
                <a href="#organize-preserve">Organize and Preserve Your Study</a>
              </li>
              <li>
                <a href="#access-anywhere">Access Anywhere, Anytime</a>
              </li>
              <li>
                <a href="#enhanced-memorization">Enhanced Memorization & Revision</a>
              </li>
              <li>
                <a href="#share-reflections">Share your reflections so others can benefit</a>
              </li>
            </ol>
            <div className={styles.spacer} />
            <p>
              The Notes feature on Quran.com is a meaningful way to deepen your engagement with the
              Quran. It allows you to pause and capture reflections, questions, reminders, or
              anything that resonates with you - right alongside each verse. Whether you're studying
              for personal growth, preparing to teach, or simply exploring verses that speak to your
              heart, your notes stay organized and accessible at the ayah level, transforming your
              journey through the Quran into a more personal experience.
            </p>
            <div className={styles.imageContainer}>
              <Image
                src="/images/take-notes/image-1.png"
                alt="The notes feature available next to every ayah"
                className={styles.contentImage}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
              />
              <p className={styles.imageCaption}>
                The notes feature is available next to every ayah
              </p>
            </div>

            <h3>How to Use the Notes Feature</h3>
            <ol className={styles.decimalList}>
              <li>
                <strong>Select a Verse:</strong> Click on any verse and choose the Notes option.
              </li>
              <li>
                <strong>Add Your Thoughts:</strong> Type your reflections, reminders, or questions.
              </li>
              <li>
                <strong>Save:</strong> Your notes will be saved under your account.
              </li>
              <li>
                <strong>Access Anytime:</strong> Return to your notes via your profile or directly
                on the verse.
              </li>
            </ol>
            <div className={styles.imageContainer}>
              <Image
                src="/images/take-notes/image-2.png"
                alt="Adding notes to a verse"
                className={styles.contentImage}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <p>
              Once you save a note for a verse, the note icon will turn blue, making it easy to
              identify verses you've previously annotated during future readings.
            </p>
            <div className={styles.imageContainer}>
              <Image
                src="/images/take-notes/image-3.png"
                alt="Blue note icon indicating saved notes"
                className={styles.contentImage}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>

            <h3 id="benefits">Benefits of Using the Notes Feature</h3>
            <div className={styles.spacer} />
            <h4 id="personal-reflection">1. Personal Reflection & Spiritual Growth</h4>
            <p>
              How many times have you read or heard a verse that felt perfectly timed - only to
              forget it hours later? Taking a quick note helps anchor that thought that you may
              forget later.
            </p>
            <ul>
              <li>
                Jot down your thoughts, reflections, and realizations as you read the Quran - as
                simple or profound as they may be.
              </li>
              <li>
                Strengthen your relationship with the Quran by actively engaging with its verses
                rather than quickly reading without pause.
              </li>
            </ul>
            <p>Examples of notes:</p>
            <div className={styles.imageContainer}>
              <Image
                src="/images/take-notes/image-4.png"
                alt="Example of personal reflection notes"
                className={styles.contentImage}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <div className={styles.imageContainer}>
              <Image
                src="/images/take-notes/image-5.png"
                alt="Example of spiritual growth notes"
                className={styles.contentImage}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>

            <div className={styles.spacer} />
            <h4 id="organize-preserve">2. Organize and Preserve Your Study</h4>
            <p>
              Have you ever left a class or a lecture and forgotten all about the notes you
              scribbled down somewhere in a notebook, note app, or document? Imagine having access
              to every note you have taken on a verse easily accessible at the ayah level any time
              you read that verse again.
            </p>
            <div className={styles.imageContainer}>
              <Image
                src="/images/take-notes/image-6.png"
                alt="Organized notes at verse level"
                className={styles.contentImage}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <div className={styles.imageContainer}>
              <Image
                src="/images/take-notes/image-7.png"
                alt="Preserved study notes"
                className={styles.contentImage}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>

            <div className={styles.spacer} />
            <h4 id="access-anywhere">3. Access Anywhere, Anytime</h4>
            <p>Simply create a free log-in to start.</p>
            <ul>
              <li>Your notes are securely stored in your Quran.com account.</li>
              <li>Sync across devices—continue your study on mobile, tablet, or desktop.</li>
            </ul>

            <div className={styles.spacer} />
            <h4 id="enhanced-memorization">4. Enhanced Memorization & Revision</h4>
            <p>
              Whether you're actively memorizing or reviewing what you've learned, notes can be a
              powerful aid in memorization.
            </p>
            <ul>
              <li>Write explanations or reminders next to verses to aid memorization.</li>
              <li>Note difficult words or concepts for later review.</li>
              <li>Use notes to mark progress in memorization schedules.</li>
            </ul>
            <div className={styles.imageContainer}>
              <Image
                src="/images/take-notes/image-8.png"
                alt="Notes for memorization and revision"
                className={styles.contentImage}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>

            <div className={styles.spacer} />
            <h4 id="share-reflections">5. Share your reflections so others can benefit</h4>
            <p>
              While notes on Quran.com are saved privately, you also have the option to share
              selected reflections publicly on{' '}
              <a
                href="https://quranreflect.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClicked('quranreflect')}
              >
                QuranReflect.com
              </a>
              . This is a non-profit community platform designed to encourage thoughtful engagement
              with the Quran - not through scholarly tafsir (which is reserved for qualified
              scholars), but through sincere, personal reflections that are reviewed and guided by a
              qualified moderation team.
            </p>
            <p>Allah invites all believers, not only scholars, to engage in tadabbur:</p>
            <p style={{ textAlign: 'center' }}>
              <i>
                "This is˺ a blessed Book which We have revealed to you ˹O Prophet˺ so that they may
                contemplate its verses, and people of reason may be mindful." (Surah Sad 38:29)
              </i>
            </p>
            <p>Examples of Personal Reflection Questions that you can use to reflect:</p>
            <ul>
              <li>In what ways has this verse moved or inspired you?</li>
              <li>Are there qualities or actions mentioned that you can improve upon?</li>
              <li>Is there a promise or a warning/prohibition that you can apply to your life?</li>
              <li>Do you have a personal story related to this verse?</li>
              <li>
                What changes do you want to make based on this verse, and how can you or someone
                else practically implement them?
              </li>
            </ul>
            <div className={styles.spacer} />
            <p>Deeper Insights:</p>
            <ul>
              <li>Are there any names of Allah mentioned, and how do they relate to the verse?</li>
              <li>Which words or linguistic aspects caught your attention?</li>
              <li>
                Can you draw connections to the verse's context, other Quranic verses, hadith, or
                events?
              </li>
            </ul>
            <p>
              When shared, your reflections may resonate deeply with others and nurture a community
              of Quran-centered growth. Learn more at{' '}
              <a
                href="https://quranreflect.com/faq"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClicked('quranreflect_faq')}
              >
                QuranReflect.com/faq
              </a>{' '}
              and explore the{' '}
              <a
                href="https://quran.com/learning-plans/five-lenses-to-reflect-on-the-quran"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClicked('five_lenses')}
              >
                Five Lenses
              </a>{' '}
              to enrich your reflections.
            </p>

            <h3>Begin Your Journey Today</h3>
            <p>
              The Quran is a lifelong companion, and using the Notes feature can help you build a
              meaningful, interactive relationship with it. Use it to capture reflections, mark
              challenges, preserve insights, and more. Over time, it will become a personal record
              of your effort, sincerity, and growth with the Book of Allah, insha'Allah.
            </p>
            <p>
              We invite you to challenge yourself to connect with the Quran daily - even if just a
              verse - and take a moment to reflect and write a note.{' '}
              <span style={{ fontWeight: 'var(--font-weight-bold)', lineHeight: 'inherit' }}>
                Let this small, consistent act become a means of deepening your relationship with
                the Book of Allah, one ayah at a time.
              </span>
            </p>
            <p>
              May Allah make the Quran the light of your chest, the springtime of your heart, the
              remover of your sorrows, and the reliever of your distress. Ameen.
            </p>
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default TakeNotesPage;
