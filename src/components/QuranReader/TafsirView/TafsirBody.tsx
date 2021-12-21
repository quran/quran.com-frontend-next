/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import SurahAndAyahSelection from './SurahAndAyahSelection';
import TafsirGroupMessage from './TafsirGroupMessage';
import TafsirSelection from './TafsirSelection';
import TafsirSkeleton from './TafsirSkeleton';
import styles from './TafsirView.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Separator from 'src/components/dls/Separator/Separator';
import VerseText from 'src/components/Verse/VerseText';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTafsirs, setSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getDefaultWordFields } from 'src/utils/api';
import { makeTafsirContentUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { getVerseWords, makeVerseKey } from 'src/utils/verse';
import Verse from 'types/Verse';

type TafsirBodyProps = {
  verse: Verse;
};

const TafsirBody = ({ verse }: TafsirBodyProps) => {
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { lang } = useTranslation();
  const tafsirs = useSelector(selectSelectedTafsirs);

  const [selectedChapterId, setSelectedChapterId] = useState(verse.chapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(verse.verseNumber.toString());
  const selectedTafsirs = useSelector(selectSelectedTafsirs, areArraysEqual);
  const selectedVerseKey = makeVerseKey(Number(selectedChapterId), Number(selectedVerseNumber));
  const queryKey = makeTafsirContentUrl(tafsirs[0], selectedVerseKey, {
    // perPage: 1, // only 1 verse per page
    // translations: null,
    // wordFields: 'location, verse_key, text_uthmani',
    // tafsirFields: 'resource_name,language_name',
    words: true,
    ...getDefaultWordFields(quranReaderStyles.quranFont),
  });

  return (
    <div>
      <SurahAndAyahSelection
        selectedChapterId={selectedChapterId}
        selectedVerseNumber={selectedVerseNumber}
        onChapterIdChange={(val) => setSelectedChapterId(val.toString())}
        onVerseNumberChange={(val) => setSelectedVerseNumber(val)}
      />
      <TafsirSelection
        selectedTafsirs={selectedTafsirs}
        onTafsirSelected={(id) => {
          dispatch(
            setSelectedTafsirs({
              tafsirs: [id],
              locale: lang,
            }),
          );
        }}
      />
      <div
        className={classNames(
          styles.tafsirContainer,
          styles[`tafsir-font-size-${quranReaderStyles.tafsirFontScale}`],
        )}
      >
        <DataFetcher
          loading={TafsirSkeleton}
          queryKey={queryKey}
          render={(data) => {
            if (!data) return <TafsirSkeleton />;
            // @ts-ignore
            const tafsirVerses = data?.tafsir.verses;
            // @ts-ignore
            const htmlText = data?.tafsir.text;
            const words = Object.values(tafsirVerses).map(getVerseWords).flat();

            if (!htmlText) return <TafsirSkeleton />;

            return (
              <div>
                {Object.values(tafsirVerses).length > 1 && (
                  <TafsirGroupMessage {...getFromAndToVerseKeys(tafsirVerses)} />
                )}
                <div className={styles.verseTextContainer}>
                  <VerseText words={words} />
                </div>
                <div className={styles.separatorContainer}>
                  <Separator />
                </div>
                <div dangerouslySetInnerHTML={{ __html: htmlText }} />
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

const getFromAndToVerseKeys = (verses) => {
  const verseKeys = Object.keys(verses);
  return { from: verseKeys[0], to: verseKeys[verseKeys.length - 1] };
};

export default TafsirBody;
