import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import SurahAndAyahSelection from '../TafsirView/SurahAndAyahSelection';
import TafsirVerseText from '../TafsirView/TafsirVerseText';

import ReflectionDisclaimerMessage from './ReflectionDisclaimerMessage';
import ReflectionItem from './ReflectionItem';

import { logItemSelectionChange } from 'src/utils/eventLogger';
import { fakeNavigate, getVerseSelectedReflectionNavigationUrl } from 'src/utils/navigation';
import getSampleVerse from 'src/utils/sampleVerse';
import { makeVerseKey } from 'src/utils/verse';

const sampleReflection = {
  authorName: 'Sheikh Osama',
  createdAt: '1 days ago',
  avatarUrl:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YXZhdGFyfGVufDB8fDB8fA%3D%3D&w=1000&q=80',
  // eslint-disable-next-line i18next/no-literal-string
  expandedText: `Maybe 3 years ago you helped someone who was really sad feel better. And you haven’t thought about that moment again, but in their story, it was pivotal.
Maybe 10 years ago you did something for a stranger which took a few extra minutes and has left your memory, but they still regale your act of kindness to others.
You might have forgotten. But God doesn't forget.
So when you’re sitting in a puddle of despising yourself- remember, He judges your intentions and records your actions from all of those years of good you’ve done even when it's passed and gone from your memory.
But it isn't gone from your record of good deeds. And the blessings of that action you don't even remember doing may still be yet to come in this life- and without doubt, when it's presented to you in the Next. less
`,
  // eslint-disable-next-line i18next/no-literal-string
  minimizedText: `If one is in the dark, physically or spiritually, what may they be feeling and what may they hope for ? Perhaps they feel lost, scared, alone, or uncertain and in turn, they are ...more`,
};

type ReflectionBodyProps = {
  initialChapterId: string;
  initialVerseNumber: string;
  scrollToTop: () => void;
  render: (renderProps: { surahAndAyahSelection: JSX.Element; body: JSX.Element }) => JSX.Element;
};

const ReflectionBody = ({ render, initialChapterId, initialVerseNumber }: ReflectionBodyProps) => {
  const [selecterChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const { lang } = useTranslation();

  const surahAndAyahSelection = (
    <SurahAndAyahSelection
      selectedChapterId={selecterChapterId}
      selectedVerseNumber={selectedVerseNumber}
      onChapterIdChange={(newChapterId) => {
        logItemSelectionChange('reflection_chapter_id', newChapterId);
        fakeNavigate(
          getVerseSelectedReflectionNavigationUrl(
            makeVerseKey(newChapterId, Number(selectedVerseNumber)),
          ),
          lang,
        );
        setSelectedChapterId(newChapterId.toString());
        setSelectedVerseNumber('1'); // reset verse number to 1 every time chapter changes
      }}
      onVerseNumberChange={(newVerseNumber) => {
        logItemSelectionChange('reflection_verse_number', newVerseNumber);
        fakeNavigate(
          getVerseSelectedReflectionNavigationUrl(
            makeVerseKey(Number(selecterChapterId), Number(selectedVerseNumber)),
          ),
          lang,
        );
        setSelectedVerseNumber(newVerseNumber);
      }}
    />
  );

  const { data } = useSWR(
    // eslint-disable-next-line i18next/no-literal-string
    `/api-path-to-reflection-content-${selecterChapterId}-${selectedVerseNumber}`,
    async () => {
      const sampleVerse = await getSampleVerse();
      const sampleReflections = Array(10)
        .fill(10)
        .map((reflection, index) => ({
          ...sampleReflection,
          id: index,
        }));

      return {
        reflections: sampleReflections,
        verses: {
          '1:2': sampleVerse,
        },
      };
    },
  );

  if (!data) return null;

  const body = (
    <div>
      <TafsirVerseText verses={data.verses} />
      <ReflectionDisclaimerMessage />
      {data.reflections.map((reflection) => (
        <ReflectionItem
          key={reflection.id}
          date={reflection.createdAt}
          authorName={reflection.authorName}
          reflectionText={reflection.expandedText}
          avatarUrl={reflection.avatarUrl}
        />
      ))}
    </div>
  );

  return render({ surahAndAyahSelection, body });
};

export default ReflectionBody;
