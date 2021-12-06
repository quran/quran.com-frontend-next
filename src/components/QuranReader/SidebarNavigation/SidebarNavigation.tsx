/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import Switch from 'src/components/dls/Switch/Switch';
import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
import {
  navigationItems,
  selectIsSidebarNavigationVisible,
  selectNavigationItem,
  selectSelectedNavigationItem,
  NavigationItem,
} from 'src/redux/slices/QuranReader/sidebarNavigation';
import { getAllChaptersData } from 'src/utils/chapter';
import { getJuzIds } from 'src/utils/juz';
import { getJuzNavigationUrl, getPageNavigationUrl } from 'src/utils/navigation';
import { getPageIds } from 'src/utils/page';
import { generateChapterVersesKeys, getVerseAndChapterNumbersFromKey } from 'src/utils/verse';

const SurahList = () => {
  const chaptersData = getAllChaptersData();
  return (
    <div className={styles.SurahListContainer}>
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
            <Link href={`/${chapter}/${verse}`}>{verse}</Link>
          </div>
        );
      })}
    </div>
  );
};

const SurahSelection = () => {
  return (
    <div className={styles.contentContainer}>
      <SurahList />
      <VerseList />
    </div>
  );
};

const JuzSelection = () => {
  const juzIds = getJuzIds();
  return (
    <div>
      {juzIds.map((juzId) => (
        <Link href={getJuzNavigationUrl(juzId)}>
          <div>{juzId}</div>
        </Link>
      ))}
    </div>
  );
};

const PageSelection = () => {
  const pageIds = getPageIds();
  return (
    <div>
      {pageIds.map((pageId) => (
        <Link href={getPageNavigationUrl(pageId)}>
          <div>{pageId}</div>
        </Link>
      ))}
    </div>
  );
};

const SidebarNavigation = () => {
  const isVisible = useSelector(selectIsSidebarNavigationVisible);
  const selectedNavigationItem = useSelector(selectSelectedNavigationItem);
  const dispatch = useDispatch();

  return (
    <div className={classNames(styles.container, { [styles.visibleContainer]: isVisible })}>
      <Switch
        items={navigationItems}
        selected={selectedNavigationItem}
        onSelect={(value) => {
          dispatch(selectNavigationItem(value));
        }}
      />
      {selectedNavigationItem === NavigationItem.Surah && <SurahSelection />}
      {selectedNavigationItem === NavigationItem.Juz && <JuzSelection />}
      {selectedNavigationItem === NavigationItem.Page && <PageSelection />}
    </div>
  );
};

export default SidebarNavigation;
