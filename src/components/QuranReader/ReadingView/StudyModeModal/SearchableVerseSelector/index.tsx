/* eslint-disable max-lines */
import React, { useState, useCallback, useContext, useMemo, useRef, useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './SearchableVerseSelector.module.scss';

import DataContext from '@/contexts/DataContext';
import useOutsideClickDetector from '@/hooks/useOutsideClickDetector';
import CaretIcon from '@/icons/caret-down.svg';
import CloseIcon from '@/icons/close.svg';
import SearchIcon from '@/icons/search.svg';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';

type SelectionMode = 'none' | 'chapter' | 'verse';

interface SearchableVerseSelectorProps {
  selectedChapterId: string;
  selectedVerseNumber: string;
  onChapterChange: (chapterId: string) => void;
  onVerseChange: (verseNumber: string) => void;
}

const SearchableVerseSelector: React.FC<SearchableVerseSelectorProps> = ({
  selectedChapterId,
  selectedVerseNumber,
  onChapterChange,
  onVerseChange,
}) => {
  const { t, lang } = useTranslation('quran-reader');
  const { t: tCommon } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentChapter = chaptersData[Number(selectedChapterId)];
  const chapterDisplayText = currentChapter?.transliteratedName || `Surah ${selectedChapterId}`;
  const verseDisplayText = toLocalizedNumber(Number(selectedVerseNumber), lang);

  const handleClose = useCallback(() => {
    logButtonClick('study_mode_selector_close', { mode: selectionMode });
    setSelectionMode('none');
    setSearchQuery('');
  }, [selectionMode]);

  useOutsideClickDetector(containerRef, handleClose, selectionMode !== 'none');

  useEffect(() => {
    if (selectionMode !== 'none' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectionMode]);

  const filteredChapters = useMemo(() => {
    if (!chaptersData) return [];
    const query = searchQuery.toLowerCase().trim();
    return Object.entries(chaptersData)
      .filter(([id, chapter]) => {
        if (!query) return true;
        const chapterName = chapter.transliteratedName.toLowerCase();
        const localizedId = toLocalizedNumber(Number(id), lang);
        return chapterName.includes(query) || id.startsWith(query) || localizedId.startsWith(query);
      })
      .map(([id, chapter]) => ({
        id,
        name: chapter.transliteratedName,
        versesCount: chapter.versesCount,
        localizedId: toLocalizedNumber(Number(id), lang),
      }));
  }, [chaptersData, searchQuery, lang]);

  const verseOptions = useMemo(() => {
    if (!currentChapter) return [];
    const verses = [];
    for (let i = 1; i <= currentChapter.versesCount; i += 1) {
      verses.push({
        number: i,
        localizedNumber: toLocalizedNumber(i, lang),
      });
    }
    return verses;
  }, [currentChapter, lang]);

  const filteredVerses = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return verseOptions;
    return verseOptions.filter(
      (v) => v.number.toString().startsWith(query) || v.localizedNumber.startsWith(query),
    );
  }, [verseOptions, searchQuery]);

  const handleChapterClick = useCallback(() => {
    logButtonClick('study_mode_chapter_selector_open');
    setSelectionMode('chapter');
    setSearchQuery('');
  }, []);

  const handleVerseClick = useCallback(() => {
    logButtonClick('study_mode_verse_selector_open');
    setSelectionMode('verse');
    setSearchQuery('');
  }, []);

  const handleSelectChapter = useCallback(
    (chapterId: string) => {
      logValueChange('study_mode_chapter', selectedChapterId, chapterId);
      onChapterChange(chapterId);
      setSelectionMode('none');
      setSearchQuery('');
    },
    [onChapterChange, selectedChapterId],
  );

  const handleSelectVerse = useCallback(
    (verseNumber: number) => {
      logValueChange('study_mode_verse', selectedVerseNumber, verseNumber.toString(), {
        chapterId: selectedChapterId,
      });
      onVerseChange(verseNumber.toString());
      setSelectionMode('none');
      setSearchQuery('');
    },
    [onVerseChange, selectedVerseNumber, selectedChapterId],
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const isExpanded = selectionMode !== 'none';
  const isChapterMode = selectionMode === 'chapter';
  const title = isChapterMode ? t('select-chapter') : t('select-verses');

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.collapsedContainer}>
        <button type="button" className={styles.selectorButton} onClick={handleChapterClick}>
          <span className={styles.buttonText}>{chapterDisplayText}</span>
          <CaretIcon className={styles.caretIcon} />
        </button>
        <button type="button" className={styles.selectorButton} onClick={handleVerseClick}>
          <span className={styles.buttonText}>{verseDisplayText}</span>
          <CaretIcon className={styles.caretIcon} />
        </button>
      </div>

      {isExpanded && (
        <div className={styles.dropdownContainer}>
          <div className={styles.header}>
            <span className={styles.title}>{title}</span>
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleClose}
              aria-label={t('aria.close')}
            >
              <CloseIcon />
            </button>
          </div>

          <div className={styles.searchWrapper}>
            <SearchIcon className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder={tCommon('search.title')}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className={styles.listContainer}>
            {isChapterMode
              ? filteredChapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    type="button"
                    className={classNames(styles.listItem, {
                      [styles.selectedItem]: chapter.id === selectedChapterId,
                    })}
                    onClick={() => handleSelectChapter(chapter.id)}
                  >
                    {toLocalizedNumber(Number(chapter.id), lang)}. {chapter.name}
                  </button>
                ))
              : filteredVerses.map((verse) => (
                  <button
                    key={verse.number}
                    type="button"
                    className={classNames(styles.listItem, {
                      [styles.selectedItem]: verse.number.toString() === selectedVerseNumber,
                    })}
                    onClick={() => handleSelectVerse(verse.number)}
                  >
                    {verse.localizedNumber}
                  </button>
                ))}

            {((isChapterMode && filteredChapters.length === 0) ||
              (!isChapterMode && filteredVerses.length === 0)) && (
              // eslint-disable-next-line react/jsx-indent
              <div className={styles.noResults}>{tCommon('search.no-results')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableVerseSelector;
