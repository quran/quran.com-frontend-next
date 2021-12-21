/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import SurahAndAyahSelection from './SurahAndAyahSelection';
import TafsirSelection from './TafsirSelection';
import styles from './TafsirView.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Separator from 'src/components/dls/Separator/Separator';
import Spinner from 'src/components/dls/Spinner/Spinner';
import VerseText from 'src/components/Verse/VerseText';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTafsirs, setSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getDefaultWordFields } from 'src/utils/api';
import { makeVersesUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { getVerseWords } from 'src/utils/verse';
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
  const queryKey = makeVersesUrl(selectedChapterId, lang, {
    page: selectedVerseNumber, // we pass the verse id as a the page and then fetch only 1 verse per page.
    perPage: 1, // only 1 verse per page
    translations: null,
    tafsirs: [tafsirs],
    wordFields: 'location, verse_key, text_uthmani',
    tafsirFields: 'resource_name,language_name',
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
          queryKey={queryKey}
          render={(data) => {
            // @ts-ignore
            const tafsirVerse = data?.verses[0];
            const tafsirsData = tafsirVerse?.tafsirs;

            if (!tafsirsData) return <Spinner />;
            return (
              <div>
                <div className={styles.verseTextContainer}>
                  <VerseText words={getVerseWords(tafsirVerse)} />
                </div>
                <div className={styles.separatorContainer}>
                  <Separator />
                </div>

                {tafsirsData?.map((tafsir) => (
                  <div key={tafsir.id} dangerouslySetInnerHTML={{ __html: tafsir.text }} />
                ))}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default TafsirBody;
