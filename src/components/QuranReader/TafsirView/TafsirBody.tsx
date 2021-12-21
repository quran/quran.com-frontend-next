/* eslint-disable i18next/no-literal-string */
import { useCallback, useEffect, useState } from 'react';

import classNames from 'classnames';
import uniq from 'lodash/uniq';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import useSWR from 'swr/immutable';

import SurahAndAyahLanguageSelection from './SurahAyahLanguageSelection';
import TafsirGroupMessage from './TafsirGroupMessage';
import TafsirSelection from './TafsirSelection';
import TafsirSkeleton from './TafsirSkeleton';
import styles from './TafsirView.module.scss';

import { fetcher } from 'src/api';
import DataFetcher from 'src/components/DataFetcher';
import Separator from 'src/components/dls/Separator/Separator';
import VerseText from 'src/components/Verse/VerseText';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTafsirs, setSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getDefaultWordFields } from 'src/utils/api';
import { makeTafsirContentUrl, makeTafsirsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { getVerseWords, makeVerseKey } from 'src/utils/verse';
import { TafsirsResponse } from 'types/ApiResponses';

type TafsirBodyProps = {
  initialChapterId: string;
  initialVerseNumber: string;
  initialTafsirData?: TafsirsResponse;
  initialTafsirIds?: number[];
};

const TafsirBody = ({
  initialChapterId,
  initialVerseNumber,
  initialTafsirData,
  initialTafsirIds,
}: TafsirBodyProps) => {
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { lang } = useTranslation();
  const tafsirs = useSelector(selectSelectedTafsirs);

  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const [selectedLanguage, setSelectedLanguage] = useState(lang);
  const selectedTafsirs = useSelector(selectSelectedTafsirs, areArraysEqual);
  const selectedVerseKey = makeVerseKey(Number(selectedChapterId), Number(selectedVerseNumber));
  const [selectedTafsirId, setSelectedTafsirId] = useState(initialTafsirIds?.[0] || tafsirs?.[0]);

  const queryKey = makeTafsirContentUrl(selectedTafsirId, selectedVerseKey, {
    words: true,
    ...getDefaultWordFields(quranReaderStyles.quranFont),
  });

  const { data: tafsirListData } = useSWR<TafsirsResponse>(makeTafsirsUrl(lang), fetcher);
  useEffect(() => {
    if (tafsirListData) {
      const selectedTafsir = tafsirListData.tafsirs.find((tafsir) => tafsir.id === tafsirs[0]);
      setSelectedLanguage(selectedTafsir.languageName);
    }
  }, [tafsirListData, tafsirs]);

  // there's no 1:1 data that can map our locale options to the tafsir language options
  // so we're using options that's availbe from tafsir for now
  // TODO: update lanague options, to use the same options as our LanguageSelector
  const languageOptions = tafsirListData ? getTafsirsLanguageOptions(tafsirListData.tafsirs) : [];

  const renderTafsir = useCallback((data: TafsirsResponse) => {
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
  }, []);

  return (
    <div>
      <SurahAndAyahLanguageSelection
        selectedChapterId={selectedChapterId}
        selectedVerseNumber={selectedVerseNumber}
        selectedLanguage={selectedLanguage}
        onChapterIdChange={(val) => setSelectedChapterId(val.toString())}
        onVerseNumberChange={(val) => setSelectedVerseNumber(val)}
        onLanguageChange={(newLang) => setSelectedLanguage(newLang)}
        languageOptions={languageOptions}
      />
      <TafsirSelection
        selectedTafsirs={selectedTafsirs}
        selectedLanguage={selectedLanguage}
        onTafsirSelected={(id) => {
          setSelectedTafsirId(id);
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
        {initialTafsirData &&
        initialChapterId === selectedChapterId &&
        initialVerseNumber === selectedVerseNumber &&
        initialTafsirIds &&
        areArraysEqual(initialTafsirIds, tafsirs) ? (
          renderTafsir(initialTafsirData)
        ) : (
          <DataFetcher loading={TafsirSkeleton} queryKey={queryKey} render={renderTafsir} />
        )}
      </div>
    </div>
  );
};

const getTafsirsLanguageOptions = (tafsirs) => uniq(tafsirs.map((tafsir) => tafsir.languageName));

const getFromAndToVerseKeys = (verses) => {
  const verseKeys = Object.keys(verses);
  return { from: verseKeys[0], to: verseKeys[verseKeys.length - 1] };
};

export default TafsirBody;
