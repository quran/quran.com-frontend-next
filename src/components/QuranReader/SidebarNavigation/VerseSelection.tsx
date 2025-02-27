import { useState, useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './SidebarNavigation.module.scss';
import SurahList from './SurahList';
import VerseList from './VerseList';

import useChapterIdsByUrlPath from '@/hooks/useChapterId';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';

type Props = {
  onAfterNavigationItemRouted?: () => void;
};

const VerseSelection: React.FC<Props> = ({ onAfterNavigationItemRouted }) => {
  const { lang } = useTranslation('common');
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
