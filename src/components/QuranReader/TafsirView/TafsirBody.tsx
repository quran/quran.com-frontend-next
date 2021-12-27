/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
import { useCallback, useEffect, useState } from 'react';

import classNames from 'classnames';
import uniq from 'lodash/uniq';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import useSWR from 'swr/immutable';

import LanguageAndTafsirSelection from './LanguageAndTafsirSelection';
import SurahAndAyahSelection from './SurahAndAyahSelection';
import TafsirGroupMessage from './TafsirGroupMessage';
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
import { fakeNavigate, getVerseTafsirNavigationUrl } from 'src/utils/navigation';
import { getFirstAndLastVerseKeys, getVerseWords, makeVerseKey } from 'src/utils/verse';
import { TafsirsResponse } from 'types/ApiResponses';

type TafsirBodyProps = {
  initialChapterId: string;
  initialVerseNumber: string;
  initialTafsirData?: TafsirsResponse;
  initialTafsirId?: number;
};

const TafsirBody = ({
  initialChapterId,
  initialVerseNumber,
  initialTafsirData,
  initialTafsirId,
}: TafsirBodyProps) => {
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { lang } = useTranslation();
  const userPreferredTafsirIds = useSelector(selectSelectedTafsirs, areArraysEqual);

  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const selectedVerseKey = makeVerseKey(Number(selectedChapterId), Number(selectedVerseNumber));
  const [selectedTafsirId, setSelectedTafsirId] = useState(userPreferredTafsirIds?.[0]);

  // if user opened tafsirBody via a url, we will have initialTafsirId
  // we need to set this `initialTafsirId` as a selectedTafsirId
  // we did not use `useState(initialTafsirId)` because `useRouter`'s query string is undefined on first render
  useEffect(() => {
    if (initialTafsirId) {
      setSelectedTafsirId(initialTafsirId);
    }
  }, [initialTafsirId]);

  const onTafsirSelected = useCallback(
    (id: number) => {
      setSelectedTafsirId(id);
      fakeNavigate(
        getVerseTafsirNavigationUrl(
          Number(selectedChapterId),
          Number(selectedVerseNumber),
          id.toString(),
        ),
      );
      dispatch(
        setSelectedTafsirs({
          tafsirs: [id],
          locale: lang,
        }),
      );
    },
    [dispatch, lang, selectedChapterId, selectedVerseNumber],
  );

  const { data: tafsirListData } = useSWR<TafsirsResponse>(makeTafsirsUrl(lang), fetcher);

  // selectedLanguage is based on selectedTafir's language
  // but we need to fetch the data from the API first to know what is the lanaguage of `selectedTafsirId`
  // so we get the data from the API and set the selectedLanguage once it is loaded
  useEffect(() => {
    if (tafsirListData) {
      const languageName = getSelectedTafsirLanguage(tafsirListData, selectedTafsirId);
      setSelectedLanguage(languageName);
    }
  }, [onTafsirSelected, selectedTafsirId, tafsirListData]);

  // there's no 1:1 data that can map our locale options to the tafsir language options
  // so we're using options that's available from tafsir for now
  // TODO: update lanague options, to use the same options as our LanguageSelector
  const languageOptions = tafsirListData ? getTafsirsLanguageOptions(tafsirListData.tafsirs) : [];

  const selectedTafsirLanguage = getSelectedTafsirLanguage(tafsirListData, selectedTafsirId);

  const renderTafsir = useCallback(
    (data) => {
      if (!data) return <TafsirSkeleton />;
      const tafsirVerses = data?.tafsir.verses;
      const htmlText = data?.tafsir.text;
      const words = Object.values(tafsirVerses).map(getVerseWords).flat();

      if (!htmlText) return <TafsirSkeleton />;

      const [firstVerseKey, lastVerseKey] = getFirstAndLastVerseKeys(tafsirVerses);
      return (
        <div>
          {Object.values(tafsirVerses).length > 1 && (
            <TafsirGroupMessage from={firstVerseKey} to={lastVerseKey} />
          )}
          <div className={styles.verseTextContainer}>
            <VerseText words={words} />
          </div>
          <div className={styles.separatorContainer}>
            <Separator />
          </div>
          <div
            dir={isRTLLanguage(selectedTafsirLanguage) ? 'rtl' : 'ltr'}
            dangerouslySetInnerHTML={{ __html: htmlText }}
          />
        </div>
      );
    },
    [selectedTafsirLanguage],
  );

  const tafsirContentQuerykey = makeTafsirContentUrl(selectedTafsirId, selectedVerseKey, {
    words: true,
    ...getDefaultWordFields(quranReaderStyles.quranFont),
  });

  return (
    <div>
      <SurahAndAyahSelection
        selectedChapterId={selectedChapterId}
        selectedVerseNumber={selectedVerseNumber}
        onChapterIdChange={(newChapterId) => {
          fakeNavigate(
            getVerseTafsirNavigationUrl(
              Number(newChapterId),
              Number(1),
              selectedTafsirId.toString(),
            ),
          );
          setSelectedChapterId(newChapterId.toString());
          setSelectedVerseNumber('1'); // reset verse number to 1 every time chapter changes
        }}
        onVerseNumberChange={(newVerseNumber) => {
          setSelectedVerseNumber(newVerseNumber);
          fakeNavigate(
            getVerseTafsirNavigationUrl(
              Number(selectedChapterId),
              Number(newVerseNumber),
              selectedTafsirId.toString(),
            ),
          );
        }}
      />
      <LanguageAndTafsirSelection
        selectedTafsirId={selectedTafsirId}
        selectedLanguage={selectedLanguage}
        onTafsirSelected={onTafsirSelected}
        onSelectLanguage={(newLang) => {
          setSelectedLanguage(newLang);
        }}
        languageOptions={languageOptions}
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
        initialTafsirId === selectedTafsirId ? (
          renderTafsir(initialTafsirData)
        ) : (
          <DataFetcher
            loading={TafsirSkeleton}
            queryKey={tafsirContentQuerykey}
            render={renderTafsir}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Given list of tafsirs, get all available language options
 *
 * @param {Tafsir[]} tafsirs
 * @returns {string[]} list of available language options
 */
const getTafsirsLanguageOptions = (tafsirs): string[] =>
  uniq(tafsirs.map((tafsir) => tafsir.languageName));

export default TafsirBody;

const getSelectedTafsirLanguage = (tafsirListData, selectedTafsirId) => {
  const selectedTafsir = tafsirListData?.tafsirs.find((tafsir) => tafsir.id === selectedTafsirId);
  return selectedTafsir?.languageName;
};

const rtlLanguage = ['arabic', 'urdu'];
const isRTLLanguage = (lang: string) => {
  return rtlLanguage.includes(lang);
};
