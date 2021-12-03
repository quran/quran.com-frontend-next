/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
import { selectIsSidebarNavigationVisible } from 'src/redux/slices/QuranReader/sidebarNavigation';
import { getAllChaptersData } from 'src/utils/chapter';
import { generateChapterVersesKeys, getVerseAndChapterNumbersFromKey } from 'src/utils/verse';

const SurahList = () => {
  const chaptersData = getAllChaptersData();
  return (
    <div>
      {Object.entries(chaptersData).map(([id, chapter]) => (
        <div>
          <Link href={`/${id}`}>{chapter.transliteratedName}</Link>
        </div>
      ))}
    </div>
  );
};

export const VerseList = () => {
  const chapterIds = useChapterIdsByUrlPath();
  if (!chapterIds || chapterIds.length === 0) return null;

  const chapterId = chapterIds[0];

  const verseKeys = generateChapterVersesKeys(chapterId[0]);

  return (
    <div>
      {verseKeys.map((verseKey) => {
        const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey);
        return (
          <div>
            <Link href={`/${chapter}/${verse}`}>{verseKey}</Link>
          </div>
        );
      })}
    </div>
  );
};

const SidebarNavigation = () => {
  const isVisible = useSelector(selectIsSidebarNavigationVisible);
  return (
    <div className={classNames(styles.container, { [styles.visibleContainer]: isVisible })}>
      <SurahList />
      <VerseList />
    </div>
  );
};

export default SidebarNavigation;
