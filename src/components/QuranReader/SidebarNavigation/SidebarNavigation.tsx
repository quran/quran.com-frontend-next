/* eslint-disable max-lines */
import { useState, useRef } from 'react';

import classNames from 'classnames';
import Fuse from 'fuse.js';
/* eslint-disable react/no-multi-comp */
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import IconClose from '../../../../public/icons/close.svg';

import styles from './SidebarNavigation.module.scss';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import Link from 'src/components/dls/Link/Link';
import Switch from 'src/components/dls/Switch/Switch';
import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import { selectContextMenu } from 'src/redux/slices/QuranReader/contextMenu';
import {
  navigationItems,
  selectIsSidebarNavigationVisible,
  selectNavigationItem,
  selectSelectedNavigationItem,
  NavigationItem,
  setIsVisible,
} from 'src/redux/slices/QuranReader/sidebarNavigation';
import { getAllChaptersData } from 'src/utils/chapter';
import { getJuzIds } from 'src/utils/juz';
import {
  getJuzNavigationUrl,
  getPageNavigationUrl,
  getVerseToEndOfChapterNavigationUrl,
} from 'src/utils/navigation';
import { getPageIds } from 'src/utils/page';
import { generateChapterVersesKeys, getVerseNumberFromKey } from 'src/utils/verse';
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
  const chapterIds = useChapterIdsByUrlPath();
  const currentChapterId = chapterIds[0];

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
    <div className={styles.surahListContainer}>
      <input
        className={styles.searchInput}
        id="translations-search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search Surah" // TODO: localize
      />
      <div className={styles.list}>
        {filteredChapters.map((chapter) => (
          <Link href={`/${chapter.id}`}>
            <div
              className={classNames(styles.listItem, {
                [styles.selectedItem]: chapter.id.toString() === currentChapterId,
              })}
            >
              {chapter.transliteratedName}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// by default, verse showing current surah
// if changed, show verse of the selected surah

export const VerseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const chapterIds = useChapterIdsByUrlPath();
  if (!chapterIds || chapterIds.length === 0) return null;

  const currentChapterId = chapterIds[0];

  const verseKeys = generateChapterVersesKeys(currentChapterId);

  return (
    <div className={styles.verseListContainer}>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
        placeholder="Verse" // TODO: localize
      />
      <div className={styles.list}>
        {verseKeys.map((verseKey) => {
          const verse = getVerseNumberFromKey(verseKey);
          if (!verse.toString().startsWith(searchQuery)) return null;
          return (
            <Link href={getVerseToEndOfChapterNavigationUrl(verseKey)}>
              <div className={styles.listItem}>{verse}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const SurahSelection = () => {
  return (
    <div className={styles.surahBodyContainer}>
      <SurahList />
      <VerseList />
    </div>
  );
};

const JuzSelection = () => {
  const juzIds = getJuzIds();
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div>
      <input
        className={styles.searchInput}
        id="translations-search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search Juz" // TODO: localize
      />
      <div>
        {juzIds.map((juzId) =>
          juzId.toString().startsWith(searchQuery) ? (
            <Link href={getJuzNavigationUrl(juzId)}>
              <div className={styles.listItem}>{juzId}</div>
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
      <input
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search Page" // TODO: localize
      />
      <div className={styles.list}>
        {pageIds.map((pageId) =>
          pageId.toString().startsWith(searchQuery) ? (
            <Link href={getPageNavigationUrl(pageId)}>
              <div className={styles.listItem}>{pageId}</div>
            </Link>
          ) : null,
        )}
      </div>
    </div>
  );
};

const SidebarNavigation = () => {
  const { isExpanded: isContextMenuExpanded } = useSelector(selectContextMenu, shallowEqual);
  const isVisible = useSelector(selectIsSidebarNavigationVisible);
  const selectedNavigationItem = useSelector(selectSelectedNavigationItem);
  const dispatch = useDispatch();
  const { t } = useTranslation('common');
  const sidebarRef = useRef();

  useOutsideClickDetector(
    sidebarRef,
    () => {
      dispatch(setIsVisible(false));
    },
    true,
    768,
  );

  return (
    <div
      ref={sidebarRef}
      className={classNames(styles.container, {
        [styles.visibleContainer]: isVisible,
        [styles.spaceOnTop]: isContextMenuExpanded,
      })}
    >
      <div className={styles.header}>
        <div className={styles.switchContainer}>
          <Switch
            items={navigationItems}
            selected={selectedNavigationItem}
            onSelect={(value) => {
              dispatch(selectNavigationItem(value));
            }}
          />
        </div>
        <Button
          tooltip={t('close')}
          shape={ButtonShape.Circle}
          variant={ButtonVariant.Ghost}
          onClick={() => {
            dispatch(setIsVisible(false));
          }}
        >
          <IconClose />
        </Button>
      </div>
      <div className={styles.contentContainer}>
        {selectedNavigationItem === NavigationItem.Surah && <SurahSelection />}
        {selectedNavigationItem === NavigationItem.Juz && <JuzSelection />}
        {selectedNavigationItem === NavigationItem.Page && <PageSelection />}
      </div>
    </div>
  );
};

export default SidebarNavigation;
