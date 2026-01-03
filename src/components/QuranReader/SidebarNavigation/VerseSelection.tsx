import { useState, useEffect, useContext } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, useDispatch } from 'react-redux';

import styles from './SidebarNavigation.module.scss';
import SurahList from './SurahList';
import VerseList from './VerseList';

import DataContext from '@/contexts/DataContext';
import useChapterIdsByUrlPath from '@/hooks/useChapterId';
import {
  selectLastReadVerseKey,
  setLastReadVerse,
} from '@/redux/slices/QuranReader/readingTracker';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

type Props = {
  onAfterNavigationItemRouted?: (itemValue?: string, itemType?: string) => void;
};

const VerseSelection: React.FC<Props> = ({ onAfterNavigationItemRouted }) => {
  const { lang } = useTranslation('common');
  const dispatch = useDispatch();
  const chaptersData = useContext(DataContext);
  const router = useRouter();
  const chapterIds = useChapterIdsByUrlPath(lang);
  const urlChapterId = chapterIds && chapterIds.length > 0 ? chapterIds[0] : null;
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);

  // Default to the chapter from URL or last read chapter or chapter 1
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    urlChapterId || lastReadVerseKey.chapterId || '1',
  );

  useEffect(() => {
    // Update selected chapter when URL changes
    if (urlChapterId) {
      setSelectedChapterId(urlChapterId);
    }
  }, [urlChapterId]);

  // Custom handler for chapter selection that doesn't navigate immediately
  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapterId(chapterId);

    // Update the last read verse to the first verse of the selected chapter
    const verseKey = `${chapterId}:1`;
    dispatch(
      setLastReadVerse({
        lastReadVerse: {
          ...lastReadVerseKey,
          verseKey,
          chapterId,
        },
        chaptersData,
      }),
    );

    // Navigate to the relevant verse (defaults to 1 when needed)
    const href = getChapterWithStartingVerseUrl(verseKey);

    router.push(href, undefined, { shallow: false }).catch(() => {
      window.location.href = href;
    });
  };

  return (
    <div className={styles.surahBodyContainer}>
      <SurahList
        onAfterNavigationItemRouted={onAfterNavigationItemRouted}
        customChapterSelectHandler={handleChapterSelect}
        shouldDisableNavigation // Disable automatic navigation
        selectedChapterId={selectedChapterId}
      />
      <VerseList
        onAfterNavigationItemRouted={onAfterNavigationItemRouted}
        selectedChapterId={selectedChapterId}
      />
    </div>
  );
};

export default VerseSelection;
