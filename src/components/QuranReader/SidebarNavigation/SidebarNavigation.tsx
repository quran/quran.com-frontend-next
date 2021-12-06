/* eslint-disable max-lines */
import { useState } from 'react';

import classNames from 'classnames';
import Fuse from 'fuse.js';
/* eslint-disable react/no-multi-comp */
import { useDispatch, useSelector } from 'react-redux';

import IconSearch from '../../../../public/icons/search.svg';

import styles from './SidebarNavigation.module.scss';

import Input from 'src/components/dls/Forms/Input';
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
import Chapter from 'types/Chapter';

const filterSurah = (surah, searchQuery: string) => {
  const fuse = new Fuse(surah, {
    threshold: 0.3,
    keys: ['id', 'transliteratedName'],
  });

  const filteredSurah = fuse.search(searchQuery).map(({ item }) => item);
  return filteredSurah as Chapter[];
};

const SurahList = () => {
  const chaptersData = getAllChaptersData();
  const [searchQuery, setSearchQuery] = useState('');

  const chapterDataArray = Object.entries(chaptersData).map(([id, chapter]) => ({
    ...chapter,
    id,
  }));
  const filteredChapters = searchQuery
    ? filterSurah(chapterDataArray, searchQuery)
    : chapterDataArray;
  return (
    <div>
      <Input
        prefix={<IconSearch />}
        id="translations-search"
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="search surah"
        fixedWidth={false}
      />
      <div className={styles.surahList}>
        {filteredChapters.map((chapter) => (
          <div>
            <Link href={`/${chapter.id}`}>{chapter.transliteratedName}</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export const VerseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const chapterIds = useChapterIdsByUrlPath();
  if (!chapterIds || chapterIds.length === 0) return null;

  const chapterId = chapterIds[0];

  const verseKeys = generateChapterVersesKeys(chapterId[0]);

  return (
    <div>
      <Input
        prefix={<IconSearch />}
        id="translations-search"
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="verse"
        fixedWidth={false}
      />
      <div className={styles.verseList}>
        {verseKeys.map((verseKey) => {
          const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey);
          if (!verse.startsWith(searchQuery)) return null;
          return (
            <div>
              <Link href={`/${chapter}/${verse}`}>{verse}</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SurahSelection = () => {
  return (
    <div>
      <div className={styles.contentContainer}>
        <SurahList />
        <VerseList />
      </div>
    </div>
  );
};

const JuzSelection = () => {
  const juzIds = getJuzIds();
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div>
      <Input
        prefix={<IconSearch />}
        id="translations-search"
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="search surah"
        fixedWidth={false}
      />
      <div>
        {juzIds.map((juzId) =>
          juzId.toString().startsWith(searchQuery) ? (
            <Link href={getJuzNavigationUrl(juzId)}>
              <div>{juzId}</div>
            </Link>
          ) : null,
        )}
      </div>
    </div>
  );
};

const PageSelection = () => {
  const pageIds = getPageIds();
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div>
      <Input
        prefix={<IconSearch />}
        id="translations-search"
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="search page"
        fixedWidth={false}
      />
      <div>
        {pageIds.map((pageId) =>
          pageId.toString().startsWith(searchQuery) ? (
            <Link href={getPageNavigationUrl(pageId)}>
              <div>{pageId}</div>
            </Link>
          ) : null,
        )}
      </div>
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
